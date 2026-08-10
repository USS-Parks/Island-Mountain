"""Weekly campaign-chain scorecard: manifest x ledger x D1 x clicks.

Read-only companion to the publisher. Joins the roster (PUBLISHING-MANIFEST),
publication receipts (PUBLISHING-LEDGER), D1 lead rows, and an Ahrefs clicks
export into the TRACKING.md weekly tally plus a per-week SCORECARD.md section.
Every source is independently skippable: a source that was not pulled reports
"(unpulled)" and preserves any existing hand-entered cell, never a silent zero.
"""

from __future__ import annotations

import hashlib
import json
import shutil
import subprocess
from collections.abc import Mapping, Sequence
from dataclasses import dataclass
from datetime import UTC, date, datetime, timedelta
from pathlib import Path

from .approvals import load_manifest
from .ledger import JsonlLedger, LedgerEvent
from .models import CampaignItem

UNPULLED = "(unpulled)"
UNTAGGED = "(untagged)"
D1_DATABASE = "island-mountain-leads"
CAMPAIGN_DIR = "linkedin-six-week-authority-campaign-2026-08-10"
WORKSHEET_USE_CASE = "Cost worksheet request"
SLOT_INTEREST = "Build slot claim"


class ScorecardError(RuntimeError):
    """The scorecard inputs or surfaces are not in a state that can be graded."""


@dataclass(frozen=True)
class PostRow:
    campaign_id: str
    title: str
    publish_date: date
    published_kinds: tuple[str, ...]
    clicks: int | None
    worksheet: int
    slot: int
    chat: int
    voice: int

    @property
    def opt_ins(self) -> int:
        return self.worksheet + self.slot


@dataclass(frozen=True)
class WeekReport:
    week: int
    start: date
    end: date
    posts: tuple[PostRow, ...]
    untagged_opt_ins: int
    d1_pulled: bool
    clicks_pulled: bool

    @property
    def total_clicks(self) -> int:
        return sum(post.clicks or 0 for post in self.posts)

    @property
    def total_opt_ins(self) -> int:
        return sum(post.opt_ins for post in self.posts)


def week_items(items: Sequence[CampaignItem], week: int) -> tuple[CampaignItem, ...]:
    if not 1 <= week <= 6:
        raise ScorecardError(f"week must be 1-6, got {week}")
    low, high = 5 * week - 4, 5 * week
    chosen = tuple(
        sorted((item for item in items if low <= item.ordinal <= high), key=lambda i: i.ordinal)
    )
    if not chosen:
        raise ScorecardError(f"no campaign items found for week {week}")
    return chosen


def week_window(chosen: Sequence[CampaignItem]) -> tuple[date, date]:
    """Monday through the following Monday around the week's publish dates."""

    first = min(item.publish_date for item in chosen)
    start = first - timedelta(days=first.weekday())
    return start, start + timedelta(days=7)


def _bucket(row: Mapping[str, object]) -> str:
    source = str(row.get("source") or "")
    if source in ("chat", "voice"):
        return source
    if str(row.get("use_case") or "") == WORKSHEET_USE_CASE:
        return "worksheet"
    if str(row.get("system_interest") or "") == SLOT_INTEREST:
        return "slot"
    return "other"


def aggregate(
    week: int,
    items: Sequence[CampaignItem],
    ledger_events: Sequence[LedgerEvent],
    d1_rows: Sequence[Mapping[str, object]] | None,
    clicks: Mapping[str, int] | None,
) -> WeekReport:
    chosen = week_items(items, week)
    start, end = week_window(chosen)

    kinds: dict[str, set[str]] = {}
    for event in ledger_events:
        kind = event.evidence.get("kind", "")
        if kind:
            kinds.setdefault(event.campaign_id, set()).add(kind)

    counts: dict[str, dict[str, int]] = {}
    untagged = 0
    for row in d1_rows or ():
        tag = str(row.get("utm_content") or "") or UNTAGGED
        bucket = _bucket(row)
        if bucket == "other":
            continue
        if tag == UNTAGGED:
            if bucket in ("worksheet", "slot"):
                untagged += 1
            continue
        by_bucket = counts.setdefault(tag, {})
        by_bucket[bucket] = by_bucket.get(bucket, 0) + 1

    posts = tuple(
        PostRow(
            campaign_id=item.campaign_id,
            title=item.title,
            publish_date=item.publish_date,
            published_kinds=tuple(sorted(kinds.get(item.campaign_id, ()))),
            clicks=None if clicks is None else int(clicks.get(item.campaign_id, 0)),
            worksheet=counts.get(item.campaign_id, {}).get("worksheet", 0),
            slot=counts.get(item.campaign_id, {}).get("slot", 0),
            chat=counts.get(item.campaign_id, {}).get("chat", 0),
            voice=counts.get(item.campaign_id, {}).get("voice", 0),
        )
        for item in chosen
    )
    return WeekReport(
        week=week,
        start=start,
        end=end,
        posts=posts,
        untagged_opt_ins=untagged,
        d1_pulled=d1_rows is not None,
        clicks_pulled=clicks is not None,
    )


