from datetime import UTC, datetime
from pathlib import Path

import pytest

from island_mountain_publisher.authority import MutationKind, MutationReceipt
from island_mountain_publisher.ledger import JsonlLedger, LedgerError

NOW = datetime(2026, 8, 10, 12, 0, tzinfo=UTC)


def test_identical_receipt_is_idempotent(tmp_path: Path) -> None:
    path = tmp_path / "ledger.jsonl"
    ledger = JsonlLedger(path)
    receipt = MutationReceipt(
        campaign_id="p01",
        kind=MutationKind.LINKEDIN_POST,
        remote_id="post-urn",
        occurred_at=NOW,
    )
    ledger.append(receipt)
    initial = path.read_bytes()
    ledger.append(receipt)
    assert path.read_bytes() == initial


def test_hash_chain_detects_one_byte_tamper(tmp_path: Path) -> None:
    path = tmp_path / "ledger.jsonl"
    ledger = JsonlLedger(path)
    ledger.append(
        MutationReceipt(
            campaign_id="p01",
            kind=MutationKind.LINKEDIN_POST,
            remote_id="post-urn",
            occurred_at=NOW,
        )
    )
    path.write_bytes(path.read_bytes().replace(b"post-urn", b"fake-urn"))

    with pytest.raises(LedgerError, match="invalid ledger hash"):
        JsonlLedger(path).read()
def test_remote_receipt_is_hash_chained(tmp_path: Path) -> None:
    ledger = JsonlLedger(tmp_path / "ledger.jsonl")
    ledger.append(
        MutationReceipt(
            campaign_id="p01",
            kind=MutationKind.LINKEDIN_POST,
            remote_id="post-urn",
            occurred_at=NOW,
        )
    )

    event = ledger.read()[0]
    assert event.evidence["remote_id"] == "post-urn"
