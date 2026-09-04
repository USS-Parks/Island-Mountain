"""Structural, duplicate-safe updates for public blog discovery surfaces."""

from __future__ import annotations

import html
from pathlib import Path

from .models import ManifestItem
from .renderer import RenderedArticle, _description
from .workspace import PlannedFile


class DiscoveryError(ValueError):
    """A discovery surface is malformed, duplicated, or conflicts with a target."""


def _exact_text(path: Path) -> str:
    return path.read_bytes().decode("utf-8")


def _newline(text: str) -> str:
    return "\r\n" if "\r\n" in text else "\n"


def _replace_once(text: str, anchor: str, replacement: str, *, label: str) -> str:
    count = text.count(anchor)
    if count != 1:
        raise DiscoveryError(f"{label}: expected one structural anchor, found {count}")
    return text.replace(anchor, replacement, 1)


def _blog_card(item: ManifestItem, newline: str) -> str:
    title = html.escape(item.campaign.title)
    excerpt = html.escape(_description(item.campaign.long_form_article))
    date = (
        f"{item.campaign.publish_date.strftime('%B')} "
        f"{item.campaign.publish_date.day}, {item.campaign.publish_date.year}"
    )
    form = html.escape(item.campaign.delivery_form)
    hashtag = html.escape(item.campaign.article_hashtags[0])
    href = html.escape(item.blog_path, quote=True)
    lines = (
        f"        <!-- Authority campaign: {item.campaign.campaign_id} -->",
        '        <div class="blog-card beam-card">',
        '          <div class="blog-card-meta">',
        f'            <span class="blog-card-date">{date}</span>',
        f'            <span class="blog-card-tag tag-strategy">{form}</span>',
        f'            <span class="blog-card-tag tag-financial">{hashtag}</span>',
        "          </div>",
        f'          <h2><a href="{href}">{title}</a></h2>',
        f'          <p class="blog-card-excerpt">{excerpt}</p>',
        f'          <a href="{href}" class="blog-card-read">Read &rarr;</a>',
        "        </div>",
        "",
    )
    return newline.join(lines)


def _rail_card(item: ManifestItem, newline: str) -> str:
    title = html.escape(item.campaign.title)
    excerpt = html.escape(_description(item.campaign.long_form_article))
    date = (
        f"{item.campaign.publish_date.strftime('%B')} "
        f"{item.campaign.publish_date.day}, {item.campaign.publish_date.year}"
    )
    form = html.escape(item.campaign.delivery_form)
    hashtag = html.escape(item.campaign.article_hashtags[0])
    href = html.escape(item.blog_path, quote=True)
    lines = (
        f"        <!-- Authority campaign: {item.campaign.campaign_id} -->",
        '        <article class="blog-rail-card beam-card">',
        '          <div class="blog-rail-meta">',
        f'            <span class="blog-rail-date">{date}</span>',
        f'            <span class="blog-rail-tag tag-strategy">{form}</span>',
        f'            <span class="blog-rail-tag tag-financial">{hashtag}</span>',
        "          </div>",
        f'          <h3><a href="{href}">{title}</a></h3>',
        f'          <p class="blog-rail-excerpt">{excerpt}</p>',
        f'          <a href="{href}" class="blog-rail-read">Read &rarr;</a>',
        "        </article>",
        "",
    )
    return newline.join(lines)


def update_blog_index(source: str, item: ManifestItem) -> str:
    newline = _newline(source)
    anchor = f'      <div class="blog-grid fade-in">{newline}'
    if source.count(anchor) != 1:
        raise DiscoveryError("blog.html: malformed or missing blog-grid anchor")
    href = f'href="{item.blog_path}"'
    occurrences = source.count(href)
    if occurrences == 2:
        return source
    if occurrences != 0:
        raise DiscoveryError(
            f"blog.html: expected zero or two links for {item.slug}, found {occurrences}"
        )
    return source.replace(anchor, anchor + _blog_card(item, newline), 1)


def update_home_rail(source: str, item: ManifestItem) -> str:
    """Insert the newest post at the front of the homepage blog rail (newest-first)."""

    newline = _newline(source)
    anchor = (
        '      <div class="blog-rail" role="region" '
        'aria-label="Blog posts, newest first" tabindex="0">' + newline
    )
    if source.count(anchor) != 1:
        raise DiscoveryError("index.html: malformed or missing blog-rail anchor")
    href = f'href="{item.blog_path}"'
    occurrences = source.count(href)
    if occurrences == 2:
        return source
    if occurrences != 0:
        raise DiscoveryError(
            f"index.html: expected zero or two rail links for {item.slug}, found {occurrences}"
        )
    return source.replace(anchor, anchor + newline + _rail_card(item, newline), 1)


