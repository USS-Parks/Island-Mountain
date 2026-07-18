#!/usr/bin/env python3
"""Block malformed tracked HTML navigation before commit or push."""

from __future__ import annotations

import re
import subprocess
import sys
from dataclasses import dataclass, field
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CAREERS_HREF = re.compile(r"^(?:\.\./)?careers\.html$")
FULL_DOCUMENT = re.compile(r"<!doctype html|<html\b", re.IGNORECASE)
UNQUOTED_HREF = re.compile(r"\bhref\s*=\s*(?![\"'])[^\s>]", re.IGNORECASE)
KNOWN_CORRUPTION = (
    re.compile(r"bout\.html>About</a></li>/a", re.IGNORECASE),
    re.compile(r"</li>/a\s*<li", re.IGNORECASE),
)


def git_paths(mode: str) -> list[str]:
    if mode == "staged":
        command = ["git", "diff", "--cached", "--name-only", "--diff-filter=ACM", "--", "*.html"]
    else:
        command = ["git", "ls-files", "--", "*.html"]
    output = subprocess.check_output(command, cwd=ROOT, text=True, encoding="utf-8")
    return [line for line in output.splitlines() if line]


def read_html(path: str, mode: str) -> str:
    if mode == "staged":
        data = subprocess.check_output(["git", "show", f":{path}"], cwd=ROOT)
    else:
        data = (ROOT / path).read_bytes()
    return data.decode("utf-8")


@dataclass
class LinkContainer:
    kind: str
    depth: int
    hrefs: list[str] = field(default_factory=list)
    direct_text: list[str] = field(default_factory=list)
    list_items_opened: int = 0
    list_items_closed: int = 0


class NavigationParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[str] = []
        self.active: list[LinkContainer] = []
        self.completed: list[LinkContainer] = []
        self.unquoted_href_tags: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        classes = set((attributes.get("class") or "").split())
        raw_tag = self.get_starttag_text() or ""
        if "href" in attributes and UNQUOTED_HREF.search(raw_tag):
            self.unquoted_href_tags.append(" ".join(raw_tag.split()))
        self.stack.append(tag)
        if tag == "ul" and "nav-links" in classes:
            self.active.append(LinkContainer("desktop navbar", len(self.stack)))
        elif tag == "div" and "mobile-sidebar" in classes:
            self.active.append(LinkContainer("mobile sidebar", len(self.stack)))
        elif tag == "a" and self.active:
            href = attributes.get("href")
            if href:
                self.active[-1].hrefs.append(href)
        if tag == "li" and self.active:
            self.active[-1].list_items_opened += 1

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_endtag(self, tag: str) -> None:
        if tag == "li" and self.active:
            self.active[-1].list_items_closed += 1
        if self.active and len(self.stack) == self.active[-1].depth and self.stack[-1:] == [tag]:
            self.completed.append(self.active.pop())
        if tag in self.stack:
            reverse_index = self.stack[::-1].index(tag)
            del self.stack[len(self.stack) - reverse_index - 1 :]

    def handle_data(self, data: str) -> None:
        if self.active and len(self.stack) == self.active[-1].depth and data.strip():
            self.active[-1].direct_text.append(" ".join(data.split()))


def check_document(path: str, text: str) -> list[str]:
    errors: list[str] = []
    if "\x00" in text:
        errors.append("contains NUL bytes")
    if FULL_DOCUMENT.search(text) and "</html>" not in text.lower():
        errors.append("full document is missing </html>")
    for pattern in KNOWN_CORRUPTION:
        if pattern.search(text):
            errors.append(f"contains known malformed-list signature: {pattern.pattern}")

    parser = NavigationParser()
    try:
        parser.feed(text)
        parser.close()
    except Exception as error:
        errors.append(f"navigation parse failed: {error}")
        return errors

    if parser.active:
        errors.append("contains an unclosed navigation container")
    if parser.unquoted_href_tags:
        errors.append(f"contains unquoted href attributes: {' | '.join(parser.unquoted_href_tags)}")

    desktop = [container for container in parser.completed if container.kind == "desktop navbar"]
    mobile = [container for container in parser.completed if container.kind == "mobile sidebar"]
    if desktop or mobile:
        if len(desktop) != 1:
            errors.append(f"expected one desktop navbar, found {len(desktop)}")
        if len(mobile) != 1:
            errors.append(f"expected one mobile sidebar, found {len(mobile)}")

    for container in desktop + mobile:
        careers_count = sum(bool(CAREERS_HREF.match(href)) for href in container.hrefs)
        if careers_count != 1:
            errors.append(f"{container.kind} must contain exactly one Careers link, found {careers_count}")
        duplicates = sorted({href for href in container.hrefs if container.hrefs.count(href) > 1})
        if duplicates:
            errors.append(f"{container.kind} repeats destinations: {', '.join(duplicates)}")
        if container.direct_text:
            errors.append(f"{container.kind} contains stray direct text: {' | '.join(container.direct_text)}")
        if container.list_items_opened != container.list_items_closed:
            errors.append(
                f"{container.kind} has unbalanced list items: "
                f"{container.list_items_opened} opened, {container.list_items_closed} closed"
            )

    return [f"{path}: {message}" for message in errors]


def self_test() -> int:
    clean = """<!doctype html><html><body>
<ul class="nav-links"><li><a href="careers.html">Careers</a></li></ul>
<div class="mobile-sidebar"><a href="careers.html">Careers</a></div>
</body></html>"""
    corrupt = clean.replace(
        "</li></ul>",
        "</li>\nbout.html>About</a></li>/a <li><a href=../careers.html>Careers</a></li></ul>",
    )
    missing = clean.replace('href="careers.html"', 'href="resources.html"')
    duplicate = clean.replace(
        "</li></ul>",
        "</li><li><a href=\"careers.html\">Careers</a></li></ul>",
    )
    unbalanced = clean.replace("</li></ul>", "</ul>")

    cases = {
        "clean": (clean, False),
        "known corruption": (corrupt, True),
        "missing Careers": (missing, True),
        "duplicate Careers": (duplicate, True),
        "unbalanced list item": (unbalanced, True),
    }
    failures: list[str] = []
    for name, (document, should_fail) in cases.items():
        errors = check_document(f"fixture:{name}", document)
        if bool(errors) != should_fail:
            failures.append(f"{name}: expected should_fail={should_fail}, errors={errors}")
    if failures:
        for failure in failures:
            print(f"SELF-TEST FAIL  {failure}", file=sys.stderr)
        return 1
    print(f"html-structure-gate: self-test clean ({len(cases)} cases)")
    return 0


def main() -> int:
    mode = sys.argv[1] if len(sys.argv) > 1 else "full"
    if mode == "self-test":
        return self_test()
    if mode not in {"staged", "full"}:
        print("usage: html-structure-gate.py [staged|full|self-test]", file=sys.stderr)
        return 2

    paths = git_paths(mode)
    failures: list[str] = []
    for path in paths:
        try:
            failures.extend(check_document(path, read_html(path, mode)))
        except (OSError, UnicodeDecodeError, subprocess.CalledProcessError) as error:
            failures.append(f"{path}: could not be checked: {error}")

    if failures:
        for failure in failures:
            print(f"BLOCK  {failure}", file=sys.stderr)
        print(f"html-structure-gate: {len(failures)} failure(s)", file=sys.stderr)
        return 1

    print(f"html-structure-gate: clean ({mode}, {len(paths)} HTML files)")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
