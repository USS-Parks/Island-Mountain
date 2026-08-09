import shutil
import subprocess
from pathlib import Path

import pytest

from island_mountain_publisher.discovery import DiscoveryError, plan_blog_publication
from island_mountain_publisher.manifest import compile_manifest
from island_mountain_publisher.renderer import render_article
from island_mountain_publisher.workspace import GitWorkspace, WorkspaceTransaction


@pytest.fixture
def discovery_repository(tmp_path: Path, repository_root: Path) -> Path:
    for name in ("blog.html", "sitemap.xml", "llms.txt"):
        shutil.copy2(repository_root / name, tmp_path / name)
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
    sitemap = (discovery_repository / "sitemap.xml").read_text(encoding="utf-8")
    llms = (discovery_repository / "llms.txt").read_text(encoding="utf-8")
    assert blog.count(f'href="{item.blog_path}"') == 2
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
    repository_root: Path,
    campaign_root: Path,
    cards_root: Path,
) -> None:
    item, rendered = _item_and_render(repository_root, campaign_root, cards_root, "p01")
    plan = plan_blog_publication(repository_root, item, rendered, adopt_existing=True)

    assert {file.path for file in plan} == {"sitemap.xml", "llms.txt"}
