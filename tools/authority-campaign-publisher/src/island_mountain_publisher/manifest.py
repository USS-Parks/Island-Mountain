"""Deterministic publication-manifest compiler."""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import struct
import unicodedata
from datetime import datetime, time, timedelta
from pathlib import Path
from urllib.parse import urlparse
from zoneinfo import ZoneInfo

from .campaign import load_campaign
from .models import CampaignItem, CampaignManifest, ManifestItem, PublicationSchedule

PACIFIC = ZoneInfo("America/Los_Angeles")
BLOG_ORIGIN = "https://islandmountain.io"
SLUG_OVERRIDES = {"p01": "right-sizing-ai-infrastructure-smaller-system"}
URL_RE = re.compile(r"https://[^\s]+")
PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


class ManifestError(ValueError):
    """The publication manifest cannot be compiled safely."""


def canonical_json(value: object) -> bytes:
    """Serialize hash inputs identically on every supported platform."""

    return json.dumps(
        value,
        ensure_ascii=False,
        sort_keys=True,
        separators=(",", ":"),
    ).encode("utf-8")


def sha256_value(value: object) -> str:
    return hashlib.sha256(canonical_json(value)).hexdigest()


def sha256_file(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for block in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(block)
    return digest.hexdigest()


def slugify(title: str) -> str:
    ascii_title = unicodedata.normalize("NFKD", title).encode("ascii", "ignore").decode()
    slug = re.sub(r"[^a-z0-9]+", "-", ascii_title.lower()).strip("-")
    if not slug:
        raise ManifestError(f"title cannot produce a slug: {title!r}")
    return slug


def publication_schedule(item: CampaignItem) -> PublicationSchedule:
    """Fix the blog at 05:00 and LinkedIn to a stable minute in 06:00-08:00."""

    blog_at = datetime.combine(item.publish_date, time(5, 0), tzinfo=PACIFIC)
    seed = hashlib.sha256(f"authority-2026:{item.campaign_id}".encode()).digest()
    minute_offset = int.from_bytes(seed[:4], "big") % 121
    linkedin_at = datetime.combine(item.publish_date, time(6, 0), tzinfo=PACIFIC) + timedelta(
        minutes=minute_offset
    )
    return PublicationSchedule(blog_at=blog_at, linkedin_at=linkedin_at)


def _validate_png(path: Path) -> None:
    with path.open("rb") as source:
        header = source.read(24)
    if len(header) != 24 or header[:8] != PNG_SIGNATURE or header[12:16] != b"IHDR":
        raise ManifestError(f"not a valid PNG header: {path}")
    width, height = struct.unpack(">II", header[16:24])
    if (width, height) != (2048, 2048):
        raise ManifestError(f"card must be 2048x2048, got {width}x{height}: {path}")


def _funnel_url(item: CampaignItem) -> str:
    urls = URL_RE.findall(item.first_comment)
    if len(urls) != 1:
        raise ManifestError(f"{item.campaign_id}: source first comment must contain one URL")
    url = urls[0]
    parsed = urlparse(url)
    if parsed.scheme != "https" or parsed.netloc != "islandmountain.io":
        raise ManifestError(f"{item.campaign_id}: funnel URL leaves islandmountain.io")
    return url


def _compile_item(item: CampaignItem, repository_root: Path) -> ManifestItem:
    slug = SLUG_OVERRIDES.get(item.campaign_id, slugify(item.title))
    blog_path = f"blog/{slug}.html"
    blog_url = f"{BLOG_ORIGIN}/{blog_path}"
    schedule = publication_schedule(item)
    blockers: list[str] = []
    card_sha256: str | None = None
    if item.card_path is None:
        blockers.append(f"missing card for {item.campaign_id}")
    else:
        card = repository_root / item.card_path
        _validate_png(card)
        card_sha256 = sha256_file(card)

    packet = {
        "campaign": item.model_dump(mode="json"),
        "schedule": schedule.model_dump(mode="json"),
        "slug": slug,
        "blog_path": blog_path,
        "blog_url": blog_url,
        "alt_text": f"Island Mountain campaign card for {item.title}",
        "linkedin_first_comment": f"Read the full article: {blog_url}",
        "funnel_url": _funnel_url(item),
        "card_sha256": card_sha256,
    }
    return ManifestItem(
        campaign=item,
        schedule=schedule,
        slug=slug,
        blog_path=blog_path,
        blog_url=blog_url,
        alt_text=f"Island Mountain campaign card for {item.title}",
        linkedin_first_comment=f"Read the full article: {blog_url}",
        funnel_url=_funnel_url(item),
        content_sha256=sha256_value(packet),
        card_sha256=card_sha256,
        publishable=not blockers,
        blockers=tuple(blockers),
    )


def publication_packet(item: ManifestItem) -> dict[str, object]:
    """Reconstruct the exact fields protected by an item's content hash."""

    return {
        "campaign": item.campaign.model_dump(mode="json"),
        "schedule": item.schedule.model_dump(mode="json"),
        "slug": item.slug,
        "blog_path": item.blog_path,
        "blog_url": item.blog_url,
        "alt_text": item.alt_text,
        "linkedin_first_comment": item.linkedin_first_comment,
        "funnel_url": item.funnel_url,
        "card_sha256": item.card_sha256,
    }


def validate_manifest_item_hash(item: ManifestItem) -> None:
    if sha256_value(publication_packet(item)) != item.content_sha256:
        raise ManifestError(f"{item.campaign.campaign_id}: manifest item hash mismatch")


def compile_manifest(
    repository_root: Path,
    campaign_root: Path,
    cards_root: Path,
) -> CampaignManifest:
    campaign = load_campaign(repository_root, campaign_root, cards_root)
    items = tuple(_compile_item(item, repository_root) for item in campaign)
    slugs = [item.slug for item in items]
    if len(set(slugs)) != len(slugs):
        raise ManifestError("manifest contains duplicate slugs")
    unsigned = CampaignManifest(
        campaign_root=campaign_root.relative_to(repository_root).as_posix(),
        cards_root=cards_root.relative_to(repository_root).as_posix(),
        items=items,
    )
    digest = sha256_value(unsigned.model_dump(mode="json", exclude={"manifest_sha256"}))
    return unsigned.model_copy(update={"manifest_sha256": digest})


def manifest_bytes(manifest: CampaignManifest) -> bytes:
    value = manifest.model_dump(mode="json")
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")


def write_manifest(manifest: CampaignManifest, destination: Path) -> None:
    destination.write_bytes(manifest_bytes(manifest))


def _repository_root(project_root: Path) -> Path:
    return project_root.parents[1]


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--check", action="store_true", help="fail if the tracked manifest differs")
    args = parser.parse_args(argv)
    project_root = Path(__file__).resolve().parents[2]
    repository_root = _repository_root(project_root)
    campaign_root = repository_root / "linkedin-six-week-authority-campaign-2026-08-10"
    cards_root = repository_root / "cards"
    destination = campaign_root / "PUBLISHING-MANIFEST.json"
    compiled = compile_manifest(repository_root, campaign_root, cards_root)
    rendered = manifest_bytes(compiled)
    if args.check:
        if not destination.is_file() or destination.read_bytes() != rendered:
            raise SystemExit("PUBLISHING-MANIFEST.json is missing or stale")
    else:
        destination.write_bytes(rendered)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
