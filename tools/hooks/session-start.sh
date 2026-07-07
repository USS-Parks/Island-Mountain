#!/usr/bin/env bash
# Claude Code SessionStart hook — re-arm the canon git hooks in this clone.
#
# NOTE: this is a *Claude Code* hook (invoked via .claude/settings.json at the
# start of every session), NOT a git hook. It lives here so every hook in the
# repo is in one place; git never runs it (git only invokes files named after a
# git event — pre-commit, commit-msg, pre-push — so this name is inert to git).
#
# WHY THIS EXISTS: git stores core.hooksPath in .git/config, which git does NOT
# track or clone. Every fresh clone — and every Claude Code on the web session is
# a fresh clone in a throwaway container — therefore starts with the repo's
# commit-msg footer stamp and the pre-commit / pre-push integrity gates
# DISCONNECTED. This hook re-points core.hooksPath at the committed tools/hooks
# dir at the start of every session, so the footer is always stamped and the
# gates always run without anyone having to remember to wire them up.
#
# Idempotent, non-interactive, and fail-safe: it never aborts a session. A
# hooks-wiring step that blocks your session is worse than the problem it solves
# (same doctrine as the commit-msg hook it arms).
set -uo pipefail

# Resolve the working-tree root regardless of where this is invoked from.
root="$(git rev-parse --show-toplevel 2>/dev/null || echo "${CLAUDE_PROJECT_DIR:-.}")"
cd "$root" 2>/dev/null || exit 0

if [ -d tools/hooks ]; then
  if git config core.hooksPath tools/hooks 2>/dev/null; then
    echo "[session-start] core.hooksPath -> tools/hooks (footer + integrity hooks armed)" >&2
  else
    echo "[session-start] could not set core.hooksPath (continuing)" >&2
  fi
else
  echo "[session-start] tools/hooks not found; skipped hooks wiring" >&2
fi

exit 0