def best_post(report: WeekReport) -> str | None:
    """Highest opt-ins wins; clicks break ties; no signal at all means no answer."""

    if not report.d1_pulled and not report.clicks_pulled:
        return None
    ranked = sorted(
        report.posts,
        key=lambda post: (post.opt_ins, post.clicks or 0, -int(post.campaign_id[1:])),
        reverse=True,
    )
    top = ranked[0]
    if top.opt_ins == 0 and not (report.clicks_pulled and (top.clicks or 0) > 0):
        return None
    return top.campaign_id


def update_tracking(text: str, report: WeekReport) -> str:
    """Fill this week's owned cells (Clicks, Opt-ins, Best post) in the tally table.

    Dates, Calls, Clients, and Note cells are preserved verbatim; an unpulled
    source keeps whatever the cell already held.
    """

    lines = text.split("\n")
    for index, line in enumerate(lines):
        # | Week | Dates | Clicks | Opt-ins | Calls | Clients | Best post | Note |
        cells = [cell.strip() for cell in line.split("|")]
        if len(cells) < 10 or cells[1] != str(report.week):
            continue
        if report.clicks_pulled:
            cells[3] = str(report.total_clicks)
        if report.d1_pulled:
            cells[4] = str(report.total_opt_ins)
        best = best_post(report)
        if best is not None:
            cells[7] = best
        lines[index] = "| " + " | ".join(cells[1:9]) + " |"
        return "\n".join(lines)
    raise ScorecardError(f"TRACKING.md has no weekly tally row for week {report.week}")


def _cell(value: int | None) -> str:
    return UNPULLED if value is None else str(value)


def render_week_section(report: WeekReport, generated_at: datetime) -> str:
    header = (
        f"## Week {report.week} ({report.start.isoformat()} to {report.end.isoformat()})\n\n"
        f"Generated {generated_at.isoformat(timespec='seconds')} by `im-publisher scorecard`. "
        f"D1: {'pulled' if report.d1_pulled else UNPULLED} · "
        f"Clicks: {'pulled' if report.clicks_pulled else UNPULLED}\n\n"
    )
    rows = [
        "| Post | Title | Published | Clicks | Worksheet | Slot | Chat | Voice |",
        "|---|---|---|---:|---:|---:|---:|---:|",
    ]
    for post in report.posts:
        published = "+".join(post.published_kinds) if post.published_kinds else "—"
        rows.append(
            f"| {post.campaign_id} | {post.title} | {published} | {_cell(post.clicks)} "
            f"| {post.worksheet} | {post.slot} | {post.chat} | {post.voice} |"
        )
    totals = (
        f"\nWeek totals: clicks {_cell(report.total_clicks if report.clicks_pulled else None)}, "
        f"opt-ins {_cell(report.total_opt_ins if report.d1_pulled else None)}, "
        f"untagged opt-ins {_cell(report.untagged_opt_ins if report.d1_pulled else None)}. "
        f"Best post: {best_post(report) or '—'}.\n"
    )
    return header + "\n".join(rows) + "\n" + totals


def upsert_week_section(existing: str | None, section: str, week: int) -> str:
    """Replace this week's section in SCORECARD.md, preserving every other week."""

    preamble = (
        "# Campaign Scorecard\n\n"
        "Per-week chain detail behind TRACKING.md. Sections are regenerated in\n"
        "place by `im-publisher scorecard`; hand edits inside a week section do\n"
        "not survive a re-run.\n"
    )
    body = existing if existing is not None else preamble
    marker = f"## Week {week} ("
    start = body.find(marker)
    if start == -1:
        if not body.endswith("\n"):
            body += "\n"
        return body + "\n" + section
    tail = body.find("\n## Week ", start + 1)
    if tail == -1:
        return body[:start] + section
    return body[:start] + section + body[tail + 1 :]


def _parse_wrangler_json(raw: str) -> list[dict[str, object]]:
    """Accept both the bare object and one-element array shapes wrangler emits."""

    stripped = raw[min(
        (i for i in (raw.find("["), raw.find("{")) if i != -1),
        default=0,
    ):]
    data = json.loads(stripped)
    if isinstance(data, list):
        data = data[0] if data else {}
    results = data.get("results", []) if isinstance(data, dict) else []
    return [row for row in results if isinstance(row, dict)]


def d1_sql(start: date, end: date) -> str:
    return (
        "SELECT created_at, source, use_case, system_interest, "
        f"COALESCE(NULLIF(utm_content,''),'{UNTAGGED}') AS utm_content "
        f"FROM leads WHERE created_at >= '{start.isoformat()}T00:00:00' "
        f"AND created_at < '{end.isoformat()}T00:00:00'"
    )


