#!/usr/bin/env python3
"""Build the minimal static artifact published by GitHub Pages."""

from __future__ import annotations

import argparse
import html
from html.parser import HTMLParser
from pathlib import Path, PurePosixPath
import posixpath
import re
import shutil
import sys
from urllib.parse import unquote, urlsplit


ROOT = Path(__file__).resolve().parents[1]
SITE_HOSTS = {"islandmountain.io", "www.islandmountain.io"}
TEXT_SUFFIXES = {".html", ".css", ".js"}
REQUIRED_ROOT_FILES = (
    ".nojekyll",
    "CNAME",
    "favicon.ico",
    "llms.txt",
    "robots.txt",
    "sitemap.xml",
)
SEED_PATTERNS = (
    "*.html",
    "blog/**/*.html",
    "css/**/*",
    "fonts/**/*",
    "icons/**/*",
    "js/**/*",
    "lamprey/**/*.html",
)
FORBIDDEN_TOP_LEVEL = {
    ".git",
    ".github",
    "AI Voice and Conversation Widget And CRM Project",
    "Agentic Orchestration and Woven Security Fabric",
    "PLANNING",
    "Screenshots",
    "assets-src",
    "scripts",
    "tools",
    "worker",
}
CSS_URL_RE = re.compile(r"url\(\s*(['\"]?)(.*?)\1\s*\)", re.IGNORECASE)
JS_ASSET_RE = re.compile(
    r"(['\"])((?:\.{0,2}/|/)?(?:downloads|fonts|icons|images|video)/[^'\"]+)\1",
    re.IGNORECASE,
)


class ResourceParser(HTMLParser):
    """Collect local navigation and resource URLs from an HTML document."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.urls: list[tuple[str, bool]] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = {name.lower(): value for name, value in attrs if value is not None}
        for name in ("href", "src", "poster"):
            value = values.get(name)
            if value:
                self.urls.append((value, name != "href"))

        srcset = values.get("srcset")
        if srcset:
            for candidate in srcset.split(","):
                url = candidate.strip().split()[0] if candidate.strip() else ""
                if url:
                    self.urls.append((url, True))

        content = values.get("content", "")
        if content.startswith(("/", "./", "../", "https://islandmountain.io", "https://www.islandmountain.io")):
            self.urls.append((content, True))

        style = values.get("style", "")
        for match in CSS_URL_RE.finditer(style):
            self.urls.append((match.group(2), True))


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", required=True, type=Path)
    return parser.parse_args()


def local_path(raw_url: str, referring_file: PurePosixPath) -> PurePosixPath | None:
    value = html.unescape(raw_url).strip()
    if not value or value.startswith(("#", "data:", "mailto:", "tel:", "javascript:", "blob:")):
        return None

    parsed = urlsplit(value)
    if parsed.scheme in {"http", "https"}:
        if parsed.hostname not in SITE_HOSTS:
            return None
        raw_path = parsed.path.lstrip("/")
    elif parsed.scheme or parsed.netloc:
        return None
    elif parsed.path.startswith("/"):
        raw_path = parsed.path.lstrip("/")
    else:
        raw_path = str(referring_file.parent / unquote(parsed.path))

    normalized = posixpath.normpath(raw_path)
    if normalized in {"", "."}:
        normalized = "index.html"
    if normalized == ".." or normalized.startswith("../"):
        raise ValueError(f"path escapes the site root: {raw_url!r} from {referring_file}")
    if parsed.path.endswith("/"):
        normalized = f"{normalized}/index.html"
    return PurePosixPath(normalized)


def discover_urls(source: Path, relative: PurePosixPath) -> list[tuple[str, bool]]:
    text = source.read_text(encoding="utf-8")
    if source.suffix.lower() == ".html":
        parser = ResourceParser()
        parser.feed(text)
        return parser.urls
    if source.suffix.lower() == ".css":
        return [(match.group(2), True) for match in CSS_URL_RE.finditer(text)]
    if source.suffix.lower() == ".js":
        return [(match.group(2), True) for match in JS_ASSET_RE.finditer(text)]
    return []


def main() -> int:
    args = parse_args()
    output = args.output.resolve()
    if output == ROOT or ROOT in output.parents:
        raise SystemExit("output must be outside the repository root")
    if output.exists():
        raise SystemExit(f"output already exists: {output}")
    output.mkdir(parents=True)

    pending: list[PurePosixPath] = []
    copied: set[PurePosixPath] = set()
    missing_resources: list[str] = []

    def copy(relative: PurePosixPath) -> None:
        if relative in copied:
            return
        source = ROOT.joinpath(*relative.parts)
        if not source.is_file():
            raise FileNotFoundError(relative)
        destination = output.joinpath(*relative.parts)
        destination.parent.mkdir(parents=True, exist_ok=True)
        shutil.copy2(source, destination)
        copied.add(relative)
        if source.suffix.lower() in TEXT_SUFFIXES:
            pending.append(relative)

    for name in REQUIRED_ROOT_FILES:
        copy(PurePosixPath(name))
    for pattern in SEED_PATTERNS:
        for source in sorted(ROOT.glob(pattern)):
            if source.is_file():
                copy(PurePosixPath(source.relative_to(ROOT).as_posix()))

    while pending:
        relative = pending.pop()
        source = ROOT.joinpath(*relative.parts)
        for raw_url, required in discover_urls(source, relative):
            target = local_path(raw_url, relative)
            if target is None or target in copied:
                continue
            target_source = ROOT.joinpath(*target.parts)
            if target_source.is_file():
                copy(target)
            elif required and target.suffix.lower() not in {".html", ".htm"}:
                missing_resources.append(f"{relative}: {raw_url}")

    forbidden = sorted(
        path.name for path in output.iterdir()
        if path.name in FORBIDDEN_TOP_LEVEL or path.name.endswith(".bak")
    )
    if forbidden:
        raise SystemExit(f"forbidden artifact paths: {', '.join(forbidden)}")
    if missing_resources:
        raise SystemExit("missing local resources:\n" + "\n".join(sorted(set(missing_resources))))

    html_files = sorted(output.rglob("*.html"))
    for page in html_files:
        text = page.read_text(encoding="utf-8")
        is_google_verification = page.name.lower().startswith("google")
        if not is_google_verification and "</html>" not in text.lower():
            raise SystemExit(f"HTML document is missing </html>: {page.relative_to(output)}")
        if "\0" in text:
            raise SystemExit(f"NUL byte in HTML document: {page.relative_to(output)}")

    byte_count = sum(path.stat().st_size for path in output.rglob("*") if path.is_file())
    print(
        f"Built curated Pages artifact: {len(copied)} files, "
        f"{len(html_files)} HTML documents, {byte_count / 1024 / 1024:.2f} MiB"
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
