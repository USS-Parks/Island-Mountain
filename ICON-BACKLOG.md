# Icon backlog — what to draw next

Built from the 264 icon slots actually placed on the site, not from a wish list.
Every count below is the number of real cards the icon would serve today.

## Where the library stands

| | |
|---|---|
| Icons in `images/` | **41** |
| Icons actually placed on a card | 36 |
| Card slots carrying an icon | 264 |
| Slots whose icon genuinely matches the card | ~149 |
| Slots on a stand-in | **~115** |

The gap shows up as overload. An icon serving many slots is fine when it is the
same idea repeated across pages — `local-ai-inference` covers 25 slots but only
7 distinct headings, because every vertical has the same three model cards.
An icon serving many *different* headings is a stand-in doing work it was never
drawn for:

| Icon | Slots | Distinct headings | Reading |
|---|---|---|---|
| `ai-cost-comparison` | 20 | **20** | catch-all for anything involving money |
| `ic-search` | 19 | **19** | catch-all for anything involving looking at something |
| `ic-add-file` | 17 | **17** | catch-all for anything involving a document |
| `ic-skills-teacher` | 14 | **14** | catch-all for anything involving people |
| `hipaa-ai` | 10 | 10 | doing healthcare, CUI, IRB and EHR at once |
| `itarr-cmmc-ai` | 10 | 10 | doing ITAR, classified, network and IP at once |
| `local-ai-inference` | 25 | 7 | healthy: the model cards, repeated |
| `faq-icon` | 5 | 1 | healthy: one idea, one icon |

Splitting the four catch-alls alone accounts for roughly 60 of the 115.

---

## Drawing spec

This matters more than the list. Two thirds of the current library reads
cleanly at card size and a third does not, and the difference is not resolution.

- **208 × 208**, white linework on transparent, lossless webp. This is the 2×
  asset for the 104px slots. Sizing is uniform across the library.
- **One idea per icon.** The files that fail are the ones carrying five or six
  captioned nodes. A card icon is read in about a third of a second at 104px.
- **No text, ever.** `gb-sec` has "1,792 GB/s" baked in and `gddr7` has "96GB
  GDDR7". No source resolution makes an 8px caption legible.
- **Stroke weight ≥ 12px at 208**, so nothing thins to grey when the browser
  paints it at 104. The existing art was drawn at ~1254 and lost its hairlines
  on the way down; that was recovered by dilation, but drawing it right is
  better than repairing it.
- **No colour, no fill, no glow in the file.** The site applies
  `brightness(0) invert(1) drop-shadow(...)` at render, so every icon is forced
  to the same white and the same glow whatever the source measures.
- **Sunburst motif** where it fits — it is the through-line that makes the set
  read as one family.
- Sanity check before shipping one: view it at 104px on `#0b1424`. If you have
  to lean in, it is too busy.

---

## Tier 1 — each fixes four or more cards

| Icon | Slots | Standing in today | What it should show |
|---|---|---|---|
| `document-drafting` | 14 | `ic-add-file` | A page being written. Covers clinical notes, policy, academic and technical writing, proposals. The single biggest gap. |
| `no-integration` | 11 | `ic-plugins` | A limit marker: a connector that does not join. Serves the whole "No X Integration" family across every vertical. |
| `cost-comparison` | 11 | `ai-cost-comparison` | Keep the existing icon here — this is its real job. Listed so it is not reassigned away. |
| `regulatory-filing` | 6 | `ic-add-file` | A form going to an authority. NERC CIP reporting, regulatory filings, CTR preparation. |
| `analytics` | 6 | `ic-plan`, `ic-search` | **A chart.** The library has nothing chart-shaped at all. Revenue forecasting, investment and underwriting analysis, qualitative data. |
| `no-it-staff` | 6 | `ic-skills-teacher` | Runs without a dedicated admin. The "does our firm need IT staff?" card on six verticals. |
| `document-review` | 6 | `ic-search` | Reading an existing document rather than writing one. Contract review, loan documents, CUI-adjacent analysis. |
| `no-fine-tuning` | 5 | `ic-search` | A limit marker: a general model, not a domain-trained one. Appears on five verticals verbatim. |
| `fraud-detection` | 4 | `ic-search` | An anomaly standing out from a pattern. Fraud, SAR drafting, claims. |
| `grant-funding` | 4 | `ai-cost-comparison` | Grant proposals and budget cycles, distinct from cost comparison. |

