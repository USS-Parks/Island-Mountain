"""Scorecard aggregation, tally idempotence, and section replacement."""

from __future__ import annotations

from datetime import UTC, date, datetime

from island_mountain_publisher.ledger import LedgerEvent
from island_mountain_publisher.models import CampaignItem
from island_mountain_publisher.scorecard import (
    WeekReport,
    aggregate,
    best_post,
    render_week_section,
    update_tracking,
    upsert_week_section,
)


def _item(ordinal: int, publish: date, title: str) -> CampaignItem:
    campaign_id = f"p{ordinal:02d}"
    return CampaignItem(
        campaign_id=campaign_id,
        ordinal=ordinal,
        title=title,
        publish_date=publish,
        source_idea=1,
        icon_source="icons/masters/x.png",
        delivery_form="F1",
        first_comment="Read it: https://islandmountain.io/blog/x.html?utm_content=" + campaign_id,
        long_form_article="Body.",
        article_hashtags=("#IslandMountain",),
        linkedin_summary="Summary.",
        linkedin_hashtags=("#IslandMountain",),
        utm_content=campaign_id,
        source_file="WEEK-1.md",
        card_path=None,
    )


def _event(campaign_id: str, kind: str) -> LedgerEvent:
    return LedgerEvent(
        idempotency_key=f"remote:{campaign_id}:{kind}:x",
        campaign_id=campaign_id,
        occurred_at="2026-08-10T09:00:00+00:00",
        attempt_id="x",
        evidence={"kind": kind, "remote_id": "x"},
        previous_event_sha256=None,
        event_sha256="0" * 64,
    )


ITEMS = [
    _item(1, date(2026, 8, 10), "First Post"),
    _item(2, date(2026, 8, 11), "Second Post"),
]

D1_ROWS: list[dict[str, object]] = [
    {"source": "form", "use_case": "Cost worksheet request", "system_interest": "",
     "utm_content": "p01", "created_at": "2026-08-11T10:00:00.000Z"},
    {"source": "chat", "use_case": "", "system_interest": "",
     "utm_content": "p01", "created_at": "2026-08-11T11:00:00.000Z"},
    {"source": "form", "use_case": "", "system_interest": "Build slot claim",
     "utm_content": "p02", "created_at": "2026-08-12T10:00:00.000Z"},
    {"source": "form", "use_case": "Cost worksheet request", "system_interest": "",
     "utm_content": "(untagged)", "created_at": "2026-08-12T11:00:00.000Z"},
    {"source": "form", "use_case": "", "system_interest": "",
     "utm_content": "p01", "created_at": "2026-08-12T12:00:00.000Z"},
]

TRACKING = """# Campaign Chain Tracking

## Weekly tally

| Week | Dates | Clicks | Opt-ins | Calls | Clients | Best post (utm_content) | Note |
|---|---|---|---|---|---|---|---|
| 1 | Aug 10–14 |  |  | 2 | 1 |  | manual note |
| 2 | Aug 17–21 |  |  |  |  |  |  |
"""


def test_aggregate_buckets_and_untagged() -> None:
    report = aggregate(1, ITEMS, [_event("p01", "blog_commit")], D1_ROWS, {"p01": 12, "p02": 3})
    assert report.start == date(2026, 8, 10) and report.end == date(2026, 8, 17)
    first, second = report.posts
    assert (first.worksheet, first.slot, first.chat, first.voice) == (1, 0, 1, 0)
    assert first.published_kinds == ("blog_commit",)
    assert (second.worksheet, second.slot) == (0, 1)
    assert second.published_kinds == ()
    assert report.untagged_opt_ins == 1
    assert report.total_opt_ins == 2
    assert report.total_clicks == 15
    assert best_post(report) == "p01"


def test_update_tracking_fills_owned_cells_and_is_idempotent() -> None:
    report = aggregate(1, ITEMS, [], D1_ROWS, {"p01": 12, "p02": 3})
    once = update_tracking(TRACKING, report)
    twice = update_tracking(once, report)
    assert once == twice
    row = next(line for line in once.split("\n") if line.startswith("| 1 |"))
    assert row == "| 1 | Aug 10–14 | 15 | 2 | 2 | 1 | p01 | manual note |"
    assert "| 2 | Aug 17–21 |  |  |  |  |  |  |" in once


def test_update_tracking_preserves_cells_when_source_unpulled() -> None:
    report = aggregate(1, ITEMS, [], None, {"p01": 12, "p02": 3})
    updated = update_tracking(TRACKING, report)
    row = next(line for line in updated.split("\n") if line.startswith("| 1 |"))
    assert row == "| 1 | Aug 10–14 | 15 |  | 2 | 1 | p01 | manual note |"


def test_upsert_week_section_replaces_only_its_week() -> None:
    generated = datetime(2026, 8, 14, 17, 0, tzinfo=UTC)
    report_one = aggregate(1, ITEMS, [], D1_ROWS, None)
    section_one = render_week_section(report_one, generated)
    body = upsert_week_section(None, section_one, 1)
    body = upsert_week_section(body, "## Week 2 (x to y)\n\nweek two detail\n", 2)
    assert "(unpulled)" in section_one
    replacement = render_week_section(
        aggregate(1, ITEMS, [], D1_ROWS, {"p01": 9, "p02": 1}), generated
    )
    body = upsert_week_section(body, replacement, 1)
    assert body.count("## Week 1 (") == 1
    assert "week two detail" in body
    assert "| p01 | First Post | — | 9 | 1 | 0 | 1 | 0 |" in body


def test_week_report_totals_with_no_sources() -> None:
    report = aggregate(1, ITEMS, [], None, None)
    assert isinstance(report, WeekReport)
    assert not report.d1_pulled and not report.clicks_pulled
    assert best_post(report) is None
