"""Credential-free interfaces at the publisher's mutation boundary."""

from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Protocol

from pydantic import BaseModel, ConfigDict, Field

from .models import ManifestItem


class ProductionModeRequired(PermissionError):
    """A remote or repository write was attempted outside production mode."""


class MutationKind(StrEnum):
    LINKEDIN_IMAGE = "linkedin_image"
    LINKEDIN_POST = "linkedin_post"
    LINKEDIN_COMMENT = "linkedin_comment"


class MutationReceipt(BaseModel):
    """Typed result returned by a deterministic mutation client."""

    model_config = ConfigDict(frozen=True)

    campaign_id: str = Field(pattern=r"^p\d{2}$")
    kind: MutationKind
    remote_id: str = Field(min_length=1)
    occurred_at: datetime


class LinkedInMutationClient(Protocol):
    def upload_image(self, item: ManifestItem) -> MutationReceipt:
        raise NotImplementedError

    def create_post(self, item: ManifestItem, image_urn: str) -> MutationReceipt:
        raise NotImplementedError

    def create_comment(self, item: ManifestItem, post_urn: str) -> MutationReceipt:
        raise NotImplementedError
