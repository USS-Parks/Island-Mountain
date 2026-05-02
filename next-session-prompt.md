# Session 3 Prompt: Root Page AEO Blocks

## Thinking Block (paste this into your thinking before starting)

```
This session is about AEO (AI Engine Optimization) blocks on root-level HTML pages for islandmountain.io, a static HTML/CSS/JS site on GitHub Pages selling on-premises AI inference servers with NVIDIA H100/H200 GPUs.

HANDOFF.md has the full site inventory, HTML patterns, and known issues. Read it first.

Two categories of work:

CATEGORY 1 -- STANDARDIZE (6 pages, all over 400 lines, MUST use sed via bash):
These pages already have AEO blocks but in the old non-standard format. They need conversion to the standard format.

Old format (what's there now):
<div class="aeo-summary" style="background:var(--surface-alt,#1a1a2e);border-left:4px solid var(--copper,#f59e0b);padding:1.5rem;margin:2rem auto;max-width:800px;border-radius:4px;">
  <p style="margin:0;font-weight:600;font-size:1.05rem;"><strong>Bottom line:</strong> CONTENT</p>
</div>

Standard format (what it needs to become):
<!-- AEO Summary -->
<div style="border-left:3px solid var(--copper);padding:16px 20px;margin:32px 0;background:rgba(217,119,6,0.05);border-radius:0 8px 8px 0;">
<strong>Summary:</strong> CONTENT
</div>

Files to standardize:
- law-firms.html (541 lines) -- AEO block at line ~451
- medical-practices.html (508 lines) -- AEO block at line ~419
- tribal-nations.html (534 lines) -- AEO block at line ~445
- research-labs.html (502 lines) -- AEO block at line ~413
- defense-contractors.html (512 lines) -- AEO block at line ~423
- solutions.html (396 lines) -- AEO block at line ~328 (under 400 lines, Edit tool OK)

CRITICAL: All files except solutions.html are over 400 lines. NEVER use the Edit tool on files over 400 lines. Use sed via bash instead. After EVERY edit, run: tail -3 filename to confirm it ends with </html>.

CATEGORY 2 -- CREATE NEW (6 pages):
These pages need new AEO blocks written and inserted. Each block should directly answer the question an AI search engine would surface for that page's topic. 2-3 sentences max.

Pages needing new AEO blocks:
- index.html (403 lines) -- Homepage. Question: "What is Island Mountain?" or "on-premises AI servers"
- products.html (522 lines, use sed) -- Three product tiers. Question: "Island Mountain products" or "H100 H200 inference server specs"
- pricing.html (507 lines, use sed) -- Pricing table. Question: "How much does an on-premises AI server cost?"
- why-island-mountain.html (451 lines, use sed) -- Value prop. Question: "Why use local AI instead of cloud?"
- technology.html (451 lines, use sed) -- Software stack. Question: "What software runs on Island Mountain servers?"
- faq.html (855 lines, use sed) -- FAQ page. Question: "Island Mountain FAQ" or various specific questions

For placement on root pages: look at where the existing AEO blocks sit on the vertical pages (near bottom of main content, before footer). Match that pattern.

Pages that do NOT need AEO blocks: about, contact, investors, privacy, terms.

After all edits, run the verification script from HANDOFF.md to confirm no truncation. Update HANDOFF.md when complete.
```

## Prompt (paste this as the first message)

You are working on islandmountain.io, a static HTML/CSS/JS site on GitHub Pages selling on-premises AI inference servers. Read HANDOFF.md first. It has the full site inventory, HTML patterns, and known issues. Files over 400 lines can get truncated during sync -- use sed via bash for those, never the Edit tool. After every edit, run tail -3 filename and confirm it ends with the closing html tag. Blog post styles live in css/blog.css (shared across all 11 posts).

Task: Add and standardize AEO (AI Engine Optimization) summary blocks on root-level pages. Two jobs:

1. STANDARDIZE 6 pages that already have AEO blocks in the old "Bottom line:" format (dark background, aeo-summary class). Convert them to the standard format (copper border, amber tint, "Summary:" label). The 6 pages: law-firms.html, medical-practices.html, tribal-nations.html, research-labs.html, defense-contractors.html, solutions.html. All except solutions.html are over 400 lines -- use sed via bash.

2. CREATE NEW AEO blocks for 6 pages that don't have them yet: index.html, products.html, pricing.html, why-island-mountain.html, technology.html, faq.html. Read each page's content first, identify the core question it answers for AI search engines, write a 2-3 sentence direct answer, and insert the block. All except index.html are over 400 lines -- use sed via bash.

Skip: about, contact, investors, privacy, terms (utility pages, not AEO targets).

After all edits, run the HANDOFF.md verification script and update HANDOFF.md to reflect completion.
