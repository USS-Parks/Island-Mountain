"""NVIDIA NOOA interface for the deterministic campaign publisher."""

from __future__ import annotations

import subprocess
import urllib.error
import urllib.request
from collections.abc import Callable
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


class BlogNotLiveError(RuntimeError):
    """The blog article is not live; LinkedIn must not point at a missing page."""


_BROWSER_UA = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/126.0 Safari/537.36"
)


def _blog_http_status(url: str) -> int:
    # Cloudflare 403s the default Python-urllib user-agent as a bot; browsers and the
    # LinkedIn crawler get 200. Probe with a browser UA so liveness reflects reality.
    request = urllib.request.Request(url, method="GET", headers={"User-Agent": _BROWSER_UA})
    with urllib.request.urlopen(request, timeout=20) as response:
        return int(response.status)


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

    def _require_main_branch(self) -> None:
        branch = self._git("rev-parse", "--abbrev-ref", "HEAD")
        if branch != "main":
            raise ProductionModeRequired(
                f"repository is on {branch!r}; publication commits only on main"
            )

    def _push(self) -> None:
        self._git("push", "origin", "main")

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
        self._require_main_branch()
        WorkspaceTransaction(GitWorkspace(self._repository_root), planned).apply()
        paths = tuple(file.path for file in planned)
        # Stage (tracks new files) then commit ONLY our own paths: a pathspec-scoped
        # commit ignores anything else left staged in the index, so leftover state from
        # another session can never be swept into a publication commit.
        self._git("add", "--", *paths)
        self._git("commit", "-m", f"Publish {campaign_id}: {item.campaign.title}", "--", *paths)
        self._push()
        return self._git("rev-parse", "HEAD")

    def _require_production(self) -> None:
        if self.mode != "production":
            raise ProductionModeRequired("publication requires PUBLISH_ENABLED=true")

    def _require_blog_live(
        self, item: ManifestItem, http_status: Callable[[str], int] = _blog_http_status
    ) -> None:
        """Fail closed: never let LinkedIn point at an article that is not live."""
        try:
            status = http_status(item.blog_url)
        except Exception as exc:  # DNS, TLS, timeout: all mean not live
            raise BlogNotLiveError(
                f"{item.blog_url} unreachable ({exc}); refusing to post LinkedIn"
            ) from exc
        if status != 200:
            raise BlogNotLiveError(
                f"{item.blog_url} returned HTTP {status}; refusing to post LinkedIn "
                "until the article is live"
            )

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
        self._require_blog_live(item)
        post_urn = self._existing_remote(campaign_id, MutationKind.LINKEDIN_POST)
        if post_urn is None:
            image = self._linkedin.upload_image(item)
            self._ledger.append(image)
            post = self._linkedin.create_post(item, image.remote_id)
            self._ledger.append(post)
            post_urn = post.remote_id
        comment = self._linkedin.create_comment(item, post_urn)
        self._ledger.append(comment)
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
