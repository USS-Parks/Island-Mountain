import subprocess
from pathlib import Path

import pytest

from island_mountain_publisher.discovery import DiscoveryError, plan_blog_publication
from island_mountain_publisher.manifest import compile_manifest
from island_mountain_publisher.renderer import render_article
from island_mountain_publisher.workspace import GitWorkspace, WorkspaceTransaction

# Synthetic pre-campaign surfaces. The fixture used to copy the LIVE
# blog.html/sitemap.xml/llms.txt, so every real campaign publish mutated the
# fixtures and flipped tests (first flip: p01's real publish, 2026-08-10).
# These carry exactly the structure discovery.py requires and nothing else.
BLOG_GRID_ANCHOR = '      <div class="blog-grid fade-in">\n'
PRISTINE_BLOG = (
    "<!doctype html>\n<html>\n  <body>\n"
    + BLOG_GRID_ANCHOR
    + "      </div>\n  </body>\n</html>\n"
)
PRISTINE_SITEMAP = (
    '<?xml version="1.0" encoding="UTF-8"?>\n'
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    "</urlset>\n"
)
PRISTINE_LLMS = "# Island Mountain\n\n## Blog\n"
RAIL_ANCHOR = (
    '      <div class="blog-rail" role="region" '
    'aria-label="Blog posts, newest first" tabindex="0">\n'
)
PRISTINE_INDEX = (
    "<!doctype html>\n<html>\n  <body>\n" + RAIL_ANCHOR + "      </div>\n  </body>\n</html>\n"
)


@pytest.fixture
def discovery_repository(tmp_path: Path) -> Path:
    (tmp_path / "blog.html").write_text(PRISTINE_BLOG, encoding="utf-8")
    (tmp_path / "index.html").write_text(PRISTINE_INDEX, encoding="utf-8")
    (tmp_path / "sitemap.xml").write_text(PRISTINE_SITEMAP, encoding="utf-8")
    (tmp_path / "llms.txt").write_text(PRISTINE_LLMS, encoding="utf-8")
    subprocess.run(["git", "init", "-q"], cwd=tmp_path, check=True)
    subprocess.run(["git", "config", "user.email", "test@example.com"], cwd=tmp_path, check=True)
    subprocess.run(["git", "config", "user.name", "Test Owner"], cwd=tmp_path, check=True)
    subprocess.run(["git", "add", "."], cwd=tmp_path, check=True)
    subprocess.run(["git", "commit", "-q", "-m", "fixture"], cwd=tmp_path, check=True)
    return tmp_path


def _item_and_render(
    repository_root: Path,
    campaign_root: Path,
    cards_root: Path,
    campaign_id: str,
):
    manifest = compile_manifest(repository_root, campaign_root, cards_root)
    item = next(item for item in manifest.items if item.campaign.campaign_id == campaign_id)
    template = (
        repository_root / "tools" / "authority-campaign-publisher" / "templates" / "blog-post.html"
    )
    return item, render_article(item, template)


def test_repeated_discovery_update_is_a_complete_noop(
    discovery_repository: Path,
    repository_root: Path,
    campaign_root: Path,
    cards_root: Path,
) -> None:
    item, rendered = _item_and_render(repository_root, campaign_root, cards_root, "p02")
    plan = plan_blog_publication(discovery_repository, item, rendered)
    WorkspaceTransaction(GitWorkspace(discovery_repository), plan).apply()

    assert plan_blog_publication(discovery_repository, item, rendered) == ()
    blog = (discovery_repository / "blog.html").read_text(encoding="utf-8")
    index = (discovery_repository / "index.html").read_text(encoding="utf-8")
    sitemap = (discovery_repository / "sitemap.xml").read_text(encoding="utf-8")
    llms = (discovery_repository / "llms.txt").read_text(encoding="utf-8")
    assert blog.count(f'href="{item.blog_path}"') == 2
    assert index.count(f'href="{item.blog_path}"') == 2
    assert 'class="blog-rail-card' in index
    assert sitemap.count(item.blog_url) == 1
    assert llms.count(item.blog_url) == 1
    assert (discovery_repository / item.blog_path).read_bytes() == rendered.html


