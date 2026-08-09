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
        choices=("status", "run-due", "publish-blog", "publish-linkedin"),
    )
    parser.add_argument("--item", help="campaign ID for an explicit publication command")
    args = parser.parse_args(argv)
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
