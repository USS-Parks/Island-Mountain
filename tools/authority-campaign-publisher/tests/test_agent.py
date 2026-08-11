from datetime import UTC, datetime
from pathlib import Path

import pytest
from nooa import Agent

from island_mountain_publisher.agent import AuthorityCampaignPublisher, BlogNotLiveError
from island_mountain_publisher.approvals import ApprovalError, propose_bundle, sign_bundle
from island_mountain_publisher.manifest import compile_manifest


def test_nooa_agent_constructs_without_credentials_or_generation(
    repository_root: Path, campaign_root: Path, cards_root: Path
) -> None:
    manifest = compile_manifest(repository_root, campaign_root, cards_root)
    approvals = propose_bundle(manifest)
    publisher = AuthorityCampaignPublisher(manifest, approvals)

    assert isinstance(publisher, Agent)
    assert publisher.status().mode == "dry-run"
    assert publisher.status().item_count == 30
    assert publisher.status().approval_count == 15


def test_noop_agent_refuses_unsigned_proposal(
    repository_root: Path, campaign_root: Path, cards_root: Path
) -> None:
    manifest = compile_manifest(repository_root, campaign_root, cards_root)
    publisher = AuthorityCampaignPublisher(manifest, propose_bundle(manifest))

    with pytest.raises(ApprovalError, match="approval status is proposed"):
        publisher.validate_item("p01")


def test_noop_agent_accepts_exact_approved_fixture(
    repository_root: Path, campaign_root: Path, cards_root: Path
) -> None:
    manifest = compile_manifest(repository_root, campaign_root, cards_root)
    approvals = sign_bundle(
        propose_bundle(manifest),
        owner="Basho Parks",
        confirmed_manifest_sha256=manifest.manifest_sha256 or "",
        approved_at=datetime(2026, 8, 9, tzinfo=UTC),
    )
    publisher = AuthorityCampaignPublisher(manifest, approvals)

    publisher.validate_item("p01")


def test_publish_linkedin_gate_refuses_when_blog_not_live(
    repository_root: Path, campaign_root: Path, cards_root: Path
) -> None:
    manifest = compile_manifest(repository_root, campaign_root, cards_root)
    publisher = AuthorityCampaignPublisher(manifest, propose_bundle(manifest))
    item = manifest.items[1]  # p02

    with pytest.raises(BlogNotLiveError, match="refusing to post LinkedIn"):
        publisher._require_blog_live(item, http_status=lambda _url: 404)

    def unreachable(_url: str) -> int:
        raise OSError("dns failure")

    with pytest.raises(BlogNotLiveError):
        publisher._require_blog_live(item, http_status=unreachable)

    publisher._require_blog_live(item, http_status=lambda _url: 200)