def fetch_d1_rows(repository_root: Path, start: date, end: date) -> list[dict[str, object]] | None:
    """Live D1 pull through the worker's wrangler auth. None means unpulled."""

    npx = shutil.which("npx") or "npx"
    try:
        proc = subprocess.run(  # noqa: S603
            [npx, "wrangler", "d1", "execute", D1_DATABASE, "--remote", "--json",
             "--command", d1_sql(start, end)],
            cwd=repository_root / "worker",
            capture_output=True,
            text=True,
            timeout=120,
            check=False,
        )
    except (OSError, subprocess.TimeoutExpired) as exc:
        print(f"scorecard: D1 pull failed to run ({exc}); continuing {UNPULLED}")
        return None
    if proc.returncode != 0:
        tail = (proc.stderr or proc.stdout).strip().splitlines()[-3:]
        print(f"scorecard: D1 pull exited {proc.returncode}; continuing {UNPULLED}")
        for line in tail:
            print(f"  {line}")
        return None
    try:
        return _parse_wrangler_json(proc.stdout)
    except (ValueError, KeyError):
        print(f"scorecard: D1 output was not parseable JSON; continuing {UNPULLED}")
        return None


def load_clicks(path: Path) -> dict[str, int]:
    data = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(data, dict):
        raise ScorecardError("clicks file must be a JSON object of {\"pNN\": clicks}")
    clicks: dict[str, int] = {}
    for key, value in data.items():
        if not isinstance(key, str) or len(key) != 3 or not key.startswith("p"):
            raise ScorecardError(f"clicks file has a non-pNN key: {key!r}")
        clicks[key] = int(value)
    return clicks


def append_run_receipt(path: Path, receipt: Mapping[str, object]) -> None:
    # ponytail: plain append-only JSONL, not the hash-chained publish ledger —
    # grading runs need a record, not chain proofs; upgrade if these receipts
    # ever leave the campaign folder.
    with path.open("a", encoding="utf-8", newline="\n") as fh:
        fh.write(json.dumps(dict(receipt), ensure_ascii=False, sort_keys=True) + "\n")


def run_scorecard(
    repository_root: Path,
    week: int,
    d1_json: Path | None,
    clicks_json: Path | None,
    d1_live: bool,
) -> int:
    campaign_dir = repository_root / CAMPAIGN_DIR
    tracking_path = campaign_dir / "TRACKING.md"
    scorecard_path = campaign_dir / "SCORECARD.md"
    runs_path = campaign_dir / "SCORECARD-RUNS.jsonl"
    if not tracking_path.exists():
        raise ScorecardError(f"missing {tracking_path}")

    manifest = load_manifest(campaign_dir / "PUBLISHING-MANIFEST.json")
    items = [entry.campaign for entry in manifest.items]
    ledger_events = list(JsonlLedger(campaign_dir / "PUBLISHING-LEDGER.jsonl").read())

    chosen = week_items(items, week)
    start, end = week_window(chosen)

    d1_rows: list[dict[str, object]] | None
    if d1_json is not None:
        d1_rows = _parse_wrangler_json(d1_json.read_text(encoding="utf-8"))
    elif d1_live:
        d1_rows = fetch_d1_rows(repository_root, start, end)
    else:
        d1_rows = None
    clicks = load_clicks(clicks_json) if clicks_json is not None else None

    report = aggregate(week, items, ledger_events, d1_rows, clicks)
    generated_at = datetime.now(UTC)

    tracking_text = tracking_path.read_text(encoding="utf-8")
    tracking_path.write_text(update_tracking(tracking_text, report), encoding="utf-8", newline="\n")

    section = render_week_section(report, generated_at)
    existing = (
        scorecard_path.read_text(encoding="utf-8") if scorecard_path.exists() else None
    )
    scorecard_path.write_text(
        upsert_week_section(existing, section, week), encoding="utf-8", newline="\n"
    )

    append_run_receipt(
        runs_path,
        {
            "run_at": generated_at.isoformat(timespec="seconds"),
            "week": week,
            "window": [start.isoformat(), end.isoformat()],
            "sources": {
                "ledger_events": len(ledger_events),
                "d1_rows": len(d1_rows) if d1_rows is not None else UNPULLED,
                "clicks": "file" if clicks is not None else UNPULLED,
            },
            "totals": {
                "clicks": report.total_clicks if report.clicks_pulled else UNPULLED,
                "opt_ins": report.total_opt_ins if report.d1_pulled else UNPULLED,
                "untagged_opt_ins": report.untagged_opt_ins if report.d1_pulled else UNPULLED,
            },
            "section_sha256": hashlib.sha256(section.encode("utf-8")).hexdigest(),
        },
    )
    print(
        f"scorecard week {week}: clicks "
        f"{_cell(report.total_clicks if report.clicks_pulled else None)}, opt-ins "
        f"{_cell(report.total_opt_ins if report.d1_pulled else None)}, best "
        f"{best_post(report) or '—'} -> {scorecard_path.name}, TRACKING.md row updated"
    )
    return 0
