from datetime import UTC, datetime
from pathlib import Path

import pytest

from island_mountain_publisher.approvals import (
    ApprovalError,
    propose_bundle,
    revoke_record,
    sign_bundle,
    validate_approval,
)
from island_mountain_publisher.manifest import compile_manifest
from island_mountain_publisher.models import ApprovalStatus


@pytest.fixture
def approved(repository_root: Path, campaign_root: Path, cards_root: Path):
    manifest = compile_manifest(repository_root, campaign_root, cards_root)
    proposed = propose_bundle(manifest)
    bundle = sign_bundle(
        proposed,
        owner="Basho Parks",
        confirmed_manifest_sha256=manifest.manifest_sha256 or "",
        approved_at=datetime(2026, 8, 9, 12, 0, tzinfo=UTC),
    )
    return manifest, bundle


def test_proposal_contains_only_eligible_initial_batch(
    repository_root: Path, campaign_root: Path, cards_root: Path
) -> None:
    manifest = compile_manifest(repository_root, campaign_root, cards_root)
    proposal = propose_bundle(manifest)

    assert proposal.batch_id == "authority-2026-p01-p15"
    assert len(proposal.records) == 15
    assert all(record.status is ApprovalStatus.PROPOSED for record in proposal.records)
    assert proposal.records[-1].campaign_id == "p15"


def test_exact_approved_fixture_validates(approved) -> None:
    manifest, bundle = approved
    record = validate_approval(manifest, bundle, "p01")

    assert record.approved_by == "Basho Parks"
    assert record.status is ApprovalStatus.APPROVED


@pytest.mark.parametrize(
    "field",
    ["article", "summary", "first_comment", "date", "slug", "card"],
)
def test_any_publication_packet_drift_blocks(approved, field: str) -> None:
    manifest, bundle = approved
    item = manifest.items[0]
    campaign = item.campaign
    if field == "article":
        campaign = campaign.model_copy(
            update={"long_form_article": campaign.long_form_article + "x"}
        )
        item = item.model_copy(update={"campaign": campaign})
    elif field == "summary":
        campaign = campaign.model_copy(update={"linkedin_summary": campaign.linkedin_summary + "x"})
        item = item.model_copy(update={"campaign": campaign})
    elif field == "first_comment":
        campaign = campaign.model_copy(update={"first_comment": campaign.first_comment + "x"})
        item = item.model_copy(update={"campaign": campaign})
    elif field == "date":
        campaign = campaign.model_copy(
            update={"publish_date": campaign.publish_date.replace(day=11)}
        )
        item = item.model_copy(update={"campaign": campaign})
    elif field == "slug":
        item = item.model_copy(update={"slug": item.slug + "x"})
    else:
        item = item.model_copy(update={"card_sha256": "0" * 64})
    changed = manifest.model_copy(update={"items": (item, *manifest.items[1:])})

    with pytest.raises(ApprovalError, match="manifest item hash mismatch"):
        validate_approval(changed, bundle, "p01")


def test_wrong_manifest_confirmation_cannot_sign(
    repository_root: Path, campaign_root: Path, cards_root: Path
) -> None:
    manifest = compile_manifest(repository_root, campaign_root, cards_root)

    with pytest.raises(ApprovalError, match="confirmed manifest hash"):
        sign_bundle(
            propose_bundle(manifest),
            owner="Basho Parks",
            confirmed_manifest_sha256="0" * 64,
        )


def test_approved_status_without_owner_metadata_fails_closed(approved) -> None:
    manifest, bundle = approved
    record = bundle.records[0].model_copy(update={"approved_by": None})
    malformed = bundle.model_copy(update={"records": (record, *bundle.records[1:])})

    with pytest.raises(ApprovalError, match="lacks owner metadata"):
        validate_approval(manifest, malformed, "p01")


def test_revocation_blocks_an_approved_record(approved) -> None:
    manifest, bundle = approved
    revoked = revoke_record(
        bundle,
        "p01",
        owner="Basho Parks",
        reason="owner hold",
        revoked_at=datetime(2026, 8, 9, 13, 0, tzinfo=UTC),
    )

    with pytest.raises(ApprovalError, match="approval status is revoked"):
        validate_approval(manifest, revoked, "p01")
