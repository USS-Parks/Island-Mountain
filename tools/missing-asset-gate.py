#!/usr/bin/env python3
"""Pre-commit missing-asset gate: no commit may reference a local resource that
will not exist after it lands (the CI reds of 2026-07-26).

Two legs, both judging the INDEX (never the working tree, so an untracked
on-disk asset cannot green a reference):

- Fast leg, every commit that stages html/css/js: parse just the staged files
  (content via `git show :path`, no disk writes) with the parser classes
  imported from tools/build-pages-artifact.py, and resolve each reference
  against the post-commit file list. No temp tree: on this machine the AV
  on-access scan costs ~38ms per fresh temp file, which made the full run ~9s.
- Full leg, only when the commit deletes or renames tracked files (or on
  `all`): materialize the index and run the CI validator verbatim, because a
  deletion can orphan references in files this commit never touched. Text
  files carry real content; all other tracked paths become zero-byte
  placeholders, which satisfies the validator's existence checks.

Exit codes: 0 pass/skip, 2 genuine findings (block), 3 tooling (warn, never block).
"""

from __future__ import annotations

import importlib.util
import subprocess
import sys
import tempfile
from pathlib import Path, PurePosixPath

ROOT = Path(__file__).resolve().parents[1]
VALIDATOR = "tools/build-pages-artifact.py"
CONTENT_SUFFIXES = {".html", ".htm", ".css", ".js", ".py"}
FINDING_MARKERS = (
    "missing local resources:",
    "forbidden artifact paths:",
    "NUL byte in text asset:",
    "missing </html>",
    "path escapes the site root",
    "FileNotFoundError",  # validator copy(): a required/seeded file absent from the tree
)


def git(*args: str, **kwargs) -> subprocess.CompletedProcess:
    return subprocess.run(("git", *args), cwd=ROOT, capture_output=True, **kwargs)


def tracked_paths() -> list[str] | None:
    listing = git("ls-files", "-z")
    if listing.returncode != 0:
        return None
    return [p.decode("utf-8", "surrogateescape") for p in listing.stdout.split(b"\0") if p]


def fast_leg(staged: list[str], index_set: set[str]) -> list[str] | None:
    """Check every reference in the staged text files against the post-commit
    file list. Returns finding lines, or None on tooling trouble."""
    spec = importlib.util.spec_from_file_location("bpa", ROOT / VALIDATOR)
    if spec is None or spec.loader is None:
        return None
    bpa = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(bpa)

    missing: list[str] = []
    for path in staged:
        show = git("show", f":{path}")
        if show.returncode != 0:
            return None
        text = show.stdout.decode("utf-8", "replace")
        rel = PurePosixPath(path)
        suffix = rel.suffix.lower()
        if suffix in {".html", ".htm"}:
            parser = bpa.ResourceParser()
            parser.feed(text)
            urls = parser.urls
        elif suffix == ".css":
            urls = [(m.group(2), True) for m in bpa.CSS_URL_RE.finditer(text)]
        else:
            urls = [(m.group(2), True) for m in bpa.JS_ASSET_RE.finditer(text)]
        for raw_url, required in urls:
            try:
                target = bpa.local_path(raw_url, rel)
            except ValueError as exc:
                missing.append(f"{path}: {exc}")
                continue
            if target is None or str(target) in index_set:
                continue
            # Mirrors the validator's flag rule (build-pages-artifact.py main():
            # only a required non-html target is a missing resource).
            if required and target.suffix.lower() not in {".html", ".htm"}:
                missing.append(f"{path}: {raw_url}")
    return sorted(set(missing))


def full_leg(tracked: list[str]) -> int:
    with tempfile.TemporaryDirectory(prefix="im-asset-gate-") as tmp:
        tree = Path(tmp) / "tree"
        content = [p for p in tracked if Path(p).suffix.lower() in CONTENT_SUFFIXES]
        checkout = git(
            "checkout-index", "-z", "--stdin", f"--prefix={tree.as_posix()}/",
            input="\0".join(content).encode("utf-8", "surrogateescape") + b"\0",
        )
        if checkout.returncode != 0:
            sys.stderr.write(checkout.stderr.decode("utf-8", "replace"))
            return 3
        for p in tracked:
            target = tree.joinpath(*p.split("/"))
            if not target.exists():
                target.parent.mkdir(parents=True, exist_ok=True)
                target.touch()

        result = subprocess.run(
            (sys.executable, str(tree / VALIDATOR), "--output", str(Path(tmp) / "artifact")),
            capture_output=True, text=True,
        )
        if result.returncode == 0:
            return 0
        output = result.stdout + result.stderr
        sys.stderr.write(output)
        return 2 if any(marker in output for marker in FINDING_MARKERS) else 3


def main() -> int:
    force = "all" in sys.argv[1:]

    staged_refs = git("diff", "--cached", "--name-only", "-z", "--diff-filter=ACMR",
                      "--", "*.html", "*.css", "*.js")
    deletions = git("diff", "--cached", "--name-only", "--diff-filter=DR")
    if staged_refs.returncode != 0 or deletions.returncode != 0:
        return 3
    staged = [p.decode("utf-8", "surrogateescape") for p in staged_refs.stdout.split(b"\0") if p]
    has_deletions = bool(deletions.stdout.strip())

    if not force and not staged and not has_deletions:
        return 0

    tracked = tracked_paths()
    if tracked is None:
        return 3

    if staged and not force:
        findings = fast_leg(staged, set(tracked))
        if findings is None:
            return 3
        if findings:
            sys.stderr.write("missing local resources:\n" + "\n".join(findings) + "\n")
            return 2

    if force or has_deletions:
        return full_leg(tracked)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # tooling trouble is never a block
        sys.stderr.write(f"missing-asset gate tooling error: {exc}\n")
        sys.exit(3)
