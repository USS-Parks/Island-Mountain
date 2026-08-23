"""Read-only daily audit: what the publisher did vs what the manifest ordered.

Companion to the publisher, never a peer: it holds no credentials beyond the
public site, writes nothing but WATCH-LOG.md (via the CLI layer), and cannot
repair anything. Every check is deterministic; a clean day is one green line.
"""

from __future__ import annotations

import re
import subprocess
import urllib.request
from dataclasses import dataclass
from datetime import UTC, date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from .approvals import ApprovalBundle, load_approvals, load_manifest
from .ledger import JsonlLedger, LedgerError
from .models import CampaignManifest, ManifestItem

DAY_MARK = re.compile(r"^\[(\d{4}-\d{2}-\d{2})T")
TRACEBACK_MARK = "Traceback (most recent call last):"
REFUSING_MARK = "Refusing to publish"
TOKEN_MINTED = re.compile(r"^export LINKEDIN_TOKEN_MINTED='?(\d{4}-\d{2}-\d{2})'?", re.M)
APPROVAL_WARN_DAYS = 7
TOKEN_WARN_AGE_DAYS = 53


@dataclass(frozen=True)
class Finding:
    check: str
    detail: str


def due_items(manifest: CampaignManifest, day: date) -> tuple[ManifestItem, ...]:
    return tuple(
        item for item in manifest.items if item.campaign.publish_date == day
    )


def read_ledger(path: Path):
    """Chain, hash, and idempotency verification ride on JsonlLedger.read()."""
    try:
        return JsonlLedger(path).read(), []
    except LedgerError as exc:
        return (), [Finding("ledger-chain", str(exc))]


def check_receipts(events, items: tuple[ManifestItem, ...]) -> list[Finding]:
    findings: list[Finding] = []
    for item in items:
        campaign_id = item.campaign.campaign_id
        kinds = [
            event.evidence.get("kind")
            for event in events
            if event.campaign_id == campaign_id
        ]
        posts = kinds.count("linkedin_post")
        comments = kinds.count("linkedin_comment")
        if posts != 1:
            shares = ", ".join(
                event.attempt_id
                for event in events
                if event.campaign_id == campaign_id
                and event.evidence.get("kind") == "linkedin_post"
            )
            findings.append(
                Finding(
                    "receipts",
                    f"{campaign_id}: expected exactly one linkedin_post receipt, "
                    f"found {posts}" + (f" ({shares})" if shares else ""),
                )
            )
        if posts and not comments:
            findings.append(
                Finding(
                    "receipts",
                    f"{campaign_id}: post receipt has no comment receipt; the UTM "
                    "first comment never published",
                )
            )
    return findings


def day_slice(log_text: str, day: date) -> str:
    """Lines from the day's first wakeup marker up to the next day's first."""
    marker = day.isoformat()
    lines = log_text.splitlines()
    start = None
    for index, line in enumerate(lines):
        match = DAY_MARK.match(line)
        if match is None:
            continue
        if match.group(1) == marker and start is None:
            start = index
        if start is not None and match.group(1) > marker:
            return "\n".join(lines[start:index])
    return "\n".join(lines[start:]) if start is not None else ""


def check_log(day_text: str) -> list[Finding]:
    findings: list[Finding] = []
    tracebacks = day_text.count(TRACEBACK_MARK)
    if tracebacks:
        first_error = next(
            (
                line.strip()
                for line in day_text.splitlines()
                if line.startswith(("urllib.error", "island_mountain_publisher"))
                or "Error" in line.split(":")[0]
            ),
            "",
        )
        findings.append(
            Finding(
                "run-log",
                f"{tracebacks} traceback(s) in the day's log"
                + (f"; first error: {first_error[:120]}" if first_error else ""),
            )
        )
    refusals = day_text.count(REFUSING_MARK)
    if refusals:
        findings.append(
            Finding(
                "run-log",
                f"{refusals} run(s) refused to publish (staged files present)",
            )
        )
    return findings


def _http_status(url: str) -> int:
    request = urllib.request.Request(url, method="GET")
    with urllib.request.urlopen(request, timeout=20) as response:
        return response.status


def check_liveness(items: tuple[ManifestItem, ...], http_status=_http_status) -> list[Finding]:
    findings: list[Finding] = []
    for item in items:
        try:
            status = http_status(item.blog_url)
        except Exception as exc:  # DNS, TLS, timeout: all mean not live
            findings.append(
                Finding("blog-live", f"{item.blog_url} unreachable: {exc}")
            )
            continue
        if status != 200:
            findings.append(
                Finding("blog-live", f"{item.blog_url} returned HTTP {status}")
            )
    return findings


