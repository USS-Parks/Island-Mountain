from pathlib import Path

import pytest

from island_mountain_publisher.campaign import CampaignParseError, load_campaign, parse_week


def test_loads_all_thirty_pairs_without_rewriting_source(
    repository_root: Path, campaign_root: Path, cards_root: Path
) -> None:
    items = load_campaign(repository_root, campaign_root, cards_root)

    assert len(items) == 30
    assert items[0].campaign_id == "p01"
    assert items[0].title == "The Smaller System Is Often the Honest Answer"
    assert items[0].long_form_article.startswith("“Buy the biggest box")
    assert items[0].article_hashtags == (
        "#AIInfrastructure",
        "#OnPremAI",
        "#CapacityPlanning",
        "#DigitalSovereignty",
    )
    assert items[0].linkedin_summary.startswith("Somebody’s about to size")
    assert items[0].linkedin_hashtags == (
        "#AIInfrastructure",
        "#OnPremAI",
        "#CapacityPlanning",
    )
    assert items[0].utm_content == "p01"
    assert items[-1].campaign_id == "p30"
    assert items[-1].publish_date.isoformat() == "2026-09-18"


def test_cards_one_through_fifteen_are_present_and_later_cards_are_absent(
    repository_root: Path, campaign_root: Path, cards_root: Path
) -> None:
    items = load_campaign(repository_root, campaign_root, cards_root)

    assert all(item.card_path is not None for item in items[:15])
    assert all(item.card_path is None for item in items[15:])


def test_week_parser_fails_closed_on_structural_drift(
    monkeypatch: pytest.MonkeyPatch,
    repository_root: Path,
    campaign_root: Path,
    cards_root: Path,
) -> None:
    source = (campaign_root / "WEEK-1.md").read_text(encoding="utf-8")
    monkeypatch.setattr(
        Path,
        "read_text",
        lambda _path, **_kwargs: source.replace(
            "### LinkedIn summary post", "### Feed copy", 1
        ),
    )

    with pytest.raises(CampaignParseError, match="expected 5 items, parsed 4"):
        parse_week(
            campaign_root / "WEEK-1.md",
            repository_root=repository_root,
            cards_root=cards_root,
        )


def test_duplicate_week_content_fails_closed(
    monkeypatch: pytest.MonkeyPatch,
    repository_root: Path,
    campaign_root: Path,
    cards_root: Path,
) -> None:
    source = (campaign_root / "WEEK-1.md").read_text(encoding="utf-8")
    monkeypatch.setattr(Path, "read_text", lambda _path, **_kwargs: source)

    with pytest.raises(CampaignParseError, match="campaign ids are not contiguous"):
        load_campaign(repository_root, campaign_root, cards_root)
