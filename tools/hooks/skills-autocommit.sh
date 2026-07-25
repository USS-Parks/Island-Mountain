#!/usr/bin/env bash
# PostToolUse (Write|Edit) — give _work/skills/ a history nobody has to remember to keep.
#
# The skills directory is gitignored by the website repo and carries its own inner
# repo. Agents edit those files far more often than a person does, so the commit
# cannot depend on anyone deciding to make one.
#
# No path parsing: the hook fires on every Write/Edit, and the "does the inner repo
# have changes" check is the filter. Cheaper and less brittle than reading the tool
# payload, and it also catches edits made by any other means in the same turn.
#
# Fail-safe by construction: every exit is 0. A hook that can break an edit is worse
# than no hook (CANON §I.2, gates must never clap clean work).
set -uo pipefail

ROOT="${CLAUDE_PROJECT_DIR:-$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)}"
SKILLS="$ROOT/_work/skills"

# Nothing to do on a fresh clone, or before the inner repo exists.
[ -d "$SKILLS/.git" ] || exit 0

# Anything staged or unstaged? --quiet returns 1 when there are differences.
if git -C "$SKILLS" diff --quiet --ignore-submodules HEAD 2>/dev/null \
   && [ -z "$(git -C "$SKILLS" ls-files --others --exclude-standard 2>/dev/null)" ]; then
  exit 0
fi

git -C "$SKILLS" add -A >/dev/null 2>&1 || exit 0

CHANGED="$(git -C "$SKILLS" diff --cached --name-only | tr '\n' ' ' | sed 's/ *$//')"
[ -n "$CHANGED" ] || exit 0

git -C "$SKILLS" commit -q -m "Autosave skills: ${CHANGED}

Written by a Claude Code session via the PostToolUse hook. Squash or reword
freely; the point is that nothing is lost between deliberate commits.

Authored and reviewed by Basho Parks, Copyright 2026" >/dev/null 2>&1 || exit 0

# Get it off the drive. A local commit survives a mistake; it does not survive the
# disk. USS-Parks/Island-Mountain-Skills is private, so this publishes nothing.
# Best-effort by design: offline, no remote, or a rejected push all exit quietly,
# and the next edit pushes the backlog. Timeout so a hung network cannot stall an
# edit; 20s is far longer than a markdown push needs.
if git -C "$SKILLS" remote get-url origin >/dev/null 2>&1; then
  timeout 20 git -C "$SKILLS" push -q origin HEAD >/dev/null 2>&1 || true
fi

exit 0
