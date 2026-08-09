"""Strict parser for the owner-approved six-week campaign package."""

from __future__ import annotations

import re
from datetime import datetime
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from .models import CampaignItem, repository_relative

CAMPAIGN_YEAR = 2026
EXPECTED_ITEMS = 30
ITEM_RE = re.compile(
    r"^## (?P<ordinal>\d{2}): (?P<title>.+?)\n\n"
    r"\*\*Publish:\*\* (?P<publish>.+?)\n"
    r"\*\*Source idea:\*\* (?P<source_idea>\d+)\n"
    r"\*\*Icon:\*\* `(?P<icon>[^`]+)`\n"
    r"\*\*Form:\*\* (?P<form>.+?)\n"
    r"\*\*First comment:\*\* (?P<comment>.+?)\n\n"
    r"### Long-form article\n\n(?P<article>.+?)\n\n"
    r"### LinkedIn summary post\n\n(?P<linkedin>.+?)"
    r"(?=\n\n---\n\n## |\n\n---\s*\Z|\Z)",
    re.MULTILINE | re.DOTALL,
)
HASHTAG_RE = re.compile(r"(?<!\w)#[A-Za-z][A-Za-z0-9]*")
URL_RE = re.compile(r"https://[^\s]+")


class CampaignParseError(ValueError):
    """The campaign package does not match its frozen source contract."""


def _parse_date(value: str) -> datetime:
    try:
        return datetime.strptime(f"{value}, {CAMPAIGN_YEAR}", "%A, %B %d, %Y")
    except ValueError as exc:
        raise CampaignParseError(f"invalid Publish field: {value!r}") from exc


def _find_card(cards_root: Path, ordinal: int) -> Path | None:
    matches = sorted(cards_root.glob(f"linkedin-{ordinal:02d}-*-card.png"))
    if len(matches) > 1:
        raise CampaignParseError(f"multiple card files found for p{ordinal:02d}")
    return matches[0] if matches else None


def _hashtags(body: str) -> tuple[str, ...]:
    tags = tuple(HASHTAG_RE.findall(body))
    if not tags:
        raise CampaignParseError("publication body has no hashtags")
    return tags


def _utm_content(comment: str) -> str:
    urls = URL_RE.findall(comment)
    if len(urls) != 1:
        raise CampaignParseError("first comment must contain exactly one HTTPS URL")
    values = parse_qs(urlparse(urls[0]).query).get("utm_content", [])
    if len(values) != 1:
        raise CampaignParseError("first comment must contain exactly one utm_content value")
    return values[0]


def parse_week(
    week_path: Path,
    *,
    repository_root: Path,
    cards_root: Path,
) -> list[CampaignItem]:
    """Parse one week without transforming either publication body."""

    source = week_path.read_text(encoding="utf-8")
    matches = list(ITEM_RE.finditer(source))
    if len(matches) != 5:
        raise CampaignParseError(f"{week_path.name}: expected 5 items, parsed {len(matches)}")

    items: list[CampaignItem] = []
    for match in matches:
        values = match.groupdict()
        ordinal = int(values["ordinal"])
        card = _find_card(cards_root, ordinal)
        article = values["article"].rstrip()
        linkedin = values["linkedin"].rstrip()
        items.append(
            CampaignItem(
                campaign_id=f"p{ordinal:02d}",
                ordinal=ordinal,
                title=values["title"],
                publish_date=_parse_date(values["publish"]).date(),
                source_idea=int(values["source_idea"]),
                icon_source=values["icon"],
                delivery_form=values["form"],
                first_comment=values["comment"],
                long_form_article=article,
                article_hashtags=_hashtags(article),
                linkedin_summary=linkedin,
                linkedin_hashtags=_hashtags(linkedin),
                utm_content=_utm_content(values["comment"]),
                source_file=week_path.name,
                card_path=(
                    repository_relative(card, repository_root) if card is not None else None
                ),
            )
        )
    return items


def load_campaign(
    repository_root: Path,
    campaign_root: Path,
    cards_root: Path,
) -> list[CampaignItem]:
    """Load all 30 items and enforce ordering, identity, and date uniqueness."""

    items: list[CampaignItem] = []
    for week in range(1, 7):
        week_path = campaign_root / f"WEEK-{week}.md"
        if not week_path.is_file():
            raise CampaignParseError(f"missing campaign source: {week_path}")
        items.extend(
            parse_week(
                week_path,
                repository_root=repository_root,
                cards_root=cards_root,
            )
        )

    ordinals = [item.ordinal for item in items]
    if ordinals != list(range(1, EXPECTED_ITEMS + 1)):
        raise CampaignParseError(f"campaign ids are not contiguous 01-30: {ordinals}")
    mismatched_utm = [item.campaign_id for item in items if item.utm_content != item.campaign_id]
    if mismatched_utm:
        raise CampaignParseError(f"utm_content does not match campaign id: {mismatched_utm}")
    dates = [item.publish_date for item in items]
    if len(set(dates)) != EXPECTED_ITEMS:
        raise CampaignParseError("campaign publish dates must be unique")
    if dates != sorted(dates):
        raise CampaignParseError("campaign publish dates must be strictly increasing")
    return items
