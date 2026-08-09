"""Append-only, hash-chained publication receipts."""

from __future__ import annotations

import json
import os
from pathlib import Path

from pydantic import BaseModel, ConfigDict, Field

from .authority import MutationReceipt
from .manifest import sha256_value


class LedgerError(RuntimeError):
    """The ledger is malformed, conflicting, or cannot be appended safely."""


class LedgerDraft(BaseModel):
    """Remote receipt before chain fields are assigned."""

    model_config = ConfigDict(frozen=True)

    schema_version: int = 1
    idempotency_key: str = Field(min_length=1, max_length=200)
    campaign_id: str = Field(pattern=r"^p\d{2}$")
    occurred_at: str = Field(min_length=1)
    attempt_id: str = Field(min_length=1)
    evidence: dict[str, str] = Field(default_factory=dict)


class LedgerEvent(LedgerDraft):
    """One immutable line in the hash chain."""

    previous_event_sha256: str | None = Field(default=None, pattern=r"^[0-9a-f]{64}$")
    event_sha256: str = Field(pattern=r"^[0-9a-f]{64}$")


def _event_hash(event: LedgerEvent) -> str:
    return sha256_value(event.model_dump(mode="json", exclude={"event_sha256"}))


def _event_bytes(event: LedgerEvent) -> bytes:
    value = event.model_dump(mode="json")
    return (json.dumps(value, ensure_ascii=False, sort_keys=True) + "\n").encode("utf-8")


class JsonlLedger:
    """Small append-only ledger with replay and idempotency validation."""

    def __init__(self, path: Path) -> None:
        self.path = path

    def read(self) -> tuple[LedgerEvent, ...]:
        if not self.path.exists():
            return ()
        events: list[LedgerEvent] = []
        previous: str | None = None
        with self.path.open("rb") as source:
            for line_number, raw_line in enumerate(source, start=1):
                if not raw_line.strip():
                    continue
                try:
                    event = LedgerEvent.model_validate_json(raw_line)
                except ValueError as exc:
                    raise LedgerError(f"invalid ledger line {line_number}") from exc
                if event.previous_event_sha256 != previous:
                    raise LedgerError(f"broken ledger chain at line {line_number}")
                if _event_hash(event) != event.event_sha256:
                    raise LedgerError(f"invalid ledger hash at line {line_number}")
                events.append(event)
                previous = event.event_sha256
        keys = [event.idempotency_key for event in events]
        if len(keys) != len(set(keys)):
            raise LedgerError("duplicate idempotency key in ledger")
        return tuple(events)

    def append_draft(self, draft: LedgerDraft) -> LedgerEvent:
        events = self.read()
        for existing in events:
            if existing.idempotency_key == draft.idempotency_key:
                existing_draft = LedgerDraft.model_validate(existing.model_dump())
                if existing_draft != draft:
                    raise LedgerError(f"conflicting replay: {draft.idempotency_key}")
                return existing
        previous = events[-1].event_sha256 if events else None
        unhashed = {
            **draft.model_dump(mode="json"),
            "previous_event_sha256": previous,
            "event_sha256": "0" * 64,
        }
        event = LedgerEvent.model_validate(unhashed)
        event = event.model_copy(update={"event_sha256": _event_hash(event)})
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.path.open("ab") as destination:
            destination.write(_event_bytes(event))
            destination.flush()
            os.fsync(destination.fileno())
        return event

    def append(self, receipt: MutationReceipt) -> None:
        self.append_draft(
            LedgerDraft(
                idempotency_key=(
                    f"remote:{receipt.campaign_id}:{receipt.kind}:{receipt.remote_id}"
                ),
                campaign_id=receipt.campaign_id,
                occurred_at=receipt.occurred_at.isoformat(),
                attempt_id=receipt.remote_id,
                evidence={"kind": receipt.kind, "remote_id": receipt.remote_id},
            )
        )