def _git(repo_root: Path, *args: str) -> subprocess.CompletedProcess:
    return subprocess.run(
        ["git", "-C", str(repo_root), *args],
        capture_output=True,
        text=True,
        check=False,
    )


def check_runnable(repo_root: Path, git=_git) -> list[Finding]:
    findings: list[Finding] = []
    staged = git(repo_root, "diff", "--cached", "--name-only")
    names = [name for name in staged.stdout.splitlines() if name.strip()]
    if names:
        findings.append(
            Finding(
                "runnable",
                "staged files will make tomorrow's publisher refuse: "
                + ", ".join(names[:6]),
            )
        )
    branch = git(repo_root, "rev-parse", "--abbrev-ref", "HEAD").stdout.strip()
    if branch != "main":
        findings.append(
            Finding("runnable", f"repository is on '{branch}', publisher requires main")
        )
    return findings


def check_runways(
    manifest: CampaignManifest,
    approvals: ApprovalBundle,
    env_text: str,
    today: date,
) -> list[Finding]:
    findings: list[Finding] = []
    signed = {record.campaign_id for record in approvals.records}
    unsigned = [
        item for item in manifest.items if item.campaign.campaign_id not in signed
    ]
    if unsigned:
        cliff = min(item.campaign.publish_date for item in unsigned)
        days = (cliff - today).days
        if days < APPROVAL_WARN_DAYS:
            first = min(unsigned, key=lambda item: item.campaign.publish_date)
            findings.append(
                Finding(
                    "approvals-runway",
                    f"{first.campaign.campaign_id} publishes {cliff.isoformat()} "
                    f"({days}d away) and is not signed; run the approvals batch",
                )
            )
    match = TOKEN_MINTED.search(env_text)
    if match is None:
        findings.append(
            Finding(
                "token-runway",
                "LINKEDIN_TOKEN_MINTED not recorded in publisher.env; "
                "token expiry cannot be tracked",
            )
        )
    else:
        minted = date.fromisoformat(match.group(1))
        age = (today - minted).days
        if age > TOKEN_WARN_AGE_DAYS:
            findings.append(
                Finding(
                    "token-runway",
                    f"LinkedIn token is {age} days old (60-day expiry); re-mint soon",
                )
            )
    return findings


def audit_day(
    repository_root: Path,
    campaign_dir: Path,
    day: date,
    *,
    http_status=_http_status,
    git=_git,
    today: date | None = None,
) -> tuple[Finding, ...]:
    """Run every check for one publishing day; empty result means green."""
    today = today or day
    manifest = load_manifest(campaign_dir / "PUBLISHING-MANIFEST.json")
    approvals = load_approvals(campaign_dir / "PUBLISHING-APPROVALS.json")
    items = due_items(manifest, day)

    events, findings = read_ledger(campaign_dir / "PUBLISHING-LEDGER.jsonl")
    findings = list(findings)
    findings.extend(check_receipts(events, items))

    log_path = campaign_dir / "PUBLISHING-RUN.log"
    if log_path.exists():
        findings.extend(
            check_log(day_slice(log_path.read_text(encoding="utf-8", errors="replace"), day))
        )
    findings.extend(check_liveness(items, http_status))
    findings.extend(check_runnable(repository_root, git))
    env_path = campaign_dir / "publisher.env"
    env_text = env_path.read_text(encoding="utf-8") if env_path.exists() else ""
    findings.extend(check_runways(manifest, approvals, env_text, today))
    return tuple(findings)


CAMPAIGN_DIR = "linkedin-six-week-authority-campaign-2026-08-10"


def run_watch(repository_root: Path, day: date | None = None) -> int:
    """CLI lane: audit one day, append to WATCH-LOG.md, exit 0 green / 3 red."""
    now = datetime.now(UTC).astimezone(ZoneInfo("America/Los_Angeles"))
    target = day or now.date()
    campaign = repository_root / CAMPAIGN_DIR
    findings = audit_day(repository_root, campaign, target, today=now.date())
    stamp = now.isoformat(timespec="seconds")
    log = campaign / "WATCH-LOG.md"
    if not findings:
        line = f"[{stamp}] GREEN {target} — all checks clean"
        with log.open("a", encoding="utf-8") as destination:
            destination.write(line + "\n")
        print(line)
        return 0
    block = "\n".join(
        [f"[{stamp}] RED {target}: {len(findings)} finding(s)"]
        + [f"- [{finding.check}] {finding.detail}" for finding in findings]
    )
    with log.open("a", encoding="utf-8") as destination:
        destination.write(block + "\n")
    print(block)
    return 3
