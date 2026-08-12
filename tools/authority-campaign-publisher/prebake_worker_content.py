#!/usr/bin/env python
"""Pre-bake approved campaign packets into a Worker-consumable content bundle.

Autonomy migration (2026-08-12): the Cloudflare Worker publisher does NOT re-render
articles or re-implement the discovery patchers. This script runs the proven,
hash-checked ``island_mountain_publisher`` renderer/discovery once and emits, for every
APPROVED day:

  - the fully rendered standalone article HTML (the Worker commits it verbatim), and
  - the four marker-anchored discovery fragments (blog.html / index.html / sitemap.xml /
    llms.txt), encoded as {anchor, position, fragment_lines, marker, present_count} so the
    Worker reproduces the exact same idempotent insertion against LIVE repo state, and
  - the LinkedIn commentary / first comment / card for the social lane.

Fidelity comes from reusing the Python modules directly rather than porting them to TS.
Output: worker/src/publisher/content.generated.json (imported by the Worker).
Re-run whenever PUBLISHING-MANIFEST.json / PUBLISHING-APPROVALS.json change (e.g. after
signing p16-p30):  uv run --frozen python prebake_worker_content.py
"""

from __future__ import annotations

import json
from pathlib import Path

from island_mountain_publisher.approvals import (
    ApprovalError,
    load_approvals,
    load_manifest,
    validate_approval,
)
from island_mountain_publisher.discovery import _blog_card, _rail_card
from island_mountain_publisher.models import ManifestItem
from island_mountain_publisher.renderer import render_article

# Structural anchors, copied verbatim from discovery.py. A drift here is caught by the
# Worker's own count-checks (it refuses to insert when the anchor is absent/ambiguous).
BLOG_GRID_ANCHOR = '      <div class="blog-grid fade-in">'
BLOG_RAIL_ANCHOR = (
    '      <div class="blog-rail" role="region" '
    'aria-label="Blog posts, newest first" tabindex="0">'
)
LLMS_ANCHOR = "## Blog"
SITEMAP_TOKEN = "</urlset>"


def _linkedin_commentary(item: ManifestItem) -> str:
    # Mirror LinkedInClient.create_post: append the hashtag line only when the signed
    # summary does not already end with it (double-hashtag bug fixed 2026-08-10).
    summary = item.campaign.linkedin_summary
    joined = " ".join(item.campaign.linkedin_hashtags)
    if joined and summary.rstrip().endswith(joined):
        return summary
    return "\n\n".join((summary, joined))


def _sitemap_fragment(item: ManifestItem) -> list[str]:
    # Mirror discovery.update_sitemap's <url> block.
    return [
        "  <url>",
        f"    <loc>{item.blog_url}</loc>",
        f"    <lastmod>{item.campaign.publish_date.isoformat()}</lastmod>",
        "    <changefreq>monthly</changefreq>",
        "    <priority>0.7</priority>",
        "  </url>",
    ]


def _llms_fragment(item: ManifestItem) -> list[str]:
    # Mirror discovery.update_llms; trailing "" reproduces the entry's own newline.
    title = item.campaign.title.replace("[", "\\[").replace("]", "\\]")
    return [f"- [{title}]({item.blog_url})", ""]


def _surfaces(item: ManifestItem) -> list[dict]:
    href_marker = f'href="{item.blog_path}"'
    return [
        {
            "path": "blog.html",
            "anchor": BLOG_GRID_ANCHOR,
            "anchor_trailing_newline": True,
            "position": "after",
            "prepend_newline": False,
            # split on "\n" recovers discovery._blog_card's line tuple, trailing "" and all.
            "fragment_lines": _blog_card(item, "\n").split("\n"),
            "marker": href_marker,
            "present_count": 2,
        },
        {
            "path": "index.html",
            "anchor": BLOG_RAIL_ANCHOR,
            "anchor_trailing_newline": True,
            "position": "after",
            "prepend_newline": True,  # update_home_rail inserts an extra newline first
            "fragment_lines": _rail_card(item, "\n").split("\n"),
            "marker": href_marker,
            "present_count": 2,
        },
        {
            "path": "sitemap.xml",
            "anchor": SITEMAP_TOKEN,
            "anchor_trailing_newline": False,
            "position": "before",
            "prepend_newline": False,
            "fragment_lines": _sitemap_fragment(item),
            "marker": f"<loc>{item.blog_url}</loc>",
            "present_count": 1,
        },
        {
            "path": "llms.txt",
            "anchor": LLMS_ANCHOR,
            "anchor_trailing_newline": True,
            "position": "after",
            "prepend_newline": False,
            "fragment_lines": _llms_fragment(item),
            "marker": item.blog_url,
            "present_count": 1,
        },
    ]


def main() -> int:
    root = Path(__file__).resolve().parents[2]  # repo root
    campaign = root / "linkedin-six-week-authority-campaign-2026-08-10"
    template = root / "tools" / "authority-campaign-publisher" / "templates" / "blog-post.html"
    manifest = load_manifest(campaign / "PUBLISHING-MANIFEST.json")
    approvals = load_approvals(campaign / "PUBLISHING-APPROVALS.json")

    items: list[dict] = []
    skipped: list[str] = []
    for item in manifest.items:
        campaign_id = item.campaign.campaign_id
        try:
            validate_approval(manifest, approvals, campaign_id)
        except ApprovalError:
            skipped.append(campaign_id)  # unsigned / blocked: never bake into the Worker
            continue
        rendered = render_article(item, template)  # re-validates the item's content hash
        items.append(
            {
                "campaign_id": campaign_id,
                "publish_date": item.campaign.publish_date.isoformat(),
                "blog_at": item.schedule.blog_at.isoformat(),
                "linkedin_at": item.schedule.linkedin_at.isoformat(),
                "blog_path": item.blog_path,
                "blog_url": item.blog_url,
                "content_sha256": item.content_sha256,
                "article_html": rendered.html.decode("utf-8"),
                "surfaces": _surfaces(item),
                "linkedin": {
                    "commentary": _linkedin_commentary(item),
                    "title": item.campaign.title,
                    "alt_text": item.alt_text,
                    "first_comment": item.linkedin_first_comment,
                    "card_path": item.campaign.card_path,
                },
            }
        )

    bundle = {
        "note": "GENERATED by prebake_worker_content.py - do not hand-edit; re-run after "
        "the manifest/approvals change.",
        "manifest_sha256": manifest.manifest_sha256,
        "items": items,
    }
    out = root / "worker" / "src" / "publisher" / "content.generated.json"
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(bundle, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(f"baked {len(items)} approved items -> {out.relative_to(root).as_posix()}")
    if skipped:
        print(f"skipped (unsigned/blocked): {', '.join(skipped)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
