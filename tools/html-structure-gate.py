#!/usr/bin/env python3
"""Block malformed navigation and unapproved form endpoints before publish."""

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
CANONICAL_FORMSUBMIT_ACTION = "https://formsubmit.co/basho@islandmountain.io"
CAREER_APPLICATION_PAGES = frozenset(
    {
        "career-deputy-forward-deployed-enterprise-engineer.html",
        "career-lead-hardware-production-systems-integration-engineer.html",
        "career-principal-agentic-security-governance-engineer.html",
        "career-principal-platform-release-engineer.html",
    }
)
VOID_ELEMENTS = frozenset(
    {
        "area", "base", "br", "col", "embed", "hr", "img", "input",
        "link", "meta", "param", "source", "track", "wbr",
    }
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


@dataclass
class FormContainer:
    depth: int
    action: str
    method: str
    enctype: str
    classes: set[str]
    inputs: list[dict[str, str | None]] = field(default_factory=list)


class NavigationParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[str] = []
        self.active: list[LinkContainer] = []
        self.completed: list[LinkContainer] = []
        self.unquoted_href_tags: list[str] = []
        self.active_forms: list[FormContainer] = []
        self.forms: list[FormContainer] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        attributes = dict(attrs)
        classes = set((attributes.get("class") or "").split())
        raw_tag = self.get_starttag_text() or ""
        if "href" in attributes and UNQUOTED_HREF.search(raw_tag):
            self.unquoted_href_tags.append(" ".join(raw_tag.split()))
        if tag not in VOID_ELEMENTS:
            self.stack.append(tag)
        if tag == "ul" and "nav-links" in classes:
            self.active.append(LinkContainer("desktop navbar", len(self.stack)))
        elif tag == "div" and "mobile-sidebar" in classes:
            self.active.append(LinkContainer("mobile sidebar", len(self.stack)))
        elif tag == "a" and self.active:
            href = attributes.get("href")
            if href:
                self.active[-1].hrefs.append(href)
        if tag == "form":
            self.active_forms.append(
                FormContainer(
                    depth=len(self.stack),
                    action=(attributes.get("action") or "").strip(),
                    method=(attributes.get("method") or "get").strip().lower(),
                    enctype=(attributes.get("enctype") or "").strip().lower(),
                    classes=classes,
                )
            )
        elif tag == "input" and self.active_forms:
            self.active_forms[-1].inputs.append(attributes)
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
        if self.active_forms and len(self.stack) == self.active_forms[-1].depth and self.stack[-1:] == [tag]:
            self.forms.append(self.active_forms.pop())
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
    if parser.active_forms:
        errors.append("contains an unclosed form")
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

    for form in parser.forms:
        if "formsubmit.co" not in form.action.lower():
            continue
        if form.action != CANONICAL_FORMSUBMIT_ACTION:
            errors.append(
                "uses an unapproved FormSubmit action: "
                f"{form.action or '(empty)'}; expected {CANONICAL_FORMSUBMIT_ACTION}"
            )
        if form.method != "post":
            errors.append(f"FormSubmit form must use POST, found {form.method or '(empty)'}")

    if path in CAREER_APPLICATION_PAGES:
        career_forms = [form for form in parser.forms if "career-application-form" in form.classes]
        if len(career_forms) != 1:
            errors.append(f"expected one career application form, found {len(career_forms)}")
        else:
            form = career_forms[0]
            if form.action != CANONICAL_FORMSUBMIT_ACTION:
                errors.append(f"career application form must use {CANONICAL_FORMSUBMIT_ACTION}")
            if form.method != "post":
                errors.append("career application form must use POST")
            if form.enctype != "multipart/form-data":
                errors.append("career application form must use multipart/form-data")

            named_inputs: dict[str, list[dict[str, str | None]]] = {}
            for attributes in form.inputs:
                name = attributes.get("name")
                if name:
                    named_inputs.setdefault(name, []).append(attributes)
            for name, expected_type in (("Email", "email"), ("attachment", "file")):
                matches = named_inputs.get(name, [])
                if len(matches) != 1:
                    errors.append(f"career application form must contain one {name} input, found {len(matches)}")
                    continue
                attributes = matches[0]
                if (attributes.get("type") or "text").lower() != expected_type:
                    errors.append(f"career application {name} input must use type={expected_type}")
                if "required" not in attributes:
                    errors.append(f"career application {name} input must be required")

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
    canonical_form = clean.replace(
        "</body>",
        f'<form action="{CANONICAL_FORMSUBMIT_ACTION}" method="POST"></form></body>',
    )
    unapproved_form = canonical_form.replace(
        CANONICAL_FORMSUBMIT_ACTION,
        "https://formsubmit.co/info@islandmountain.io",
    )
    wrong_method = canonical_form.replace('method="POST"', 'method="GET"')
    career_form = clean.replace(
        "</body>",
        (
            f'<form class="career-application-form" action="{CANONICAL_FORMSUBMIT_ACTION}" '
            'method="POST" enctype="multipart/form-data">'
            '<input name="Email" type="email" required>'
            '<input name="attachment" type="file" required>'
            '</form></body>'
        ),
    )
    career_missing_attachment = career_form.replace('<input name="attachment" type="file" required>', "")

    cases = {
        "clean": ("fixture:clean", clean, False),
        "known corruption": ("fixture:known-corruption", corrupt, True),
        "missing Careers": ("fixture:missing-careers", missing, True),
        "duplicate Careers": ("fixture:duplicate-careers", duplicate, True),
        "unbalanced list item": ("fixture:unbalanced-list-item", unbalanced, True),
        "canonical FormSubmit": ("fixture:canonical-formsubmit", canonical_form, False),
        "unapproved FormSubmit": ("fixture:unapproved-formsubmit", unapproved_form, True),
        "FormSubmit wrong method": ("fixture:formsubmit-wrong-method", wrong_method, True),
        "complete career form": (next(iter(CAREER_APPLICATION_PAGES)), career_form, False),
        "career form missing attachment": (
            next(iter(CAREER_APPLICATION_PAGES)),
            career_missing_attachment,
            True,
        ),
    }
    failures: list[str] = []
    for name, (path, document, should_fail) in cases.items():
        errors = check_document(path, document)
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
