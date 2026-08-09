from datetime import time
from pathlib import Path

from island_mountain_publisher.manifest import compile_manifest, manifest_bytes


def test_manifest_is_byte_deterministic_and_contains_all_items(
    repository_root: Path, campaign_root: Path, cards_root: Path
) -> None:
    first = compile_manifest(repository_root, campaign_root, cards_root)
    second = compile_manifest(repository_root, campaign_root, cards_root)

    assert manifest_bytes(first) == manifest_bytes(second)
    assert first.manifest_sha256 == second.manifest_sha256
    assert len(first.items) == 30


def test_schedule_uses_owner_approved_pacific_windows(
    repository_root: Path, campaign_root: Path, cards_root: Path
) -> None:
    manifest = compile_manifest(repository_root, campaign_root, cards_root)

    for item in manifest.items:
        assert item.schedule.timezone == "America/Los_Angeles"
        assert item.schedule.blog_at.timetz().replace(tzinfo=None) == time(5, 0)
        linkedin_time = item.schedule.linkedin_at.timetz().replace(tzinfo=None)
        assert time(6, 0) <= linkedin_time <= time(8, 0)
        assert item.schedule.blog_at.utcoffset() == item.schedule.linkedin_at.utcoffset()


def test_manifest_maps_existing_assets_and_blocks_exact_missing_range(
    repository_root: Path, campaign_root: Path, cards_root: Path
) -> None:
    manifest = compile_manifest(repository_root, campaign_root, cards_root)

    assert all(item.publishable and item.card_sha256 for item in manifest.items[:15])
    assert [item.campaign.campaign_id for item in manifest.items if not item.publishable] == [
        f"p{ordinal:02d}" for ordinal in range(16, 31)
    ]
    assert [item.blockers for item in manifest.items[15:]] == [
        (f"missing card for p{ordinal:02d}",) for ordinal in range(16, 31)
    ]


def test_post_one_adopts_existing_page_and_link_policy(
    repository_root: Path, campaign_root: Path, cards_root: Path
) -> None:
    item = compile_manifest(repository_root, campaign_root, cards_root).items[0]

    assert item.blog_path == "blog/right-sizing-ai-infrastructure-smaller-system.html"
    assert item.blog_url.endswith("/blog/right-sizing-ai-infrastructure-smaller-system.html")
    assert item.linkedin_first_comment == f"Read the full article: {item.blog_url}"
    assert "sovereign-cost-worksheet.html" in item.funnel_url
