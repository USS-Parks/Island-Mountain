"""Hash-bound owner approval records and fail-closed validation."""

from __future__ import annotations

import argparse
import json
from datetime import UTC, datetime
from pathlib import Path

from .manifest import validate_manifest_item_hash
from .models import (
    ApprovalBundle,
    ApprovalRecord,
    ApprovalStatus,
    CampaignManifest,
    ManifestItem,
)


class ApprovalError(ValueError):
    """An approval is absent, stale, revoked, or inconsistent."""


def approval_bytes(bundle: ApprovalBundle) -> bytes:
    value = bundle.model_dump(mode="json")
    return (json.dumps(value, ensure_ascii=False, sort_keys=True, indent=2) + "\n").encode("utf-8")


def load_manifest(path: Path) -> CampaignManifest:
    manifest = CampaignManifest.model_validate_json(path.read_bytes())
    if manifest.manifest_sha256 is None:
        raise ApprovalError("manifest has no manifest_sha256")
    return manifest


def load_approvals(path: Path) -> ApprovalBundle:
    return ApprovalBundle.model_validate_json(path.read_bytes())


def propose_bundle(
    manifest: CampaignManifest,
    *,
    first_ordinal: int = 1,
    last_ordinal: int = 15,
) -> ApprovalBundle:
    if manifest.manifest_sha256 is None:
        raise ApprovalError("cannot propose approvals for an unsigned manifest")
    selected = [
        item
        for item in manifest.items
        if first_ordinal <= item.campaign.ordinal <= last_ordinal
    ]
    if not selected:
        raise ApprovalError("approval proposal selected no manifest items")
    blocked = [item.campaign.campaign_id for item in selected if not item.publishable]
    if blocked:
        raise ApprovalError(f"approval proposal includes blocked items: {blocked}")
    records = tuple(
        ApprovalRecord(
            campaign_id=item.campaign.campaign_id,
            content_sha256=item.content_sha256,
            card_sha256=_required_card_hash(item),
        )
        for item in selected
    )
    return ApprovalBundle(
        batch_id=f"authority-2026-p{first_ordinal:02d}-p{last_ordinal:02d}",
        manifest_sha256=manifest.manifest_sha256,
        records=records,
    )


def _required_card_hash(item: ManifestItem) -> str:
    if item.card_sha256 is None:
        raise ApprovalError(f"{item.campaign.campaign_id}: card hash is absent")
    return item.card_sha256


def sign_bundle(
    bundle: ApprovalBundle,
    *,
    owner: str,
    confirmed_manifest_sha256: str,
    approved_at: datetime | None = None,
) -> ApprovalBundle:
    if not owner.strip():
        raise ApprovalError("owner metadata is required")
    if confirmed_manifest_sha256 != bundle.manifest_sha256:
        raise ApprovalError("confirmed manifest hash does not match approval proposal")
    at = approved_at or datetime.now(UTC)
    if at.tzinfo is None or at.utcoffset() is None:
        raise ApprovalError("approval time must be timezone-aware")
    records = tuple(
        record.model_copy(
            update={
                "status": ApprovalStatus.APPROVED,
                "approved_by": owner.strip(),
                "approved_at": at,
                "revoked_by": None,
                "revoked_at": None,
                "reason": None,
            }
        )
        for record in bundle.records
    )
    return bundle.model_copy(update={"records": records})


def revoke_record(
    bundle: ApprovalBundle,
    campaign_id: str,
    *,
    owner: str,
    reason: str,
    revoked_at: datetime | None = None,
) -> ApprovalBundle:
    at = revoked_at or datetime.now(UTC)
    found = False
    updated: list[ApprovalRecord] = []
    for record in bundle.records:
        if record.campaign_id == campaign_id:
            found = True
            record = record.model_copy(
                update={
                    "status": ApprovalStatus.REVOKED,
                    "revoked_by": owner.strip(),
                    "revoked_at": at,
                    "reason": reason.strip(),
                }
            )
        updated.append(record)
    if not found:
        raise ApprovalError(f"approval record not found: {campaign_id}")
    return bundle.model_copy(update={"records": tuple(updated)})


