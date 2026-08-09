"""Safe, deterministic rendering for approved campaign articles."""

from __future__ import annotations

import html
import json
import math
import re
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import quote, urlparse

from .manifest import validate_manifest_item_hash
from .models import ManifestItem

TOKEN_RE = re.compile(r"\{\{[A-Z0-9_]+\}\}|__ARTICLE_BODY_HTML__")
WORD_RE = re.compile(r"[\w’'-]+", re.UNICODE)
HASHTAG_LINE_RE = re.compile(r"(?:#[A-Za-z][A-Za-z0-9]*)(?:\s+#[A-Za-z][A-Za-z0-9]*)+")


class RenderError(ValueError):
    """A source construct or template state cannot be rendered safely."""


@dataclass(frozen=True)
class RenderedArticle:
    path: str
    html: bytes
    word_count: int
    read_time_minutes: int


def _without_hashtags(body: str) -> tuple[str, tuple[str, ...]]:
    blocks = body.split("\n\n")
    if not blocks or not HASHTAG_LINE_RE.fullmatch(blocks[-1]):
        raise RenderError("article must end with one separate hashtag block")
    hashtags = tuple(blocks[-1].split())
    return "\n\n".join(blocks[:-1]), hashtags


def _render_markdown_subset(body: str) -> tuple[str, tuple[str, ...]]:
    """Render paragraphs and dash lists; reject every other Markdown construct."""

    prose, hashtags = _without_hashtags(body)
    blocks = prose.split("\n\n")
    rendered: list[str] = []
    for block in blocks:
        lines = block.splitlines()
        if not lines or any(not line for line in lines):
            raise RenderError("empty line inside a source block")
        is_list = [line.startswith("- ") for line in lines]
        if any(is_list) and not all(is_list):
            raise RenderError("mixed paragraph/list block is not supported")
        if all(is_list):
            items = "\n".join(f"  <li>{html.escape(line[2:])}</li>" for line in lines)
            rendered.append(f"<ul>\n{items}\n</ul>")
            continue
        if any(line.startswith(("#", ">", "```", "|")) for line in lines):
            raise RenderError("unsupported Markdown construct in article body")
        escaped = "\n".join(html.escape(line) for line in lines)
        rendered.append(f"<p>{escaped}</p>")
    return "\n\n".join(rendered), hashtags


def _json_string(value: str) -> str:
    return json.dumps(value, ensure_ascii=False)[1:-1]


def _description(body: str) -> str:
    prose, _hashtags = _without_hashtags(body)
    first = prose.split("\n\n", 1)[0]
    if first.startswith("- "):
        first = first.removeprefix("- ")
    return " ".join(first.splitlines())


def _relative_funnel(item: ManifestItem) -> str:
    parsed = urlparse(item.funnel_url)
    if parsed.scheme != "https" or parsed.netloc != "islandmountain.io":
        raise RenderError("funnel URL is not an Island Mountain HTTPS URL")
    value = f"..{parsed.path}"
    if parsed.query:
        value = f"{value}?{parsed.query}"
    return value


def _cta_html(item: ManifestItem) -> str:
    source_url = item.funnel_url
    if not item.campaign.first_comment.endswith(source_url):
        raise RenderError("source first comment does not end with its funnel URL")
    introduction = item.campaign.first_comment.removesuffix(source_url).strip()
    return "\n".join(
        (
            '      <div class="article-cta">',
            "        <h3>Continue the work</h3>",
            f"        <p>{html.escape(introduction)}</p>",
            (
                f'        <a href="{html.escape(_relative_funnel(item), quote=True)}" '
                'class="btn btn-primary">Open the referenced resource</a>'
            ),
            (
                '        <p class="bio-note-sm"><i class="ri-phone-line '
                'icon-copper-mr-sm"></i>Call <a href="tel:+13414418740" '
                'class="copper-semibold">(341) 441-8740</a> or reach us at '
                '<a href="mailto:basho@islandmountain.io" '
                'class="copper-semibold">info@islandmountain.io</a></p>'
            ),
            "      </div>",
        )
    )


