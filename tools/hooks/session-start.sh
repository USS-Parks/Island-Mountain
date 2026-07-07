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

# ---------------------------------------------------------------------------
# Remote sessions land on the repo's default branch — Basho's standing order,
# 2026-07-07. Claude Code on the web starts every session on an auto-generated
# `claude/<topic>-<hash>` branch; Basho does not want harness branches, ever.
# In a remote session ONLY (local CoWork sessions keep the CANON §I.5b
# session-branch flow), this block:
#   1. resolves origin's default branch (origin/HEAD; asks the remote if the
#      clone doesn't know; falls back to `main`) — so whichever repo the
#      session was opened on, its OWN mainline is where the session lands;
#   2. if HEAD is on a harness `claude/*` branch, fetches the default branch
#      and — only when the working tree is clean AND the harness branch holds
#      zero commits of its own — checks out the default branch and deletes the
#      harness branch. A `claude/*` branch carrying real unmerged commits (a
#      resumed session) is left untouched: repositioning must never eat work.
# Same doctrine as above: fail-safe, idempotent, never blocks the session.
if [ "${CLAUDE_CODE_REMOTE:-}" = "true" ]; then
  current="$(git symbolic-ref --quiet --short HEAD 2>/dev/null || echo HEAD)"
  case "$current" in
    claude/*)
      default="$(git symbolic-ref --quiet --short refs/remotes/origin/HEAD 2>/dev/null | sed 's|^origin/||')"
      if [ -z "$default" ]; then
        default="$(git ls-remote --symref origin HEAD 2>/dev/null | sed -n 's|^ref: refs/heads/\(.*\)\tHEAD$|\1|p')"
      fi
      default="${default:-main}"
      if ! git fetch origin "$default" 2>/dev/null; then
        echo "[session-start] could not fetch origin/$default; staying on $current" >&2
      elif [ -n "$(git status --porcelain 2>/dev/null)" ]; then
        echo "[session-start] working tree not clean; staying on $current" >&2
      elif ! git merge-base --is-ancestor "$current" "refs/remotes/origin/$default" 2>/dev/null; then
        echo "[session-start] $current has commits not on origin/$default; keeping it (not eating work)" >&2
      else
        # Never reset away local work: if a local default branch already
        # exists and holds commits origin doesn't have (unpushed work from
        # earlier turns of this session), switch to it as-is; otherwise
        # create/sync it at origin's tip.
        mode=""
        if git show-ref --verify --quiet "refs/heads/$default" \
           && ! git merge-base --is-ancestor "refs/heads/$default" "refs/remotes/origin/$default" 2>/dev/null; then
          git checkout "$default" 2>/dev/null && mode="kept local $default, it has unpushed commits"
        else
          git checkout -B "$default" "refs/remotes/origin/$default" 2>/dev/null && mode="synced to origin/$default"
        fi
        if [ -n "$mode" ]; then
          git branch -D "$current" 2>/dev/null || true
          echo "[session-start] repositioned onto $default ($mode); harness branch $current deleted" >&2
          # stdout is injected into session context: standing orders for the agent.
          echo "SessionStart: this session is on '$default' by Basho's standing order. The harness branch '$current' was deleted — do not recreate it, do not create any claude/* branch, and do not use worktrees. Work directly on '$default'; push only when Basho explicitly says so."
        else
          echo "[session-start] checkout of $default failed; staying on $current" >&2
        fi
      fi
      ;;
  esac
fi

exit 0