def validate_approval(
    manifest: CampaignManifest,
    bundle: ApprovalBundle,
    campaign_id: str,
) -> ApprovalRecord:
    if manifest.manifest_sha256 != bundle.manifest_sha256:
        raise ApprovalError("approval bundle manifest hash mismatch")
    items = {item.campaign.campaign_id: item for item in manifest.items}
    records = {record.campaign_id: record for record in bundle.records}
    if campaign_id not in items or campaign_id not in records:
        raise ApprovalError(f"no approval packet for {campaign_id}")
    item = items[campaign_id]
    record = records[campaign_id]
    try:
        validate_manifest_item_hash(item)
    except ValueError as exc:
        raise ApprovalError(str(exc)) from exc
    if not item.publishable:
        raise ApprovalError(f"{campaign_id}: manifest item is blocked")
    if record.status is not ApprovalStatus.APPROVED:
        raise ApprovalError(f"{campaign_id}: approval status is {record.status}")
    if not record.approved_by or record.approved_at is None:
        raise ApprovalError(f"{campaign_id}: approved record lacks owner metadata")
    if record.content_sha256 != item.content_sha256:
        raise ApprovalError(f"{campaign_id}: content approval hash mismatch")
    if record.card_sha256 != item.card_sha256:
        raise ApprovalError(f"{campaign_id}: card approval hash mismatch")
    return record


def invalidate_drifted_records(
    manifest: CampaignManifest,
    bundle: ApprovalBundle,
) -> ApprovalBundle:
    items = {item.campaign.campaign_id: item for item in manifest.items}
    updated: list[ApprovalRecord] = []
    for record in bundle.records:
        item = items.get(record.campaign_id)
        drifted = (
            item is None
            or record.content_sha256 != item.content_sha256
            or record.card_sha256 != item.card_sha256
        )
        if drifted:
            record = record.model_copy(
                update={
                    "status": ApprovalStatus.INVALID,
                    "reason": "manifest or card drift",
                }
            )
        updated.append(record)
    return bundle.model_copy(
        update={
            "manifest_sha256": manifest.manifest_sha256,
            "records": tuple(updated),
        }
    )


def _write(path: Path, bundle: ApprovalBundle) -> None:
    path.write_bytes(approval_bytes(bundle))


def _paths() -> tuple[Path, Path]:
    project_root = Path(__file__).resolve().parents[2]
    campaign_root = project_root.parents[1] / "linkedin-six-week-authority-campaign-2026-08-10"
    return campaign_root / "PUBLISHING-MANIFEST.json", campaign_root / "PUBLISHING-APPROVALS.json"


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    commands = parser.add_subparsers(dest="command", required=True)
    commands.add_parser("propose")
    commands.add_parser("inspect")
    sign = commands.add_parser("sign")
    sign.add_argument("--owner", required=True)
    sign.add_argument("--manifest-sha", required=True)
    revoke = commands.add_parser("revoke")
    revoke.add_argument("--item", required=True)
    revoke.add_argument("--owner", required=True)
    revoke.add_argument("--reason", required=True)
    commands.add_parser("invalidate")
    args = parser.parse_args(argv)
    manifest_path, approvals_path = _paths()
    manifest = load_manifest(manifest_path)

    if args.command == "propose":
        _write(approvals_path, propose_bundle(manifest))
    elif args.command == "inspect":
        print(approvals_path.read_text(encoding="utf-8"), end="")
    elif args.command == "sign":
        _write(
            approvals_path,
            sign_bundle(
                load_approvals(approvals_path),
                owner=args.owner,
                confirmed_manifest_sha256=args.manifest_sha,
            ),
        )
    elif args.command == "revoke":
        _write(
            approvals_path,
            revoke_record(
                load_approvals(approvals_path),
                args.item,
                owner=args.owner,
                reason=args.reason,
            ),
        )
    elif args.command == "invalidate":
        _write(
            approvals_path,
            invalidate_drifted_records(manifest, load_approvals(approvals_path)),
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
