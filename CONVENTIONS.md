# Conventions

## Editorial Rules

- NO em-dashes anywhere. Use single hyphen with spaces: " - "
- All double-hyphens " -- " were replaced with " - " in Session 12. Never reintroduce them.
- The word "actually" is banned site-wide (removed Session 24, 27 occurrences).
- Blog citations: inline parenthetical links, not footnotes or endnotes.
- AEO summaries: lead with direct answer (under 30 words), then regulatory citation, then brand/pricing expansion.
- FAQ schema answers: first sentence is direct yes/no/declarative (under 30 words).
- Phone number display format: "1-341-441-8740" (with leading 1). Tel links: "tel:+13414418740" (E.164).
- Email display: "info@islandmountain.io" in visible text. Mailto: "basho@islandmountain.io" in href.
- Company name: "Island Mountain" (no LLC in display text). LLC only in terms.html and privacy.html.
- Industry count: "eleven regulated industries" (updated Session 23 for casino gaming).

## Naming Patterns

- Product tiers: Summit Base, Summit Ridge, Summit Pinnacle (renamed from Starter/Performance/Premium in Session 11)
- Future products: Landfall Series (prosumer), Citadel Series (multi-rack SCIF)
- Vertical page filenames: hyphenated-industry-name.html (e.g., casino-gaming.html, energy-utilities.html)
- Blog filenames: hyphenated-topic-slug.html in blog/ subdirectory
- SKU format: IM-SUMMIT-BASE, IM-SUMMIT-RIDGE, IM-SUMMIT-PINNACLE (vertical variants: summit-base-casino, etc.)

## HTML Patterns

- Every page has: GA4 snippet (first after <head>), meta author "Basho Parks", meta date "2026-05-01"
- Navbar: Solutions dropdown includes all 11 verticals. Resources link after Blog. Mobile sidebar mirrors nav.
- Footer: 4-column grid (Brand, Solutions, Resources, Company). Phone in footer-brand + footer-bottom.
- CTA sections include: "Or call directly: 1-341-441-8740" below button groups.
- All pages carry canonical tag pointing to .html version.
- Cross-links between related verticals (insurance<->medical, energy<->defense, etc.)
- Hero images: WebP-only `<img srcset>` (no <picture> fallbacks). Nav logo still uses <picture>.
- Solutions dropdown: click navigates to solutions.html on desktop, hover shows dropdown (Session 36).

## CSS Rules

- Use CSS custom properties (var(--name)) for all colors. No hardcoded hex in new CSS.
- Never inline CSS that duplicates blog.css or style.css
- White-paper styling lives in css/blog.css (.white-paper class)
- Authority Avatar badges use inline flex styles (not external CSS class)
- risk-card--link modifier class for linked resource cards (Session 45)
- hero-subheading-sm class for 80% hero subheading (Session 43)
- info-panel and role-label classes for about.html founder cards (Session 43)

## JSON-LD Schema Patterns

- @context always at top level (use @graph wrapper for multiple objects in one script tag)
- Every Product schema has: @id (URL#fragment), sku, name, description, brand, category, additionalProperty, offers
- BreadcrumbList on all pages except index.html
- FAQPage schema answers must match visible FAQ content exactly
- Verticals: single Product schema with AggregateOffer ($75K-$400K), not 3 discrete products
- Organization schemas use founder arrays: both John Dougherty and Basho Parks (Session 46)

## File Size Discipline

- NEVER use the Edit tool on ANY HTML file, regardless of line count. Use sed via bash for ALL HTML edits. (Expanded from 400-line threshold in Session 46 after about.html truncation at 340 lines.)
- After every write: run `tail -3 filename` to verify closing </html> tag.
- Before declaring complete: run site-wide verification script (includes NUL byte scan).
- Heredoc appends capped at 80 lines per block. Multiple sequential appends for larger content.
- .fuse_hidden* files from bash sandbox FUSE mount must be excluded via .gitignore and removed with `git rm --cached` if tracked (Rule 8).
- SESSION-LOG.md must be archived every 20 sessions into _work/sessions/ (Rule 9).

## Git Workflow

- All git operations run by user in PowerShell on host machine
- Bash sandbox cannot push to GitHub
- Commit message format: descriptive of changes made
- HANDOFF.md and SESSION-LOG.md updated before generating push command
- .gitignore excludes: HANDOFF.md, SESSION-LOG.md, _docs/, _work/, .claude/, .fuse_hidden*
