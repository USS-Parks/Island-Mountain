#!/usr/bin/env python3
"""Pre-push gate: every relative import in the Worker's tracked TypeScript must
resolve to a *tracked* file.

Why this and not `tsc`: the failure that motivated this gate was an import
committed while its module file was left untracked (`./routes/watchstander`).
A local `tsc` passes in that state — the untracked file is present on disk — but
the deploy builds the committed tree, where the file is absent, and the Worker
typecheck fails, silently blocking every site deploy. Resolving committed imports
against the tracked file set catches exactly that, is fast, needs no npm/network,
and is immune to unrelated uncommitted worker changes.

Fail-safe: any tooling or internal error skips the gate (exit 0). It only exits 1
when it is certain a committed import cannot resolve.
"""

from __future__ import annotations

import re
import subprocess
import sys
from pathlib import PurePosixPath

# Relative import/export specifiers (must start with ".").
_STATIC = re.compile(r"""(?m)^[ \t]*(?:import|export)\b[\s\S]*?\bfrom[ \t]*['"](\.[^'"\n]+)['"]""")
_SIDE = re.compile(r"""(?m)^[ \t]*import[ \t]*['"](\.[^'"\n]+)['"]""")
_DYN = re.compile(r"""\bimport[ \t]*\([ \t]*['"](\.[^'"\n]+)['"]""")

_EXTS = (".ts", ".tsx", ".d.ts", ".mts", ".cts", ".js", ".jsx", ".mjs", ".cjs")
_INDEX = ("/index.ts", "/index.tsx", "/index.d.ts", "/index.mts", "/index.js", "/index.jsx", "/index.mjs")


def _norm(parts: tuple[str, ...]) -> str:
    out: list[str] = []
    for part in parts:
        if part in ("", "."):
            continue
        if part == "..":
            if out:
                out.pop()
        else:
            out.append(part)
    return "/".join(out)


def resolves(spec: str, from_file: str, tracked: set[str]) -> bool:
    base = PurePosixPath(from_file).parent
    target = _norm((base / spec).parts)
    candidates = [target + ext for ext in _EXTS]
    candidates += [target + idx for idx in _INDEX]
    candidates.append(target)
    # TS allows a `./x.js` specifier to resolve to `x.ts`.
    for suffix in (".js", ".mjs", ".cjs", ".jsx"):
        if target.endswith(suffix):
            stem = target[: -len(suffix)]
            candidates += [stem + ext for ext in (".ts", ".tsx", ".mts", ".cts")]
    return any(candidate in tracked for candidate in candidates)


def _specifiers(text: str) -> set[str]:
    found: set[str] = set()
    for pattern in (_STATIC, _SIDE, _DYN):
        found.update(match.group(1) for match in pattern.finditer(text))
    return found


def _self_test() -> int:
    tracked = {
        "worker/src/routes/watchstander.ts",
        "worker/src/integrations/d1.ts",
        "worker/src/types.ts",
        "worker/src/agent/index.ts",
    }
    cases = [
        ("./routes/watchstander", "worker/src/index.ts", True),
        ("./routes/missing", "worker/src/index.ts", False),   # the incident
        ("../types", "worker/src/routes/x.ts", True),
        ("./integrations/d1.js", "worker/src/lead-processor.ts", True),  # .js -> .ts
        ("./agent", "worker/src/index.ts", True),             # dir -> /index.ts
        ("nonrelative", "worker/src/index.ts", False),
    ]
    failures = []
    for spec, src, expected in cases:
        if resolves(spec, src, tracked) != expected:
            failures.append(f"{spec!r} from {src}: expected {expected}")
    extract = _specifiers(
        "import { a } from './routes/watchstander'\n"
        "import './side'\n"
        "const m = await import('./dyn')\n"
        "export { b } from '../types'\n"
        "import x from 'nooa'\n"
    )
    if extract != {"./routes/watchstander", "./side", "./dyn", "../types"}:
        failures.append(f"specifier extraction: {sorted(extract)}")
    if failures:
        for failure in failures:
            print(f"SELF-TEST FAIL  {failure}", file=sys.stderr)
        return 1
    print("worker-import-gate: self-test clean (7 cases)")
    return 0


def main() -> int:
    if len(sys.argv) > 1 and sys.argv[1] == "self-test":
        return _self_test()
    try:
        output = subprocess.check_output(["git", "ls-files", "--", "worker/"], text=True, encoding="utf-8")
    except Exception as exc:  # noqa: BLE001 — git missing: skip, never block
        print(f"WARN   worker-import-gate skipped (git unavailable): {exc}", file=sys.stderr)
        return 0
    tracked = {line for line in output.splitlines() if line}
    sources = [
        f for f in tracked
        if f.startswith("worker/src/") and f.endswith((".ts", ".tsx")) and not f.endswith(".d.ts")
    ]
    problems: list[str] = []
    for source in sources:
        try:
            with open(source, encoding="utf-8") as handle:
                text = handle.read()
        except OSError:
            continue
        for spec in _specifiers(text):
            if not resolves(spec, source, tracked):
                problems.append(f"{source}: relative import {spec!r} resolves to no tracked file")
    if problems:
        for problem in problems:
            print(f"BLOCK  {problem}", file=sys.stderr)
        print(
            f"worker-import-gate: {len(problems)} unresolved import(s). The Worker "
            "typecheck will fail at deploy. Commit the missing file(s) before pushing.",
            file=sys.stderr,
        )
        return 1
    print(f"worker-import-gate: clean ({len(sources)} worker TS files).")
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main())
    except SystemExit:
        raise
    except Exception as exc:  # noqa: BLE001 — ultimate fail-safe: never false-block a push
        print(f"WARN   worker-import-gate internal error, skipping: {exc}", file=sys.stderr)
        raise SystemExit(0)
