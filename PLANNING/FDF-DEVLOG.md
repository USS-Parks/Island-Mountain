# FDF DEVLOG — Forward-Deployed Facelift

Branch `session/forward-deployed-facelift`, worktree `C:\Users\17076\Documents\Claude\IM-Forward-Deployed`, off `main` @ `012963b`. STS approved by Basho 2026-07-24.

81 files changed, +2236 / -1406, across 11 commits.

| Prompt | Commit | What changed | Gates |
|---|---|---|---|
| F1 | `58ef42b` | `PLANNING/FDF-INVENTORY.md`: every public surface classified, contradictions mapped, 11 verticals mapped to one shared template | read-only |
| F2 | `952572f` | `PLANNING/FDF-SPINE.md`: thesis, SME vignettes, four-step arc, two-layer swappability, naming decisions | read-only |
| F3 | `073573b` | Homepage rewritten; the Order/Shipped process arc becomes Shadow/Translate/Build/Hand Off | pricing, NUL, voice, rendered 1280 + 375 |
| F4 | `797adaf` | New `forward-deployed-ai-engineering.html`; nav to 8 items site-wide incl. blog; sitemap | as above + JSON-LD |
| F5 | `b688de2` | `products.html` from SKU sheet to The Stack | pricing, NUL, rendered |
| F6 | `1cd8069` | `about.html` identity flip; FAQ gains the two deployment questions | pricing, NUL |
| F7 | `74d9d79` | Contact + worksheet to scoping-call framing; two missed nav variants | pricing, NUL |
| F8 | `60b1b85` | One narrative thread on the Security Fabric page, nothing else | NUL |
| F9 | `7f3d17e` | 11 verticals + solutions/resources/why-island-mountain swept; **JSON-LD prices stripped** | full ladder |
| F10 | `5ad2434` | Agent persona, qualifier, emails re-scripted | `npm test` 23/23 |
| F11 | this | Verify ladder, DEVLOG, merge | full ladder |

## Verify ladder at wrap (all green)

1. Canonical pricing grep `Summit[^<]{0,60}\$[0-9]` — clean.
2. JSON-LD prices on public pages — none; only the two hidden pricing pages retain them, deliberately.
3. JSON-LD validity — 159 blocks parsed, 0 invalid.
4. NUL bytes — 0 across 77 HTML files.
5. Closing tags — every HTML file closes. `googlecff518dc414acaa3.html` excluded: it is a bare Search Console token, not HTML, and is untouched.
6. Nav consistency — every nav carries exactly one Forward Deployed and one Security Fabric entry.
7. Voice gate — no em-dash, "actually", "heavy lifting", or "load bearing" in added lines.
8. Rendered — homepage, Forward Deployed, products, and a vertical page checked at 1280 and at 375×812. No horizontal overflow, no broken images.
9. `npm test` in `worker/` — 23 passing, 0 failing.
10. Repo hooks — `html-structure-gate` and `no-slop` clean on every commit. No `--no-verify`.

## Findings surfaced during the work

**Two pre-existing pricing-posture breaches on `main`, neither introduced here.**

1. **Severe.** 13 files published Island Mountain prices in machine-readable JSON-LD `AggregateOffer` blocks. The 11 public vertical pages carried `lowPrice 59000` / `highPrice 225000`; `pricing.html` and `landfall-preorder.html` carry the full tier ladder. The posture in `CLAUDE.md` names JSON-LD explicitly. The canonical grep gate cannot see these because the markup has no dollar sign and no tier name within 60 characters. **Fixed on the 11 public pages** by removing the `offers` object (a Product node is valid without it, so this is the smallest correct diff). **The two hidden pages are untouched and await Basho's decision** — both are deliberately unlinked and exist to show pricing, so stripping them is a product call, not a compliance cleanup.
2. **Minor, fixed.** `on-premises-ai-cost-comparison.html` put a tier name within 60 characters of a dollar figure and tripped the canonical grep.

**Recommended gate addition** (not yet wired; Layer-3 owner would be `tools/hooks/pre-commit`):

```
grep -nE '"(low|high)Price"' *.html     # must match hidden pages only
```

**Two defects I introduced and caught.** The site-wide nav sed put `class="active"` on the wrong item on the Security Fabric page, and rewrote the Security Fabric entry into a duplicate Forward Deployed on the two pages that already had the new nav. Both found by the rendered check, both fixed before the F4 commit.

## Corrections to the plan

- The PSPR said `PLANNING/` was gitignored. It is tracked, so the plan, inventory, and spine are committed like every other plan there.
- The PSPR's F2 checkpoint and F3 copy review were folded into the STS run at Basho's instruction to execute all prompts.

## Not done, deliberately

- **Push to `origin/main` and `npm run deploy` for the worker.** Both held for Basho's explicit order. The site deploys from `main` on every push.
- Prices on `pricing.html` and `landfall-preorder.html` (see above).
- Blog post rewrites (non-goal). Two blog CTA buttons were updated as navigation chrome; editorial body copy is untouched.
- `investors.html`, careers pages, `lamprey/index.html`, privacy, terms, style-guide, bibliography (non-goals).
- No visual or design-system changes. No URL renames. Exactly one new URL.
