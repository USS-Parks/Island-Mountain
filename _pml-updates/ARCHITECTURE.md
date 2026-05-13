# Architecture

## Tech Stack

- Static HTML/CSS/JS. Every page hand-written. No templating engine.
- 46 content pages total (31 root + 14 blog, plus 1 pending blog post)
- Self-hosted fonts: Inter variable (body, latin subset), Space Grotesk variable (H1 headings, latin subset, 22KB)
- Self-hosted icons: Remixicon (woff2)
- Google Analytics 4 (G-R674E394D4) on all 48 pages (includes 404.html). Deferred loading: gtag.js loads on first user interaction (scroll/click/touch/keydown) or 3s timeout (Session 51)
- Preconnect hint for googletagmanager.com on all 48 pages (Session 51)
- Chart.js for investor page only (js/charts.js + js/vendor/chart.umd.min.js)

## Stylesheets

| File | Lines | Scope |
|------|-------|-------|
| css/style.css | 1686 | Global. CSS custom properties, nav, layout, breadcrumbs, all page types. Includes risk-card--link modifier, hero-subheading-sm, info-panel, role-label classes. |
| css/blog.css | 464 | Blog posts (article layout, tags, related cards, share links) + .white-paper document styling (white bg, black text, Times New Roman, paragraph indents, page shadow) |
| fonts/fonts.css | - | @font-face for Inter + Space Grotesk |
| icons/remixicon.css | - | Icon font definitions |

## JavaScript

| File | Lines | Scope |
|------|-------|-------|
| js/main.js | 263 | Nav, hamburger, sidebar, scroll animations, fade-in observers, particle system. All pages. Initial geometric reads wrapped in rAF to avoid forced reflow (Session 51). |
| js/charts.js | 374 | Chart.js graphs for investors.html only. |

## Brand Colors (CSS Custom Properties)

- --copper: #f59e0b (primary accent, amber/copper)
- --copper-light: #fbbf24, --copper-deep: #d97706, --copper-darker: #b45309
- --primary-dark: #0f172a (deep navy background)
- --secondary-dark: #1e293b, --tertiary-dark: #334155
- --text-light: #f1f5f9 (headings), --text-muted: #94a3b8 (body text)
- --nav-height: 80px, --max-width: 1200px

## Page Structure (every page)

**Head:** charset, viewport, title, meta description, favicon links, stylesheet links (style.css, remixicon.css, fonts.css, [blog: blog.css]), canonical, OG tags, Twitter Card tags, JSON-LD scripts, GA4 deferred gtag.js loader + preconnect (first thing after <head>).

**Body:** [index only: particles canvas + hero photo], navbar, mobile sidebar, page content, footer, main.js script.

## Hero Images (WebP-only, Session 41)

All hero images use responsive `<img srcset>` with WebP only. PNG/JPG fallbacks removed. Each hero has desktop + mobile WebP variants.

```html
<img srcset="images/hero-NAME-mobile.webp 800w, images/hero-NAME.webp WIDTHw"
     sizes="100vw" src="images/hero-NAME.webp" alt="..." width="W" height="H" ...>
```

Blog pages use `../images/` prefix. OG/Twitter meta and JSON-LD image refs all point to .webp.

**Nav logo still uses `<picture>` for WebP/PNG fallback** (tiny files, not worth changing).

## Navbar Logo

Root pages:
```html
<a href="index.html" class="nav-logo"><picture><source srcset="images/logo-nav-new.webp" type="image/webp"><img src="images/logo-nav-new.png" alt="Island Mountain" width="196" height="129"></picture></a>
```
Blog pages: same with `../images/` prefix.
CSS: `.nav-logo` uses display:inline-flex; align-items:center; transform:translateY(-2px); navbar overflow:visible.
Desktop navbar: logo pushed left (margin-right:auto), nav-links gap 22px, font 0.85rem (Session 35).

## Footer Logo

Root: `img src="images/logo-footer.png" width="210" height="210"`
Blog: `img src="../images/logo-footer.png" width="210" height="210"`

## Heading Hierarchy (Session 51)

- Footer column headings use `<h3>` (Quick Links, Solutions, Company). CSS: `.footer h3`. Changed from h4 for WCAG sequential heading order.
- Stat-card headings on index.html use `<h2>`. CSS: `.stat-card h2`. Changed from h4 for WCAG sequential heading order.
- Content sections use standard h1 > h2 > h3 > h4 nesting. h4 used for card-level items (risk cards, process steps, FAQ items, related articles).

## Blog Post Section Order

1. Breadcrumb: Home > Blog > Post Title
2. Article header: date, tag badge, read time, h1, author
3. Article body: h2/h3 sections with cited paragraphs
4. AEO summary block (copper left border)
5. CTA: centered heading + subtext + Request a Quote button + phone number
6. Related articles: 3 cards in related-grid
7. Article nav: back link + LinkedIn/X share buttons

## AEO Summary Block

```html
<div style="border-left:3px solid var(--copper);padding:16px 20px;margin:32px 0;background:rgba(217,119,6,0.05);border-radius:0 8px 8px 0;">
  <strong>Summary:</strong> 2-3 sentence direct answer.
</div>
```

On index.html and pricing.html, AEO blocks are wrapped in section.section-dark > div.container > div.content-block.fade-in.content-max-800 (Session 43).

## Blog Citation Format

Inline parenthetical: (Source Name) with `<a target="_blank" rel="noopener">`.

## Blog Tag Classes

tag-technical, tag-compliance, tag-financial, tag-how-to, tag-industry

## File Path Conventions

- Root to root: `href="page.html"`
- Root to blog: `href="blog/post.html"`
- Blog to root: `href="../page.html"`
- Blog to images: `src="../images/file.ext"`
- Blog to CSS: `href="../css/blog.css"`

## Images (in images/ subdirectory)

- Hero images: WebP-only (desktop + mobile), responsive srcset. 17 hero pairs total.
- logo-nav-new.webp (12.8KB) / logo-nav-new.png (39.2KB): Navbar wordmark 392x259 retina
- logo-footer.png (37KB): 210x210 padded square transparent
- favicon-32.png, apple-touch-icon.png, icon-192.png, favicon.ico
- Various LinkedIn cover images and brand logo variants