def test_malformed_blog_anchor_fails_before_any_write(
    discovery_repository: Path,
    repository_root: Path,
    campaign_root: Path,
    cards_root: Path,
) -> None:
    item, rendered = _item_and_render(repository_root, campaign_root, cards_root, "p02")
    path = discovery_repository / "blog.html"
    path.write_text(
        path.read_text(encoding="utf-8").replace('class="blog-grid fade-in"', 'class="grid"'),
        encoding="utf-8",
    )
    before = {
        source: source.read_bytes()
        for source in discovery_repository.rglob("*")
        if source.is_file()
    }

    with pytest.raises(DiscoveryError, match="blog-grid anchor"):
        plan_blog_publication(discovery_repository, item, rendered)
    assert {source: source.read_bytes() for source in before} == before


def test_malformed_rail_anchor_fails_before_any_write(
    discovery_repository: Path,
    repository_root: Path,
    campaign_root: Path,
    cards_root: Path,
) -> None:
    item, rendered = _item_and_render(repository_root, campaign_root, cards_root, "p02")
    index = discovery_repository / "index.html"
    index.write_text(
        index.read_text(encoding="utf-8").replace('class="blog-rail"', 'class="rail"'),
        encoding="utf-8",
    )
    before = index.read_bytes()

    with pytest.raises(DiscoveryError, match="blog-rail anchor"):
        plan_blog_publication(discovery_repository, item, rendered)
    assert index.read_bytes() == before


def test_partial_duplicate_slug_fails_before_write(
    discovery_repository: Path,
    repository_root: Path,
    campaign_root: Path,
    cards_root: Path,
) -> None:
    item, rendered = _item_and_render(repository_root, campaign_root, cards_root, "p02")
    path = discovery_repository / "blog.html"
    original = path.read_text(encoding="utf-8")
    path.write_text(
        original.replace("</body>", f'<a href="{item.blog_path}">bad</a></body>'),
        encoding="utf-8",
    )
    before = path.read_bytes()

    with pytest.raises(DiscoveryError, match="expected zero or two links"):
        plan_blog_publication(discovery_repository, item, rendered)
    assert path.read_bytes() == before


def test_existing_divergent_article_is_never_overwritten(
    discovery_repository: Path,
    repository_root: Path,
    campaign_root: Path,
    cards_root: Path,
) -> None:
    item, rendered = _item_and_render(repository_root, campaign_root, cards_root, "p02")
    target = discovery_repository / item.blog_path
    target.parent.mkdir(parents=True)
    target.write_text("owner page", encoding="utf-8")

    with pytest.raises(DiscoveryError, match="refusing to overwrite"):
        plan_blog_publication(discovery_repository, item, rendered)
    assert target.read_text(encoding="utf-8") == "owner page"


def test_post_one_adopts_existing_page_and_only_repairs_missing_surfaces(
    discovery_repository: Path,
    repository_root: Path,
    campaign_root: Path,
    cards_root: Path,
) -> None:
    item, rendered = _item_and_render(repository_root, campaign_root, cards_root, "p01")
    # Pre-campaign reality for p01: the page and its blog.html card were
    # hand-made before the campaign; only sitemap/llms lack the entry.
    blog = discovery_repository / "blog.html"
    card = (
        f'        <h2><a href="{item.blog_path}">{item.campaign.title}</a></h2>\n'
        f'        <a href="{item.blog_path}" class="blog-card-read">Read</a>\n'
    )
    blog.write_text(
        blog.read_text(encoding="utf-8").replace(BLOG_GRID_ANCHOR, BLOG_GRID_ANCHOR + card),
        encoding="utf-8",
    )
    index = discovery_repository / "index.html"
    rail_card = (
        f'        <h3><a href="{item.blog_path}">{item.campaign.title}</a></h3>\n'
        f'        <a href="{item.blog_path}" class="blog-rail-read">Read</a>\n'
    )
    index.write_text(
        index.read_text(encoding="utf-8").replace(RAIL_ANCHOR, RAIL_ANCHOR + rail_card),
        encoding="utf-8",
    )
    target = discovery_repository / item.blog_path
    target.parent.mkdir(parents=True)
    target.write_text(
        "<html>\n<head>\n"
        f'<link rel="canonical" href="{item.blog_url}">\n'
        "</head>\n<body>\n"
        f"<h1>{item.campaign.title}</h1>\n"
        "hand-made page body that diverges from the rendered article\n"
        "</body>\n</html>\n",
        encoding="utf-8",
    )

    plan = plan_blog_publication(discovery_repository, item, rendered, adopt_existing=True)

    assert {file.path for file in plan} == {"sitemap.xml", "llms.txt"}