def _related_html() -> str:
    cards = (
        (
            "../the-island-mountain-doctrine.html",
            "The Island Mountain Doctrine",
            "The operating principles behind locally owned, forward-deployed AI systems.",
        ),
        (
            "../forward-deployed-ai-engineering.html",
            "Forward-Deployed AI Engineering",
            "How discovery, deployment, training, and handoff become one owned system.",
        ),
        (
            "../air-gapped-ai-inference.html",
            "Air-Gapped AI Inference",
            "What full local custody requires beyond disconnecting a server from the internet.",
        ),
    )
    card_html = "\n".join(
        "\n".join(
            (
                '          <div class="related-card beam-card">',
                f'            <h4><a href="{href}">{title}</a></h4>',
                f"            <p>{description}</p>",
                "          </div>",
            )
        )
        for href, title, description in cards
    )
    return "\n".join(
        (
            '      <div class="related-articles">',
            "        <h3>Related Articles</h3>",
            '        <div class="related-grid">',
            card_html,
            "        </div>",
            "      </div>",
        )
    )


def _share_html(item: ManifestItem) -> str:
    encoded_url = quote(item.blog_url, safe="")
    encoded_title = quote(item.campaign.title, safe="")
    return "\n".join(
        (
            (
                f'          <a href="https://www.linkedin.com/sharing/share-offsite/?url='
                f'{encoded_url}" target="_blank" rel="noopener" '
                'aria-label="Share on LinkedIn"><i class="ri-linkedin-fill"></i></a>'
            ),
            (
                f'          <a href="https://x.com/intent/tweet?url={encoded_url}&amp;text='
                f'{encoded_title}" target="_blank" rel="noopener" '
                'aria-label="Share on X"><i class="ri-twitter-x-fill"></i></a>'
            ),
        )
    )


def render_article(item: ManifestItem, template_path: Path) -> RenderedArticle:
    validate_manifest_item_hash(item)
    template = template_path.read_text(encoding="utf-8")
    body_html, hashtags = _render_markdown_subset(item.campaign.long_form_article)
    prose, _ = _without_hashtags(item.campaign.long_form_article)
    word_count = len(WORD_RE.findall(prose))
    read_time = max(1, math.ceil(word_count / 200))
    description = _description(item.campaign.long_form_article)
    section = "Forward Deployed AI"
    human_date = (
        f"{item.campaign.publish_date.strftime('%B')} "
        f"{item.campaign.publish_date.day}, {item.campaign.publish_date.year}"
    )
    tags_html = "\n".join(
        (
            (
                '          <span class="article-tag tag-strategy">'
                f"{html.escape(item.campaign.delivery_form)}</span>"
            ),
            (
                '          <span class="article-tag tag-financial">'
                f"{html.escape(hashtags[0])}</span>"
            ),
        )
    )
    replacements = {
        "{{ARTICLE_CTA_HTML}}": _cta_html(item),
        "{{ARTICLE_SECTION_HTML}}": html.escape(section, quote=True),
        "{{ARTICLE_SECTION_JSON}}": _json_string(section),
        "{{ARTICLE_TAGS_HTML}}": tags_html,
        "{{BLOG_URL_HTML}}": html.escape(item.blog_url, quote=True),
        "{{BLOG_URL_JSON}}": _json_string(item.blog_url),
        "{{CAMPAIGN_ID}}": item.campaign.campaign_id,
        "{{CONTENT_SHA256}}": item.content_sha256,
        "{{DESCRIPTION_HTML}}": html.escape(description, quote=True),
        "{{DESCRIPTION_JSON}}": _json_string(description),
        "{{KEYWORDS_JSON}}": _json_string(", ".join(tag.removeprefix("#") for tag in hashtags)),
        "{{PUBLISH_DATE_HUMAN}}": human_date,
        "{{PUBLISH_DATE_ISO}}": item.campaign.publish_date.isoformat(),
        "{{READ_TIME_HTML}}": f"{read_time} min read",
        "{{RELATED_ARTICLES_HTML}}": _related_html(),
        "{{SHARE_LINKS_HTML}}": _share_html(item),
        "{{TITLE_HTML}}": html.escape(item.campaign.title, quote=True),
        "{{TITLE_JSON}}": _json_string(item.campaign.title),
        "{{WORD_COUNT}}": str(word_count),
        "__ARTICLE_BODY_HTML__": body_html,
    }
    rendered = template.replace("../../../", "../")
    for token, value in replacements.items():
        if token not in rendered:
            raise RenderError(f"template token is missing: {token}")
        rendered = rendered.replace(token, value)
    unresolved = TOKEN_RE.findall(rendered)
    if unresolved:
        raise RenderError(f"unresolved template tokens: {sorted(set(unresolved))}")
    if "\x00" in rendered or not rendered.rstrip().endswith("</html>"):
        raise RenderError("rendered HTML is truncated or contains a NUL")
    return RenderedArticle(
        path=item.blog_path,
        html=rendered.encode("utf-8"),
        word_count=word_count,
        read_time_minutes=read_time,
    )
