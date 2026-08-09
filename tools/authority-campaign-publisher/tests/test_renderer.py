import hashlib
import json
import re
from html.parser import HTMLParser
from pathlib import Path

import pytest

from island_mountain_publisher.manifest import compile_manifest
from island_mountain_publisher.renderer import _render_markdown_subset, render_article


class StructuralParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.tags: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.tags.append(tag)


@pytest.fixture(scope="session")
def manifest(repository_root: Path, campaign_root: Path, cards_root: Path):
    return compile_manifest(repository_root, campaign_root, cards_root)


@pytest.fixture(scope="session")
def template_path(repository_root: Path) -> Path:
    return (
        repository_root / "tools" / "authority-campaign-publisher" / "templates" / "blog-post.html"
    )


@pytest.mark.parametrize("campaign_id", ["p03", "p06", "p08", "p07"])
def test_f1_f3_f6_f8_golden_render_is_stable(
    manifest,
    template_path: Path,
    campaign_id: str,
) -> None:
    item = next(item for item in manifest.items if item.campaign.campaign_id == campaign_id)
    first = render_article(item, template_path)
    second = render_article(item, template_path)

    assert first.html == second.html
    assert hashlib.sha256(first.html).hexdigest() == GOLDEN_SHA256[campaign_id]


def test_render_has_complete_safe_metadata_and_source_fingerprint(
    manifest, template_path: Path
) -> None:
    item = manifest.items[2]
    rendered = render_article(item, template_path)
    text = rendered.html.decode("utf-8")
    parser = StructuralParser()
    parser.feed(text)
    json_ld = re.findall(
        r'<script type="application/ld\+json">\s*(.*?)\s*</script>', text, re.DOTALL
    )

    assert text.rstrip().endswith("</html>")
    assert "\x00" not in text
    assert f'data-campaign-id="{item.campaign.campaign_id}"' in text
    assert f'data-content-sha256="{item.content_sha256}"' in text
    assert f'<link rel="canonical" href="{item.blog_url}">' in text
    assert '<meta name="author" content="Basho Parks">' in text
    assert '<meta property="og:type" content="article">' in text
    assert '<meta name="twitter:card" content="summary_large_image">' in text
    assert {"html", "head", "body", "nav", "article", "footer", "ul", "li"} <= set(
        parser.tags
    )
    assert len(json_ld) == 2
    assert {json.loads(value)["@type"] for value in json_ld} == {
        "BlogPosting",
        "BreadcrumbList",
    }
    assert "../../../" not in text
    assert not re.search(r"\$[0-9][0-9,]*", text)


def test_hashtags_are_separate_and_copy_is_html_escaped(manifest, template_path: Path) -> None:
    item = manifest.items[2]
    rendered = render_article(item, template_path).html.decode("utf-8")
    article = re.search(r'<article class="article-body".*?>(.*?)</article>', rendered, re.DOTALL)

    assert article is not None
    assert "#DataCenterOperations" not in article.group(1)
    assert "#DataCenterOperations" in rendered
    escaped, hashtags = _render_markdown_subset(
        "A <script>alert(1)</script> & exact paragraph.\n\n#SafeTag #SecondTag"
    )
    assert escaped == "<p>A &lt;script&gt;alert(1)&lt;/script&gt; &amp; exact paragraph.</p>"
    assert hashtags == ("#SafeTag", "#SecondTag")


GOLDEN_SHA256 = {
    "p03": "1680affa0470ea2a5f8e287943c1dc0a4b144bd1316b9bcdd90d1d63d97325bd",
    "p06": "32851bf7b11d6012482b4315387e1b614c0c6ab097769828207fa0165ae7725f",
    "p07": "946d54ba1aeae1985a55737de60e03310689ab2217b5fb1a9e37d62d0d15d654",
    "p08": "ec01283dadbd9787d2a7f9f26759d51f1a65d6b5d966f4ae46ed444639da3012",
}
