#!/usr/bin/env bash
# CANON §0 Layer-3 owner for the skills directory.
#
# _work/skills/ is gitignored and invisible to every gate this repo has, which is
# how six skills kept a retired product ladder and a stale price list for two and a
# half months after the site had dropped both. A git hook can read a gitignored
# path, so the drift check rides the website's existing pre-commit hook.
#
# Fails on:
#   - a retired product-line name (Summit / Landfall / Citadel / Pinnacle)
#   - a marked selling-price figure (ASP / MSRP / list price near a dollar amount;
#     a tier-name price already fails on the name alone, and unmarked third-party
#     figures — cloud rates, competitor costs, fines — are the pain hook and pass)
#   - a stale company fact (former co-founder, old phone, wrong entity)
#
# ROLLOUT: warn-only until someone runs  touch tools/.skills-gate-enforce
# Warn first so a skills-directory problem cannot stop an unrelated website commit
# on day one, matching how the other gates here were introduced.
#
# Fail-safe: a missing directory, a missing grep, or an unreadable file is a pass,
# never a block. Only a real finding fails, and only once enforcing.
set -uo pipefail

ROOT="$(git rev-parse --show-toplevel 2>/dev/null || pwd)"
SKILLS="$ROOT/_work/skills"
ENFORCE=0
[ -f "$ROOT/tools/.skills-gate-enforce" ] && ENFORCE=1

# Nothing to scan is not a failure: fresh clones and CI checkouts have no _work/.
[ -d "$SKILLS" ] || exit 0
command -v grep >/dev/null 2>&1 || exit 0

FOUND=0
report() {  # report <label> <file:line:text>
  echo "SKILLS-DRIFT  $1: $2" >&2
  FOUND=1
}

# --- Lines that legitimately contain the banned words ---------------------------
# The credo blocks name the retired products in order to forbid them, and two skills
# carry a literal grep command as their own regression gate. Both are the fix, not
# the defect. Anything else naming a retired product is describing it.
# Match the intent, not one phrasing. The first cut keyed on the exact credo wording
# and then warned on _work/skills/README.md, which forbids the same names in slightly
# different words ("Never resurrect" rather than "Do not resurrect"). A gate that only
# recognises one sentence is a gate that cries wolf the moment someone rewords the rule.
is_exempt() {
  case "$1" in
    *resurrect*)   return 0 ;;  # "Do not resurrect" / "Never resurrect them"
    *retired*)     return 0 ;;  # "The retired ones were ..."
    *"grep -"*)    return 0 ;;  # a regression-gate command line
  esac
  return 1
}

while IFS= read -r hit; do
  line="${hit#*:*:}"
  is_exempt "$line" && continue
  report "retired product name" "$hit"
done < <(grep -rniE 'Summit|Landfall|Citadel|Pinnacle' --include='*.md' "$SKILLS" 2>/dev/null || true)

# Selling-price markers only (mirrors the site pricing gate, 2026-07-26). Any
# unmarked dollar figure is third-party by construction and never reported.
while IFS= read -r hit; do
  line="${hit#*:*:}"
  is_exempt "$line" && continue
  report "IM selling-price figure" "$hit"
done < <(grep -rnE '\b(ASP|MSRP|[Ll]ist [Pp]rice)\b.{0,60}\$[0-9]' --include='*.md' "$SKILLS" 2>/dev/null || true)

while IFS= read -r hit; do
  report "stale company fact" "$hit"
done < <(grep -rniE 'Dougherty|801-609-1130|8016091130|Island Mountain LLC' --include='*.md' "$SKILLS" 2>/dev/null || true)

if [ "$FOUND" -eq 0 ]; then
  exit 0
fi

if [ "$ENFORCE" -eq 1 ]; then
  echo "BLOCK  _work/skills/ carries retired product, pricing, or stale-fact content." >&2
  echo "       Fix the skill. Never --no-verify." >&2
  exit 1
fi

echo "WARN   _work/skills/ drift findings above (warn-only)." >&2
echo "       Enforce with: touch tools/.skills-gate-enforce" >&2
exit 0
