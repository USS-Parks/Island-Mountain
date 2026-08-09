import re
from html.parser import HTMLParser
from pathlib import Path


class TagCounter(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.tags: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.tags.append(tag)


def test_extracted_template_preserves_canonical_shell(repository_root: Path) -> None:
    template = (
        repository_root / "tools" / "authority-campaign-publisher" / "templates" / "blog-post.html"
    ).read_text(encoding="utf-8")
    parser = TagCounter()
    parser.feed(template)

    assert template.startswith("<!DOCTYPE html>")
    assert template.rstrip().endswith("</html>")
    assert template.count("</html>") == 1
    assert "googletagmanager.com/gtag/js?id=G-R674E394D4" in template
    assert '<nav class="navbar">' in template
    assert '<footer class="footer au-footer">' in template
    assert '../../../css/style.min.css?v=12' in template
    assert '../../../css/blog.css?v=3' in template
    assert '../../../js/chat-widget.min.js?v=4' in template
    assert '"@type": "BlogPosting"' in template
    assert '"@type": "BreadcrumbList"' in template
    assert "__ARTICLE_BODY_HTML__" in template
    assert "The Smaller System Is Often the Honest Answer" not in template
    assert {"html", "head", "body", "nav", "article", "footer"} <= set(parser.tags)


def test_template_has_only_declared_tokens(repository_root: Path) -> None:
    template = (
        repository_root / "tools" / "authority-campaign-publisher" / "templates" / "blog-post.html"
    ).read_text(encoding="utf-8")
    tokens = set(re.findall(r"\{\{([A-Z0-9_]+)\}\}", template))

    assert tokens == {
        "ARTICLE_CTA_HTML",
        "ARTICLE_SECTION_HTML",
        "ARTICLE_SECTION_JSON",
        "ARTICLE_TAGS_HTML",
        "BLOG_URL_HTML",
        "BLOG_URL_JSON",
        "CAMPAIGN_ID",
        "CONTENT_SHA256",
        "DESCRIPTION_HTML",
        "DESCRIPTION_JSON",
        "KEYWORDS_JSON",
        "PUBLISH_DATE_HUMAN",
        "PUBLISH_DATE_ISO",
        "READ_TIME_HTML",
        "RELATED_ARTICLES_HTML",
        "SHARE_LINKS_HTML",
        "TITLE_HTML",
        "TITLE_JSON",
        "WORD_COUNT",
    }