def update_sitemap(source: str, item: ManifestItem) -> str:
    occurrences = source.count(f"<loc>{item.blog_url}</loc>")
    if occurrences == 1:
        return source
    if occurrences != 0:
        raise DiscoveryError(f"sitemap.xml: duplicate URL for {item.slug}")
    newline = _newline(source)
    anchor = f"</urlset>{newline}" if source.endswith(newline) else "</urlset>"
    entry = newline.join(
        (
            "  <url>",
            f"    <loc>{item.blog_url}</loc>",
            f"    <lastmod>{item.campaign.publish_date.isoformat()}</lastmod>",
            "    <changefreq>monthly</changefreq>",
            "    <priority>0.7</priority>",
            "  </url>",
        )
    )
    replacement = f"{entry}{newline}</urlset>"
    if source.endswith(newline):
        replacement += newline
    return _replace_once(source, anchor, replacement, label="sitemap.xml")


def update_sitemap_txt(source: str, item: ManifestItem) -> str:
    newline = _newline(source)
    lines = source.splitlines()
    if lines.count(item.blog_url) == 1:
        return source
    if item.blog_url in lines:
        raise DiscoveryError(f"sitemap.txt: duplicate URL for {item.slug}")
    urls = sorted(line for line in (*lines, item.blog_url) if line)
    text = newline.join(urls)
    if source.endswith(newline) or source == "":
        text += newline
    return text


def update_llms(source: str, item: ManifestItem) -> str:
    occurrences = source.count(item.blog_url)
    if occurrences == 1:
        return source
    if occurrences != 0:
        raise DiscoveryError(f"llms.txt: duplicate URL for {item.slug}")
    newline = _newline(source)
    anchor = f"## Blog{newline}"
    title = item.campaign.title.replace("[", "\\[").replace("]", "\\]")
    entry = f"- [{title}]({item.blog_url}){newline}"
    return _replace_once(source, anchor, anchor + entry, label="llms.txt")


def _article_plan(
    repository_root: Path,
    item: ManifestItem,
    rendered: RenderedArticle,
    *,
    adopt_existing: bool,
) -> PlannedFile | None:
    target = repository_root / rendered.path
    if not target.exists():
        return PlannedFile(rendered.path, rendered.html)
    existing = target.read_bytes()
    if existing == rendered.html:
        return None
    if not adopt_existing or item.campaign.campaign_id != "p01":
        raise DiscoveryError(f"refusing to overwrite divergent article: {rendered.path}")
    text = existing.decode("utf-8")
    required = (
        f'<link rel="canonical" href="{item.blog_url}">',
        f">{item.campaign.title}</h1>",
        "</html>",
    )
    if not all(value in text for value in required):
        raise DiscoveryError("pre-existing p01 page does not match its adopted identity")
    return None


def plan_blog_publication(
    repository_root: Path,
    item: ManifestItem,
    rendered: RenderedArticle,
    *,
    adopt_existing: bool = False,
) -> tuple[PlannedFile, ...]:
    """Return only changed owned files; never mutate the repository."""

    paths = {
        "blog.html": update_blog_index(_exact_text(repository_root / "blog.html"), item),
        "index.html": update_home_rail(_exact_text(repository_root / "index.html"), item),
        "sitemap.xml": update_sitemap(_exact_text(repository_root / "sitemap.xml"), item),
        "sitemap.txt": update_sitemap_txt(_exact_text(repository_root / "sitemap.txt"), item),
        "llms.txt": update_llms(_exact_text(repository_root / "llms.txt"), item),
    }
    planned: list[PlannedFile] = []
    article = _article_plan(
        repository_root,
        item,
        rendered,
        adopt_existing=adopt_existing,
    )
    if article is not None:
        planned.append(article)
    for relative_path, updated in paths.items():
        current = (repository_root / relative_path).read_bytes()
        candidate = updated.encode("utf-8")
        if candidate != current:
            planned.append(PlannedFile(relative_path, candidate))
    return tuple(planned)
