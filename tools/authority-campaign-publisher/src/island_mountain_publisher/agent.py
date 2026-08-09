"""NVIDIA NOOA interface for the deterministic campaign publisher."""

from __future__ import annotations

import subprocess
from datetime import UTC, datetime
from pathlib import Path
from typing import Annotated, Literal
from zoneinfo import ZoneInfo

from nooa import Agent, hidden
from nooa.storage.markers import nosnapshot
from nooa.unifiedllm import FakeLLMClient
from pydantic import BaseModel, ConfigDict

from .approvals import validate_approval
from .authority import (
    LinkedInMutationClient,
    MutationKind,
    ProductionModeRequired,
)
from .discovery import plan_blog_publication
from .ledger import JsonlLedger
from .models import ApprovalBundle, CampaignManifest, ManifestItem
from .renderer import render_article
from .workspace import GitWorkspace, WorkspaceTransaction


class AgentStatus(BaseModel):
    """Credential-free status returned by the no-op agent surface."""

    model_config = ConfigDict(frozen=True)

    mode: Literal["dry-run", "production"]
    manifest_sha256: str
    item_count: int
    approval_count: int


class AuthorityCampaignPublisher(Agent, llm=FakeLLMClient()):  # type: ignore[call-arg]
    """Publish only prewritten, hash-approved Island Mountain campaign packets.

    Every authoritative method has an ordinary Python body. The configured NOOA
    client is deterministic and credential-free; it cannot generate or authorize
    a production mutation.
    """

    manifest: CampaignManifest
    approvals: ApprovalBundle
    mode: Literal["dry-run", "production"]
    _repository_root: Annotated[Path | None, hidden, nosnapshot]
    _linkedin: Annotated[LinkedInMutationClient | None, hidden, nosnapshot]
    _ledger: Annotated[JsonlLedger | None, hidden, nosnapshot]

    def __init__(
        self,
        manifest: CampaignManifest,
        approvals: ApprovalBundle,
        *,
        mode: Literal["dry-run", "production"] = "dry-run",
        repository_root: Path | None = None,
        linkedin: LinkedInMutationClient | None = None,
        ledger: JsonlLedger | None = None,
    ) -> None:
        super().__init__()
        self.manifest = manifest
        self.approvals = approvals
        self.mode = mode
        self._repository_root = repository_root
        self._linkedin = linkedin
        self._ledger = ledger

    def status(self) -> AgentStatus:
        """Return typed local state without contacting a model or remote service."""

        manifest_sha256 = self.manifest.manifest_sha256
        if manifest_sha256 is None:
            raise ValueError("manifest is missing its hash")
        return AgentStatus(
            mode=self.mode,
            manifest_sha256=manifest_sha256,
            item_count=len(self.manifest.items),
            approval_count=len(self.approvals.records),
        )

    def validate_item(self, campaign_id: str) -> None:
        """Fail closed unless one exact item has an approved current packet."""

        validate_approval(self.manifest, self.approvals, campaign_id)

    def _approved_item(self, campaign_id: str) -> ManifestItem:
        validate_approval(self.manifest, self.approvals, campaign_id)
        for item in self.manifest.items:
            if item.campaign.campaign_id == campaign_id:
                return item
        raise ValueError(f"manifest item not found: {campaign_id}")

    def _git(self, *arguments: str) -> str:
        if self._repository_root is None:
            raise ProductionModeRequired("repository root was not configured")
        completed = subprocess.run(
            ("git", *arguments),
            cwd=self._repository_root,
            check=True,
            capture_output=True,
            text=True,
            encoding="utf-8",
        )
        return completed.stdout.strip()

    def _push(self) -> None:
        self._git("push", "origin", "HEAD:main")

    def _existing_remote(self, campaign_id: str, kind: MutationKind) -> str | None:
        if self._ledger is None:
            return None
        for event in reversed(self._ledger.read()):
            if (
                event.campaign_id == campaign_id
                and event.evidence.get("kind") == kind.value
            ):
                return event.evidence.get("remote_id")
        return None

    def _save_linkedin_state(self, campaign_id: str, phase: str) -> None:
        if self._ledger is None or self._repository_root is None:
            raise ProductionModeRequired("publication ledger was not configured")
        relative = self._ledger.path.relative_to(self._repository_root).as_posix()
        self._git("add", "--", relative)
        self._git(
            "commit",
            "-m",
            f"Record {campaign_id} LinkedIn {phase} [skip ci]",
        )
        self._push()

    @hidden
    def publish_blog(self, campaign_id: str) -> str:
        """Render, commit, and push one approved blog item."""

        item = self._approved_item(campaign_id)
        self._require_production()
        if self._repository_root is None:
            raise ProductionModeRequired("repository root was not configured")
        rendered = render_article(
            item,
            self._repository_root
            / "tools"
            / "authority-campaign-publisher"
            / "templates"
            / "blog-post.html",
        )
        planned = plan_blog_publication(
            self._repository_root,
            item,
            rendered,
            adopt_existing=campaign_id == "p01",
        )
        if not planned:
            return "already-published"
        WorkspaceTransaction(GitWorkspace(self._repository_root), planned).apply()
        paths = tuple(file.path for file in planned)
        self._git("add", "--", *paths)
        self._git("commit", "-m", f"Publish {campaign_id}: {item.campaign.title}")
        self._push()
        return self._git("rev-parse", "HEAD")

    def _require_production(self) -> None:
        if self.mode != "production":
            raise ProductionModeRequired("publication requires PUBLISH_ENABLED=true")

    @hidden
    def publish_linkedin(self, campaign_id: str) -> str:
        """Publish the approved summary, matching card, and article comment."""

        item = self._approved_item(campaign_id)
        self._require_production()
        if self._linkedin is None or self._ledger is None:
            raise ProductionModeRequired("LinkedIn credentials and ledger were not configured")
        existing_comment = self._existing_remote(campaign_id, MutationKind.LINKEDIN_COMMENT)
        if existing_comment:
            return existing_comment
        post_urn = self._existing_remote(campaign_id, MutationKind.LINKEDIN_POST)
        if post_urn is None:
            image = self._linkedin.upload_image(item)
            self._ledger.append(image)
            post = self._linkedin.create_post(item, image.remote_id)
            self._ledger.append(post)
            post_urn = post.remote_id
            self._save_linkedin_state(campaign_id, "post")
        comment = self._linkedin.create_comment(item, post_urn)
        self._ledger.append(comment)
        self._save_linkedin_state(campaign_id, "comment")
        return post_urn

    def run_due(self, now: datetime | None = None) -> tuple[str, ...]:
        """Run today's due lane; repeated scheduler calls are safe no-ops."""

        pacific = ZoneInfo("America/Los_Angeles")
        current = (now or datetime.now(UTC)).astimezone(pacific)
        actions: list[str] = []
        for item in self.manifest.items:
            if item.campaign.publish_date != current.date():
                continue
            campaign_id = item.campaign.campaign_id
            if current >= item.schedule.blog_at:
                if self.mode == "production":
                    result = self.publish_blog(campaign_id)
                    actions.append(f"blog:{campaign_id}:{result}")
                else:
                    actions.append(f"blog:{campaign_id}:due")
            linkedin_cutoff = item.schedule.linkedin_at.replace(
                hour=8,
                minute=1,
                second=0,
                microsecond=0,
            )
            if item.schedule.linkedin_at <= current < linkedin_cutoff:
                if self.mode == "production":
                    result = self.publish_linkedin(campaign_id)
                    actions.append(f"linkedin:{campaign_id}:{result}")
                else:
                    actions.append(f"linkedin:{campaign_id}:due")
        return tuple(actions)