## Tier 2 — two or three cards each

| Icon | Slots | Standing in today | What it should show |
|---|---|---|---|
| `research-data` | 3 | `ic-plan`, `hipaa-ai` | Lab and research data, IRB governance. |
| `incident-response` | 3 | `ic-add-file` | After-action and outage response, emergency management. |
| `engineer-support` | 3 | `ic-skills-teacher` | One engineer who answers, as against a ticket queue. |
| `one-time-purchase` | 2 | `ai-cost-comparison` | Bought once, no meter. |
| `due-diligence` | 2 | `cloud-posture-scan` | KYC, AML, patron checks. |
| `security-controls` | 2 | `air-gapped`, `itarr-cmmc` | Controls you hold, not ones you rent. |
| `no-classified` | 2 | `itarr-cmmc` | A limit marker: not accredited for classified. |
| `grading` | 2 | `higher-learning-ai` | Assessment and marking. |
| `actuarial` | 2 | `ai-cost-comparison` | Rate and actuarial modelling. |
| `not-a-medical-device` | 2 | `hipaa-ai` | A limit marker: not cleared for clinical decisions. |

## Tier 3 — one card each, but nothing honest to borrow

`your-people` · `audit-review` · `surveillance` · `network-segregation` ·
`predictive-maintenance` · `grid-operations` · `inference-speed` ·
`room-to-grow` · `records-request` · `deposition` · `document-compare` ·
`billing-narrative` · `medical-coding` · `multilingual` · `ip-ownership` ·
`dataset-annotation` · `context-window` · `reproducibility` · `power-circuit` ·
`patient-education` · `player-loyalty` · `food-beverage` · `hotel-operations` ·
`citizen-service` · `data-residency`

Twenty-five singles. Low priority individually, but they are why the catch-alls
are overloaded, and several are on pages a buyer in that vertical reads first.

---

## Redraws — existing files that do not work as icons

These are drawn as infographics, not icons. Dilation made them usable, not good.
Same subject, redrawn as one idea with no embedded text.

| File | Problem |
|---|---|
| `enterprise-drivers` | 8-node wheel with captions. Scored **0.00** on stroke solidity before repair — not one pixel read as solid. |
| `remediation-workflow` | 5-step numbered flow with labels. Scored 0.01. |
| `blackwell-arch` | Architecture diagram with text blocks. Scored 0.01. |
| `enterprise-data-sec-teams` | 5 captioned role nodes. Scored 0.02. |
| `multi-cloud-scoped` | 4 nodes plus centre. Scored 0.04. |
| `managed-security-providers` | Dashboard. Scored 0.07. |
| `cloud-posture-scan` | Multi-panel. Scored 0.10. |
| `gddr7` | Baked-in text "96GB GDDR7". Scored 0.11. |
| `gb-sec` | Baked-in text "1,792 GB/s". |
| `cloud-side-or-air-gapped` | Two baked-in captions. |
| `built-for-ai` | Dense dashboard. |
| `agentic-orchestration` | Six satellite panels. |

The first three are the priority: `remediation-workflow`,
`enterprise-data-sec-teams` and `evidence-mapping` sit on the Woven page under
headings that name them, so they cannot be swapped for something generic — they
have to be redrawn or that page keeps its three hardest reads.

---

## Totals

| | |
|---|---|
| Tier 1 | 9 new (cost-comparison already exists) |
| Tier 2 | 10 new |
| Tier 3 | 25 new |
| Redraws | 12 |
| **Library after** | **41 → ~85** |

Drawing Tier 1 alone moves roughly 60 cards off a stand-in and onto art that
means what the card says.
