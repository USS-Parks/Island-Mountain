"""Command line entrypoint for the Island Mountain NOOA publisher."""

from __future__ import annotations

import argparse
import json
import os
from pathlib import Path

from .agent import AuthorityCampaignPublisher
from .approvals import load_approvals, load_manifest
from .ledger import JsonlLedger
from .linkedin import LinkedInClient
from .scorecard import run_scorecard


def _repository_root() -> Path:
    return Path(__file__).resolve().parents[4]


def _agent() -> AuthorityCampaignPublisher:
    root = _repository_root()
    campaign = root / "linkedin-six-week-authority-campaign-2026-08-10"
    production = os.environ.get("PUBLISH_ENABLED", "").lower() == "true"
    linkedin = None
    if production:
        required = {
            "LINKEDIN_ACCESS_TOKEN": os.environ.get("LINKEDIN_ACCESS_TOKEN", ""),
            "LINKEDIN_ACTOR_URN": os.environ.get("LINKEDIN_ACTOR_URN", ""),
            "LINKEDIN_VERSION": os.environ.get("LINKEDIN_VERSION", ""),
        }
        missing = [name for name, value in required.items() if not value]
        if missing:
            raise SystemExit(f"missing production configuration: {', '.join(missing)}")
        linkedin = LinkedInClient(
            root,
            required["LINKEDIN_ACCESS_TOKEN"],
            required["LINKEDIN_ACTOR_URN"],
            required["LINKEDIN_VERSION"],
        )
    return AuthorityCampaignPublisher(
        load_manifest(campaign / "PUBLISHING-MANIFEST.json"),
        load_approvals(campaign / "PUBLISHING-APPROVALS.json"),
        mode="production" if production else "dry-run",
        repository_root=root,
        linkedin=linkedin,
        ledger=JsonlLedger(campaign / "PUBLISHING-LEDGER.jsonl"),
    )


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "command",
        choices=("status", "run-due", "publish-blog", "publish-linkedin", "scorecard", "watch"),
    )
    parser.add_argument("--day", help="watch: audit this date (YYYY-MM-DD, default today)")
    parser.add_argument("--item", help="campaign ID for an explicit publication command")
    parser.add_argument("--week", type=int, help="campaign week number for the scorecard")
    parser.add_argument("--d1-json", type=Path, help="scorecard: wrangler d1 JSON export to read")
    parser.add_argument("--clicks-json", type=Path, help="scorecard: Ahrefs clicks export to read")
    parser.add_argument(
        "--d1-live", action="store_true", help="scorecard: query D1 live through wrangler"
    )
    args = parser.parse_args(argv)
    if args.command == "watch":
        from datetime import date

        from .watchstander import run_watch

        return run_watch(
            _repository_root(),
            date.fromisoformat(args.day) if args.day else None,
        )
    if args.command == "scorecard":
        if args.week is None:
            parser.error("--week is required for the scorecard command")
        return run_scorecard(
            _repository_root(),
            week=args.week,
            d1_json=args.d1_json,
            clicks_json=args.clicks_json,
            d1_live=args.d1_live,
        )
    agent = _agent()
    if args.command == "status":
        print(agent.status().model_dump_json(indent=2))
        return 0
    if args.command == "run-due":
        print(json.dumps(agent.run_due(), indent=2))
        return 0
    if not args.item:
        parser.error("--item is required for an explicit publication command")
    if args.command == "publish-blog":
        print(agent.publish_blog(args.item))
    else:
        print(agent.publish_linkedin(args.item))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
