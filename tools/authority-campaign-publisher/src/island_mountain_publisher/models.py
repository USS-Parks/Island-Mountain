"""Typed, deterministic campaign records."""

from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field, field_validator


class CampaignItem(BaseModel):
    """One immutable article/feed-post pair parsed from the canonical Markdown."""

    model_config = ConfigDict(frozen=True)

    campaign_id: str = Field(pattern=r"^p\d{2}$")
    ordinal: int = Field(ge=1, le=30)
    title: str = Field(min_length=1)
    publish_date: date
    source_idea: int = Field(ge=1)
    icon_source: str = Field(min_length=1)
    delivery_form: str = Field(min_length=1)
    first_comment: str = Field(min_length=1)
    long_form_article: str = Field(min_length=1)
    article_hashtags: tuple[str, ...] = Field(min_length=1)
    linkedin_summary: str = Field(min_length=1)
    linkedin_hashtags: tuple[str, ...] = Field(min_length=1)
    utm_content: str = Field(pattern=r"^p\d{2}$")
    source_file: str = Field(pattern=r"^WEEK-[1-6]\.md$")
    card_path: str | None = None

    @field_validator(
        "title",
        "icon_source",
        "delivery_form",
        "first_comment",
        "long_form_article",
        "linkedin_summary",
    )
    @classmethod
    def reject_outer_whitespace(cls, value: str) -> str:
        if value != value.strip():
            raise ValueError("campaign text must not contain outer whitespace")
        return value


class PublicationSchedule(BaseModel):
    """Manifest-fixed publication instants expressed with timezone offsets."""

    model_config = ConfigDict(frozen=True)

    timezone: str = "America/Los_Angeles"
    blog_at: datetime
    linkedin_at: datetime

    @field_validator("blog_at", "linkedin_at")
    @classmethod
    def require_aware_datetime(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("publication times must be timezone-aware")
        return value


class ManifestItem(BaseModel):
    """Hash-bound publication input used by later mutation lanes."""

    model_config = ConfigDict(frozen=True)

    campaign: CampaignItem
    schedule: PublicationSchedule
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    blog_path: str = Field(pattern=r"^blog/[a-z0-9-]+\.html$")
    blog_url: str = Field(pattern=r"^https://islandmountain\.io/blog/[a-z0-9-]+\.html$")
    alt_text: str = Field(min_length=1, max_length=300)
    linkedin_first_comment: str = Field(min_length=1)
    funnel_url: str = Field(pattern=r"^https://islandmountain\.io/")
    content_sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    card_sha256: str | None = Field(default=None, pattern=r"^[0-9a-f]{64}$")
    publishable: bool
    blockers: tuple[str, ...] = ()


class CampaignManifest(BaseModel):
    """Canonical, versioned input manifest."""

    model_config = ConfigDict(frozen=True)

    schema_version: int = 1
    campaign_root: str
    cards_root: str
    items: tuple[ManifestItem, ...]
    manifest_sha256: str | None = Field(default=None, pattern=r"^[0-9a-f]{64}$")


class ApprovalStatus(StrEnum):
    PROPOSED = "proposed"
    APPROVED = "approved"
    REVOKED = "revoked"
    INVALID = "invalid"


class ApprovalRecord(BaseModel):
    """Owner metadata bound to one exact manifest packet."""

    model_config = ConfigDict(frozen=True)

    campaign_id: str = Field(pattern=r"^p\d{2}$")
    content_sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    card_sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    status: ApprovalStatus = ApprovalStatus.PROPOSED
    approved_by: str | None = None
    approved_at: datetime | None = None
    revoked_by: str | None = None
    revoked_at: datetime | None = None
    reason: str | None = None


class ApprovalBundle(BaseModel):
    """A reviewable batch whose entries remain independently fail-closed."""

    model_config = ConfigDict(frozen=True)

    schema_version: int = 1
    batch_id: str = Field(pattern=r"^[a-z0-9-]+$")
    manifest_sha256: str = Field(pattern=r"^[0-9a-f]{64}$")
    records: tuple[ApprovalRecord, ...]


def repository_relative(path: Path, repository_root: Path) -> str:
    """Return a stable POSIX path or fail when a source escapes the repository."""

    return path.resolve(strict=False).relative_to(repository_root.resolve()).as_posix()
