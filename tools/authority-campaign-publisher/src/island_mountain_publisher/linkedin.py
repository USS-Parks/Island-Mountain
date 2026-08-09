"""Small LinkedIn REST client used by the NOOA publisher."""

from __future__ import annotations

import json
import time
import urllib.parse
import urllib.request
from collections.abc import Callable
from datetime import UTC, datetime
from pathlib import Path
from typing import Any

from .authority import MutationKind, MutationReceipt
from .models import ManifestItem


class LinkedInError(RuntimeError):
    """LinkedIn rejected or did not confirm a publication step."""


class LinkedInClient:
    """Upload one card, publish its summary, then add the article comment."""

    def __init__(
        self,
        repository_root: Path,
        access_token: str,
        actor_urn: str,
        api_version: str,
        *,
        sleep: Callable[[float], None] = time.sleep,
    ) -> None:
        if not actor_urn.startswith("urn:li:person:"):
            raise LinkedInError("LINKEDIN_ACTOR_URN must identify Basho's person account")
        self.repository_root = repository_root
        self.access_token = access_token
        self.actor_urn = actor_urn
        self.api_version = api_version
        self.sleep = sleep

    def _headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self.access_token}",
            "LinkedIn-Version": self.api_version,
            "X-Restli-Protocol-Version": "2.0.0",
            "Content-Type": "application/json",
        }

    def _request(
        self,
        method: str,
        url: str,
        payload: dict[str, Any] | bytes | None = None,
        *,
        headers: dict[str, str] | None = None,
    ) -> tuple[dict[str, Any], dict[str, str]]:
        body = (
            json.dumps(payload).encode("utf-8")
            if isinstance(payload, dict)
            else payload
        )
        request = urllib.request.Request(
            url,
            data=body,
            method=method,
            headers=headers or self._headers(),
        )
        try:
            with urllib.request.urlopen(request, timeout=45) as response:
                raw = response.read()
                parsed = json.loads(raw) if raw else {}
                return parsed, {key.lower(): value for key, value in response.headers.items()}
        except Exception as exc:
            raise LinkedInError(f"LinkedIn {method} did not complete: {url}") from exc

    def upload_image(self, item: ManifestItem) -> MutationReceipt:
        if item.campaign.card_path is None:
            raise LinkedInError(f"{item.campaign.campaign_id} has no card")
        initialized, _ = self._request(
            "POST",
            "https://api.linkedin.com/rest/images?action=initializeUpload",
            {"initializeUploadRequest": {"owner": self.actor_urn}},
        )
        value = initialized.get("value", {})
        upload_url = value.get("uploadUrl")
        image_urn = value.get("image")
        if not upload_url or not image_urn:
            raise LinkedInError("LinkedIn did not return an image upload target")
        card = (self.repository_root / item.campaign.card_path).read_bytes()
        self._request(
            "PUT",
            str(upload_url),
            card,
            headers={
                "Authorization": f"Bearer {self.access_token}",
                "Content-Type": "application/octet-stream",
            },
        )
        encoded = urllib.parse.quote(str(image_urn), safe="")
        for _attempt in range(12):
            image, _ = self._request(
                "GET",
                f"https://api.linkedin.com/rest/images/{encoded}",
            )
            if image.get("status") == "AVAILABLE":
                return MutationReceipt(
                    campaign_id=item.campaign.campaign_id,
                    kind=MutationKind.LINKEDIN_IMAGE,
                    remote_id=str(image_urn),
                    occurred_at=datetime.now(UTC),
                )
            self.sleep(5)
        raise LinkedInError("LinkedIn image did not become available")

    def create_post(self, item: ManifestItem, image_urn: str) -> MutationReceipt:
        commentary = "\n\n".join(
            (
                item.campaign.linkedin_summary,
                " ".join(item.campaign.linkedin_hashtags),
            )
        )
        _body, headers = self._request(
            "POST",
            "https://api.linkedin.com/rest/posts",
            {
                "author": self.actor_urn,
                "commentary": commentary,
                "visibility": "PUBLIC",
                "distribution": {
                    "feedDistribution": "MAIN_FEED",
                    "targetEntities": [],
                    "thirdPartyDistributionChannels": [],
                },
                "content": {
                    "media": {
                        "id": image_urn,
                        "title": item.campaign.title,
                        "altText": item.alt_text,
                    }
                },
                "lifecycleState": "PUBLISHED",
                "isReshareDisabledByAuthor": False,
            },
        )
        post_urn = headers.get("x-restli-id")
        if not post_urn:
            raise LinkedInError("LinkedIn created no identifiable post")
        return MutationReceipt(
            campaign_id=item.campaign.campaign_id,
            kind=MutationKind.LINKEDIN_POST,
            remote_id=post_urn,
            occurred_at=datetime.now(UTC),
        )

    def create_comment(self, item: ManifestItem, post_urn: str) -> MutationReceipt:
        encoded = urllib.parse.quote(post_urn, safe="")
        _body, headers = self._request(
            "POST",
            f"https://api.linkedin.com/rest/socialActions/{encoded}/comments",
            {
                "actor": self.actor_urn,
                "message": {"text": item.linkedin_first_comment},
            },
        )
        comment_id = headers.get("x-restli-id")
        if not comment_id:
            raise LinkedInError("LinkedIn created no identifiable first comment")
        return MutationReceipt(
            campaign_id=item.campaign.campaign_id,
            kind=MutationKind.LINKEDIN_COMMENT,
            remote_id=comment_id,
            occurred_at=datetime.now(UTC),
        )
