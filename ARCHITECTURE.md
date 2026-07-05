# Architecture

## Tech Stack

- Static HTML/CSS/JS. Every page hand-written. No templating engine.
- ~59 content pages total (38 root + 21 blog). Newest root page: aeneas.html (cloud-security comparison, added 2026-06-28, in the primary nav)
- Self-hosted fonts: Inter variable (body, latin subset), Space Grotesk variable (H1 headings, latin subset, 22KB)
- Self-hosted icons: Remixicon (woff2)
- Google Analytics 4 (G-R674E394D4) on all 58 content pages (excludes 404.html)
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
| js/main.js | 263 | Nav, hamburger, sidebar, scroll animations, fade-in observers. All pages. |
| js/charts.js | 374 | Chart.js graphs for investors.html only. |
| js/chat-widget.js | 426 | AI chat/voice widget. Vanilla, self-injecting scoped styles, deferred idle boot. On all 59 content pages. Talks to the funnel Worker. Includes the optional Vapi voice button + live in-call Cal.com scheduling. |

## AI Conversational + Voice Funnel (backend)

A thin, self-owned serverless backend (NOT GoHighLevel/Salesforce) powers an AI
chat + voice lead funnel. Source lives in `/worker` (TypeScript, Cloudflare Worker);
it is the only part of the repo with a build/deploy step (`wrangler deploy`). The
static site stays on GitHub Pages and never holds a secret key.

**Status: LIVE.** Built 2026-06-27 (11 prompts) and merged to `main`; voice scheduling
went live 2026-06-27 with a verified end-to-end Cal.com booking round-trip. Deployed at
`https://island-mountain-funnel.basho-parks.workers.dev`. The chat/voice widget is the
primary lead-capture surface; the FormSubmit.co contact form remains the no-JS fallback.

- **Edge backend:** Cloudflare Worker — `POST /api/chat` (Claude proxy + KV session
  memory), `POST /api/voice-webhook` (Vapi), `POST /api/booking-webhook` (Cal.com),
  `GET /api/history`, `GET /api/stats` (token-gated), `GET /api/health`. Lead submission
  is internal to the chat and authenticated voice pipelines; no direct public route exists.
- **Brain:** Anthropic API (`claude-sonnet-4-6` routine / `claude-opus-4-8` escalation)
  with a `submit_lead` tool; deterministic hot/warm/cold scoring (`worker/src/qualifier.ts`).
- **State + store:** Workers KV (sessions + rate-limit counters), D1 (`leads` mirror),
  Google Sheet (human-facing lead list).
- **Voice (Vapi):** AI phone agent on `+1-341-441-8740` (assistant `08eba87f-…`, public
  key `89dd9bb1-…`). Three tools: `submit_lead`, plus **live in-call Cal.com scheduling**
  via `get_available_slots` + `book_appointment` (`worker/src/integrations/calcom.ts`,
  Cal.com API v2). End-of-call transcript + recording are extracted and persisted to D1.
- **Booking:** Cal.com scoping call (30 min, event-type `6140261`, `CALCOM_LINK`
  https://cal.com/basho-parks-3yuylm/30min). Hot chat leads get a prefilled booking link;
  voice callers can book in-call. `BOOKING_CREATED` webhook → mark lead booked + alert Basho.
- **Routing:** hot → Resend email to Basho + Cal.com booking offer; researching → docs
  email; all → GA4 Measurement Protocol (`generate_lead`/`qualify_started`/`schedule_call`)
  + UTM attribution.
- **Abuse protection:** per-IP/session/daily KV rate limits + circuit breaker, optional
  Turnstile, prompt-injection-hardened persona, CORS locked to islandmountain.io.
- **Docs:** `worker/README.md` (runbook), `DEPLOY.md` (one-time setup), `worker/vapi-setup.md`,
  `worker/vapi-island-mountain-prompt.md` (12-step call flow), `worker/sheets-apps-script.gs`.
  Build log in `DEVLOG.md` (gitignored).

## Brand Colors (CSS Custom Properties)

- --copper: #f59e0b (primary accent, amber/copper)
- --copper-light: #fbbf24, --copper-deep: #d97706, --copper-darker: #b45309
- --primary-dark: #0f172a (deep navy background)
- --secondary-dark: #1e293b, --tertiary-dark: #334155
- --text-light: #f1f5f9 (headings), --text-muted: #94a3b8 (body text)
- --nav-height: 80px, --max-width: 1200px

## Page Structure (every page)

**Head:** charset, viewport, title, meta description, favicon links, stylesheet links (style.css, remixicon.css, fonts.css, [blog: blog.css]), canonical, OG tags, Twitter Card tags, JSON-LD scripts, GA4 gtag.js snippet (first thing after <head>).

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
Desktop navbar: logo pushed left (margin-right:auto). The menu is now **12 items** (Home / Why Local AI / Aeneas / Summit / … / CTA). Spacing fix (2026-06-28, commit 706a408, at the bottom of `css/style.css`): `.navbar .container` max-width 1320px, `.nav-links` gap 18px, `.nav-links a` font 0.8rem + `white-space:nowrap` (prevents wrapping), `.nav-cta` padding 9px 18px. **Hamburger breakpoint is 1240px** — below that the full nav collapses to the mobile menu so the 12-item bar only shows when it fits. (Supersedes the old Session-35 gap-22px/font-0.85rem note.)

## Footer Logo

Root: `img src="images/logo-footer.png" width="210" height="210"`
Blog: `img src="../images/logo-footer.png" width="210" height="210"`

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
