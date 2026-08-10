from datetime import date
from pathlib import Path

import pytest

from island_mountain_publisher.approvals import load_approvals, load_manifest
from island_mountain_publisher.ledger import JsonlLedger
from island_mountain_publisher.watchstander import (
    Finding,
    check_liveness,
    check_log,
    check_receipts,
    check_runnable,
    check_runways,
    day_slice,
    due_items,
    read_ledger,
)

GOLDEN = Path(__file__).parent / "fixtures" / "golden-2026-08-10"
GOLDEN_DAY = date(2026, 8, 10)


@pytest.fixture(scope="module")
def manifest(campaign_root: Path):
    return load_manifest(campaign_root / "PUBLISHING-MANIFEST.json")


@pytest.fixture(scope="module")
def approvals(campaign_root: Path):
    return load_approvals(campaign_root / "PUBLISHING-APPROVALS.json")


@pytest.fixture(scope="module")
def golden_events():
    return JsonlLedger(GOLDEN / "PUBLISHING-LEDGER.jsonl").read()


@pytest.fixture(scope="module")
def golden_log() -> str:
    return (GOLDEN / "PUBLISHING-RUN.log").read_text(encoding="utf-8", errors="replace")


# --- check 1+2: receipts ----------------------------------------------------


def test_golden_day_flags_double_post_and_missing_comment(manifest, golden_events):
    items = due_items(manifest, GOLDEN_DAY)
    assert [item.campaign.campaign_id for item in items] == ["p01"]

    findings = check_receipts(golden_events, items)
    details = " | ".join(finding.detail for finding in findings)
    assert len(findings) == 2
    assert "expected exactly one linkedin_post receipt, found 2" in details
    assert "7492595742579253248" in details and "7492595745741545472" in details
    assert "no comment receipt" in details


def test_single_post_with_comment_is_green(manifest, golden_events):
    items = due_items(manifest, GOLDEN_DAY)
    one_post = [e for e in golden_events if e.evidence.get("kind") != "linkedin_post"]
    one_post.append(
        next(e for e in golden_events if e.evidence.get("kind") == "linkedin_post")
    )
    comment = golden_events[0].model_copy(
        update={
            "evidence": {"kind": "linkedin_comment", "remote_id": "c1"},
            "idempotency_key": "remote:p01:linkedin_comment:c1",
        }
    )
    assert check_receipts([*one_post, comment], items) == []


def test_no_due_item_yields_no_receipt_findings(manifest, golden_events):
    assert check_receipts(golden_events, due_items(manifest, date(2026, 8, 15))) == []


# --- check 3: chain ---------------------------------------------------------


def test_golden_chain_is_intact():
    events, findings = read_ledger(GOLDEN / "PUBLISHING-LEDGER.jsonl")
    assert findings == [] and len(events) == 4


def test_corrupted_chain_is_a_finding(tmp_path: Path):
    source = (GOLDEN / "PUBLISHING-LEDGER.jsonl").read_text(encoding="utf-8")
    corrupted = tmp_path / "PUBLISHING-LEDGER.jsonl"
    corrupted.write_text(source.replace("linkedin_image", "linkedin_edited", 1), encoding="utf-8")
    events, findings = read_ledger(corrupted)
    assert events == () and findings[0].check == "ledger-chain"


# --- check 4: log -----------------------------------------------------------


def test_golden_log_flags_tracebacks_and_refusals(golden_log):
    sliced = day_slice(golden_log, GOLDEN_DAY)
    findings = check_log(sliced)
    checks = [finding.detail for finding in findings]
    assert any("traceback" in detail for detail in checks)
    assert any("refused to publish" in detail for detail in checks)
    assert "403" in " ".join(checks) or "Error" in " ".join(checks)


def test_clean_log_is_green():
    clean = "[2026-08-11T05:00:05-07:00] Island Mountain publisher wakeup\n[\n  \"blog:p02:abc123\"\n]\n"
    assert check_log(day_slice(clean, date(2026, 8, 11))) == []


def test_day_slice_stops_at_next_day(golden_log):
    padded = golden_log + '\n[2026-08-11T05:00:05-07:00] wakeup\nTraceback (most recent call last):\n'
    sliced = day_slice(padded, GOLDEN_DAY)
    assert "2026-08-11" not in sliced


# --- check 5: liveness ------------------------------------------------------


def test_liveness_flags_non_200(manifest):
    items = due_items(manifest, GOLDEN_DAY)
    assert check_liveness(items, http_status=lambda url: 200) == []
    findings = check_liveness(items, http_status=lambda url: 404)
    assert findings and "HTTP 404" in findings[0].detail

    def boom(url):
        raise OSError("no route")

    assert "unreachable" in check_liveness(items, http_status=boom)[0].detail


# --- check 6: runnable ------------------------------------------------------


class FakeGit:
    def __init__(self, staged: str, branch: str):
        self.staged, self.branch = staged, branch

    def __call__(self, repo_root, *args):
        class R:
            stdout = ""
        r = R()
        r.stdout = self.staged if "diff" in args else self.branch + "\n"
        return r


def test_runnable_flags_staged_and_branch(tmp_path: Path):
    assert check_runnable(tmp_path, FakeGit("", "main")) == []
    findings = check_runnable(tmp_path, FakeGit("pricing.html\ninvestors.html\n", "main"))
    assert "staged files" in findings[0].detail and "pricing.html" in findings[0].detail
    findings = check_runnable(tmp_path, FakeGit("", "session/loose-end"))
    assert "requires main" in findings[0].detail


# --- checks 7+8: runways ----------------------------------------------------


def test_runways_quiet_early_and_loud_at_the_cliff(manifest, approvals):
    signed = {record.campaign_id for record in approvals.records}
    unsigned = [i for i in manifest.items if i.campaign.campaign_id not in signed]
    assert unsigned, "p16-p30 are expected unsigned while this test exists"
    cliff = min(item.campaign.publish_date for item in unsigned)

    env = "export LINKEDIN_TOKEN_MINTED='2026-08-09'\n"
    quiet_day = date.fromordinal(cliff.toordinal() - 10)
    assert check_runways(manifest, approvals, env, quiet_day) == []

    loud_day = date.fromordinal(cliff.toordinal() - 3)
    findings = check_runways(manifest, approvals, env, loud_day)
    assert findings and findings[0].check == "approvals-runway"
    assert "not signed" in findings[0].detail


def test_token_age_and_missing_mint_date(manifest, approvals):
    signed_all_env = "export LINKEDIN_TOKEN_MINTED='2026-08-09'\n"
    old = check_runways(manifest, approvals, signed_all_env, date(2026, 8, 12))
    assert all(f.check != "token-runway" for f in old)
    stale = check_runways(manifest, approvals, signed_all_env, date(2026, 10, 5))
    assert any(f.check == "token-runway" and "days old" in f.detail for f in stale)
    missing = check_runways(manifest, approvals, "", date(2026, 8, 12))
    assert any(f.check == "token-runway" and "not recorded" in f.detail for f in missing)
