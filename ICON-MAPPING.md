# Vertical icon replacement, mapping proposal

Generated from the live markup. **No pages edited yet.** Approve or amend the
mapping and the swap is mechanical.

## Scope

| | |
|---|---|
| Pages | 12 verticals + solutions |
| Slots to convert | 226 (`card-icon` 130, `risk-card` 96) |
| Distinct source glyphs | 71 |
| Covered by an existing icon | 221 slots |
| Needing a new icon | 5 slots |

Untouched, staying Remix: phone, LinkedIn/X, comparison notes, power notices,
authority badges. Those are chrome, not content.

## Canonical treatment applied to every converted slot

Per style guide section 04 and How-To A1/B6:

```html
<div class="card-icon-im"><img src="images/NAME-icon.webp" alt="" loading="lazy" decoding="async"></div>
```

- `.card-icon-im` is 104px, centred, `object-fit:contain`, with the house filter
  `brightness(0) invert(1) drop-shadow(0 0 5px rgba(200,220,255,.55))`.
- `alt=""` because the heading already names the card.
- The current 48px rounded `.card-icon` badge box goes away. The canon is
  explicit: **centred over the text, never in a badge.**
- `risk-card` icons move out of the `<h4>` and sit above a centred heading,
  which is how Forward Deployed already renders its three risk cards.

## Icons to create — 5, ordered by how many slots each unblocks

| # | Proposed name | Slots | What it has to say |
|---|---|---|---|
| 1 | `patient-education-icon.webp` | 1 | Materials handed to a patient. |
| 2 | `surveillance-icon.webp` | 1 | Floor surveillance documentation. |
| 3 | `player-loyalty-icon.webp` | 1 | Player loyalty and patron analytics. |
| 4 | `food-beverage-icon.webp` | 1 | Food and beverage operations. |
| 5 | `hotel-operations-icon.webp` | 1 | Hotel and lodging operations. |

Build each with How-To A1: white linework on transparent, 1254x1254,
luminance-keyed alpha, lossless webp into `images/`.

## Existing icons, and how hard each gets reused

| Icon | Slots | Note |
|---|---|---|
| `local-ai-inference-icon.webp` | 24 | reserved for the NVIDIA/Supermicro pitch deck |
| `air-gapped-icon.webp` | 22 |  |
| `ai-cost-comparison-icon.webp` | 18 |  |
| `ic-add-file.webp` | 15 |  |
| `ic-default-access.webp` | 15 |  |
| `ic-search.webp` | 13 |  |
| `server-rack-icon.webp` | 11 | reserved for the NVIDIA/Supermicro pitch deck |
| `ic-skills-teacher.webp` | 11 |  |
| `hipaa-ai-icon.webp` | 9 |  |
| `itarr-cmmc-ai-icon.webp` | 9 |  |
| `resources-icon.webp` | 7 |  |
| `contact-icon.webp` | 7 |  |
| `agentic-orchestration-icon.webp` | 7 |  |
| `evidence-mapping-icon.webp` | 7 |  |
| `ic-plugins.webp` | 6 |  |
| `local-govt-ai-icon.webp` | 6 |  |
| `remediation-workflow-icon.webp` | 5 |  |
| `enterprise-drivers-icon.webp` | 5 |  |
| `higher-learning-ai-icon.webp` | 4 |  |
| `cloud-posture-scan-icon.webp` | 3 |  |
| `ic-plan.webp` | 3 |  |
| `CLOUD-tribal-icon.webp` | 2 |  |
| `compliance-evidence-icon.webp` | 2 |  |
| `ic-code-window.webp` | 2 |  |
| `attorney-client-priv-icon.webp` | 1 |  |
| `enterprise-data-sec-teams-icon.webp` | 1 |  |
| `gateway-hub-arch-icon.webp` | 1 |  |
| `WSF-icon.webp` | 1 |  |
| `on-prem-ai-icon.webp` | 1 |  |
| `ic-coding.webp` | 1 |  |
| `tribal-nation-icon.webp` | 1 |  |
| `casino-ai-icon.webp` | 1 |  |

## Slot-by-slot

### law-firms.html — 20 slots

| Slot | Card | Now | Proposed |
|---|---|---|---|
| card-icon | Zero External Transmission | `ri-shield-check-line` | `air-gapped-icon` |
| card-icon | A System You Own | `ri-server-line` | `server-rack-icon` |
| card-icon | Air-Gap Capable | `ri-wifi-off-line` | `air-gapped-icon` |
| card-icon | Contract Review &amp; Analysis | `ri-file-search-line` | `ic-search` |
| card-icon | Legal Research Synthesis | `ri-book-open-line` | `resources-icon` |
| card-icon | Document Drafting | `ri-draft-line` | `ic-add-file` |
| card-icon | Deposition Preparation | `ri-user-voice-line` | `contact-icon` |
| card-icon | Document Comparison | `ri-file-copy-2-line` | `ic-add-file` |
| card-icon | Billing Narrative Drafting | `ri-time-line` | `ai-cost-comparison-icon` |
| card-icon | DeepSeek V4-Flash | `ri-brain-line` | `local-ai-inference-icon` |
| card-icon | Llama 4 Scout | `ri-robot-2-line` | `local-ai-inference-icon` |
| card-icon | R1 70B Distill or Qwen 3 72B | `ri-scales-3-line` | `local-ai-inference-icon` |
| risk-card | No Legal-Specific Fine-Tuning | `ri-search-eye-line` | `ic-search` |
| risk-card | No Case Management Integration | `ri-links-line` | `ic-plugins` |
| risk-card | No Legal Database Access | `ri-book-2-line` | `resources-icon` |
| risk-card | You Own the Maintenance | `ri-settings-3-line` | `ic-default-access` |
| risk-card | Does cloud AI violate attorney-client privilege? | `ri-scales-3-line` | `attorney-client-priv-icon` |
| risk-card | What legal AI workflows does this hardware support? | `ri-brain-line` | `agentic-orchestration-icon` |
| risk-card | How does the cost compare to cloud AI for a 10-attorney firm? | `ri-coin-line` | `ai-cost-comparison-icon` |
| risk-card | Does our firm need dedicated IT staff? | `ri-tools-line` | `ic-skills-teacher` |

### medical-practices.html — 17 slots

| Slot | Card | Now | Proposed |
|---|---|---|---|
| card-icon | No PHI Transmission | `ri-shield-check-line` | `air-gapped-icon` |
| card-icon | No BAA Required | `ri-file-shield-2-line` | `hipaa-ai-icon` |
| card-icon | Your Security Controls | `ri-lock-line` | `itarr-cmmc-ai-icon` |
| card-icon | Clinical Note Drafting | `ri-file-text-line` | `ic-add-file` |
| card-icon | Prior Authorization Letters | `ri-mail-send-line` | `contact-icon` |
| card-icon | Patient Education Materials | `ri-hearts-line` | **NEW** `patient-education-icon` |
| card-icon | Coding Documentation Review | `ri-barcode-box-line` | `ai-cost-comparison-icon` |
| card-icon | Administrative Correspondence | `ri-customer-service-2-line` | `contact-icon` |
| card-icon | Multilingual Support | `ri-translate-2` | `ic-skills-teacher` |
| risk-card | Not an EHR Integration | `ri-hospital-line` | `hipaa-ai-icon` |
| risk-card | Not a Medical Device | `ri-stethoscope-line` | `hipaa-ai-icon` |
| risk-card | No Clinical Analytics | `ri-bar-chart-line` | `evidence-mapping-icon` |
| risk-card | You Own the Maintenance | `ri-settings-3-line` | `ic-default-access` |
| risk-card | Do I need a BAA to use local AI with patient data? | `ri-file-shield-2-line` | `hipaa-ai-icon` |
| risk-card | Is this a medical device or clinical decision support tool? | `ri-error-warning-line` | `hipaa-ai-icon` |
| risk-card | Can non-technical staff use it without IT training? | `ri-group-line` | `ic-skills-teacher` |
| risk-card | How does cost compare for a 15-provider practice? | `ri-coin-line` | `ai-cost-comparison-icon` |

### casino-gaming.html — 26 slots

| Slot | Card | Now | Proposed |
|---|---|---|---|
| card-icon | Zero External Transmission | `ri-shield-check-line` | `air-gapped-icon` |
| card-icon | A System You Own | `ri-server-line` | `server-rack-icon` |
| card-icon | Air-Gap Capable | `ri-wifi-off-line` | `air-gapped-icon` |
| card-icon | SAR Drafting and Review | `ri-file-search-line` | `ic-search` |
| card-icon | CTR Preparation | `ri-money-dollar-circle-line` | `ai-cost-comparison-icon` |
| card-icon | Internal Audit Support | `ri-file-text-line` | `ic-add-file` |
| card-icon | Surveillance Documentation | `ri-eye-line` | **NEW** `surveillance-icon` |
| card-icon | Patron Due Diligence | `ri-user-search-line` | `cloud-posture-scan-icon` |
| card-icon | Regulatory Response Drafting | `ri-alarm-warning-line` | `remediation-workflow-icon` |
| card-icon | Revenue Forecasting | `ri-line-chart-line` | `evidence-mapping-icon` |
| card-icon | Player Loyalty Analytics | `ri-vip-crown-line` | **NEW** `player-loyalty-icon` |
| card-icon | Marketing Campaign Drafting | `ri-megaphone-line` | `contact-icon` |
| card-icon | Workforce Documentation | `ri-team-line` | `enterprise-data-sec-teams-icon` |
| card-icon | Food &amp; Beverage Analysis | `ri-restaurant-line` | **NEW** `food-beverage-icon` |
| card-icon | Hotel Operations Support | `ri-hotel-bed-line` | **NEW** `hotel-operations-icon` |
| card-icon | DeepSeek V4-Flash | `ri-brain-line` | `local-ai-inference-icon` |
| card-icon | Llama 4 Scout | `ri-robot-2-line` | `local-ai-inference-icon` |
| card-icon | R1 70B Distill or Qwen 3 72B | `ri-scales-3-line` | `local-ai-inference-icon` |
| risk-card | No Video Analytics or Surveillance AI | `ri-search-eye-line` | `ic-search` |
| risk-card | No Casino Management System Integration | `ri-links-line` | `ic-plugins` |
| risk-card | No Automated FinCEN Filing | `ri-book-2-line` | `resources-icon` |
| risk-card | You Own the Maintenance | `ri-settings-3-line` | `ic-default-access` |
| risk-card | Does cloud AI create Title 31 compliance risk for casinos? | `ri-scales-3-line` | `local-ai-inference-icon` |
| risk-card | What casino workflows does this hardware support? | `ri-brain-line` | `agentic-orchestration-icon` |
| risk-card | How does the cost compare for a 50-person operation? | `ri-coin-line` | `ai-cost-comparison-icon` |
| risk-card | Does our operation need dedicated IT staff? | `ri-tools-line` | `ic-skills-teacher` |

### tribal-nations.html — 15 slots

| Slot | Card | Now | Proposed |
|---|---|---|---|
| card-icon | Data Stays in Your Facility | `ri-shield-star-line` | `CLOUD-tribal-icon` |
| card-icon | Your Jurisdiction, Your Rules | `ri-government-line` | `local-govt-ai-icon` |
| card-icon | Air-Gap Capable | `ri-wifi-off-line` | `air-gapped-icon` |
| risk-card | Power: 208V/30A Dedicated Circuit | `ri-flashlight-line` | `enterprise-drivers-icon` |
| risk-card | Space: 4U Rack or Secured Shelf | `ri-server-line` | `server-rack-icon` |
| risk-card | Network: Standard Ethernet | `ri-wifi-line` | `gateway-hub-arch-icon` |
| risk-card | Setup: 30 Days of Remote Support | `ri-customer-service-line` | `ic-skills-teacher` |
| risk-card | Not a Tribal-Specific Platform | `ri-apps-line` | `ic-plugins` |
| risk-card | No IHS Integration | `ri-hospital-line` | `hipaa-ai-icon` |
| risk-card | No Compliance Certification | `ri-award-line` | `compliance-evidence-icon` |
| risk-card | You Own the Maintenance | `ri-settings-3-line` | `ic-default-access` |
| risk-card | How does local AI protect tribal data sovereignty? | `ri-shield-star-line` | `CLOUD-tribal-icon` |
| risk-card | What emergency management workflows does this support? | `ri-alarm-warning-line` | `remediation-workflow-icon` |
| risk-card | Can tribal facilities with limited IT infrastructure support t | `ri-building-line` | `server-rack-icon` |
| risk-card | How does pricing align with tribal budget cycles? | `ri-money-dollar-circle-line` | `ai-cost-comparison-icon` |

### government.html — 20 slots

| Slot | Card | Now | Proposed |
|---|---|---|---|
| card-icon | Zero External Transmission | `ri-shield-check-line` | `air-gapped-icon` |
| card-icon | A System You Own | `ri-server-line` | `server-rack-icon` |
| card-icon | Air-Gap Capable | `ri-wifi-off-line` | `air-gapped-icon` |
| card-icon | Document Review &amp; Analysis | `ri-file-search-line` | `ic-search` |
| card-icon | FOIA Request Processing | `ri-folder-open-line` | `evidence-mapping-icon` |
| card-icon | Policy Analysis &amp; Drafting | `ri-draft-line` | `ic-add-file` |
| card-icon | Citizen Service Documentation | `ri-user-heart-line` | `local-govt-ai-icon` |
| card-icon | Grant &amp; Budget Analysis | `ri-money-dollar-circle-line` | `ai-cost-comparison-icon` |
| card-icon | After-Action Report Generation | `ri-file-text-line` | `ic-add-file` |
| card-icon | DeepSeek V4-Flash | `ri-brain-line` | `local-ai-inference-icon` |
| card-icon | Llama 4 Scout | `ri-robot-2-line` | `local-ai-inference-icon` |
| card-icon | R1 70B Distill or Qwen 3 72B | `ri-scales-3-line` | `local-ai-inference-icon` |
| risk-card | No Government-Specific Fine-Tuning | `ri-search-eye-line` | `ic-search` |
| risk-card | No GovCloud or FedRAMP Authorization | `ri-government-line` | `local-govt-ai-icon` |
| risk-card | No Classified Data Certification | `ri-lock-line` | `itarr-cmmc-ai-icon` |
| risk-card | You Own the Maintenance | `ri-settings-3-line` | `ic-default-access` |
| risk-card | Does on-premises AI need FedRAMP? | `ri-government-line` | `local-govt-ai-icon` |
| risk-card | What government workflows does this hardware support? | `ri-brain-line` | `agentic-orchestration-icon` |
| risk-card | How does cost compare for a 20-person office? | `ri-coin-line` | `ai-cost-comparison-icon` |
| risk-card | Can this handle CUI? | `ri-lock-line` | `itarr-cmmc-ai-icon` |

### education.html — 20 slots

| Slot | Card | Now | Proposed |
|---|---|---|---|
| card-icon | Zero External Transmission | `ri-shield-check-line` | `air-gapped-icon` |
| card-icon | A System You Own | `ri-server-line` | `server-rack-icon` |
| card-icon | Air-Gap Capable | `ri-wifi-off-line` | `air-gapped-icon` |
| card-icon | Curriculum Design Assistance | `ri-book-open-line` | `resources-icon` |
| card-icon | Student Record Summarization | `ri-user-search-line` | `cloud-posture-scan-icon` |
| card-icon | Research Data Analysis | `ri-flask-line` | `ic-plan` |
| card-icon | Administrative Document Drafting | `ri-draft-line` | `ic-add-file` |
| card-icon | Grant Proposal Support | `ri-money-dollar-circle-line` | `ai-cost-comparison-icon` |
| card-icon | Assessment &amp; Grading Assistance | `ri-checkbox-circle-line` | `higher-learning-ai-icon` |
| card-icon | DeepSeek V4-Flash | `ri-brain-line` | `local-ai-inference-icon` |
| card-icon | Llama 4 Scout | `ri-robot-2-line` | `local-ai-inference-icon` |
| card-icon | R1 70B Distill or Qwen 3 72B | `ri-scales-3-line` | `local-ai-inference-icon` |
| risk-card | No Education-Specific Fine-Tuning | `ri-search-eye-line` | `ic-search` |
| risk-card | No LMS/SIS Integration | `ri-links-line` | `ic-plugins` |
| risk-card | No Automated Grading or Assessment Scoring | `ri-checkbox-circle-line` | `higher-learning-ai-icon` |
| risk-card | You Own the Maintenance | `ri-settings-3-line` | `ic-default-access` |
| risk-card | Does cloud AI create FERPA compliance risk? | `ri-graduation-cap-line` | `higher-learning-ai-icon` |
| risk-card | What educational workflows does this hardware support? | `ri-brain-line` | `agentic-orchestration-icon` |
| risk-card | How does cost compare for campus-wide deployment? | `ri-coin-line` | `ai-cost-comparison-icon` |
| risk-card | Does our institution need additional IT staff? | `ri-tools-line` | `ic-skills-teacher` |

### energy-utilities.html — 20 slots

| Slot | Card | Now | Proposed |
|---|---|---|---|
| card-icon | Zero External Transmission | `ri-shield-check-line` | `air-gapped-icon` |
| card-icon | A System You Own | `ri-server-line` | `server-rack-icon` |
| card-icon | Air-Gap Capable | `ri-wifi-off-line` | `air-gapped-icon` |
| card-icon | Predictive Maintenance Analysis | `ri-tools-line` | `ic-skills-teacher` |
| card-icon | Grid Operations Documentation | `ri-flashlight-line` | `enterprise-drivers-icon` |
| card-icon | NERC CIP Compliance Reporting | `ri-file-text-line` | `ic-add-file` |
| card-icon | Pipeline Monitoring Analysis | `ri-route-line` | `enterprise-drivers-icon` |
| card-icon | Outage Response Documentation | `ri-alarm-warning-line` | `remediation-workflow-icon` |
| card-icon | Regulatory Filing Drafting | `ri-draft-line` | `ic-add-file` |
| card-icon | DeepSeek V4-Flash | `ri-brain-line` | `local-ai-inference-icon` |
| card-icon | Llama 4 Scout | `ri-robot-2-line` | `local-ai-inference-icon` |
| card-icon | R1 70B Distill or Qwen 3 72B | `ri-scales-3-line` | `local-ai-inference-icon` |
| risk-card | No SCADA/OT Integration | `ri-cpu-line` | `enterprise-drivers-icon` |
| risk-card | No Real-Time Grid Management | `ri-flashlight-line` | `enterprise-drivers-icon` |
| risk-card | No Utility-Specific Modeling Engine | `ri-bar-chart-grouped-line` | `evidence-mapping-icon` |
| risk-card | You Own the Maintenance | `ri-settings-3-line` | `ic-default-access` |
| risk-card | Does cloud AI complicate NERC CIP compliance? | `ri-shield-check-line` | `air-gapped-icon` |
| risk-card | What energy workflows does this hardware support? | `ri-brain-line` | `agentic-orchestration-icon` |
| risk-card | How does the cost compare for a 25-person operations team? | `ri-coin-line` | `ai-cost-comparison-icon` |
| risk-card | Can this run fully air-gapped? | `ri-tools-line` | `ic-skills-teacher` |

### financial-services.html — 20 slots

| Slot | Card | Now | Proposed |
|---|---|---|---|
| card-icon | Zero External Transmission | `ri-shield-check-line` | `air-gapped-icon` |
| card-icon | A System You Own | `ri-server-line` | `server-rack-icon` |
| card-icon | Air-Gap Capable | `ri-wifi-off-line` | `air-gapped-icon` |
| card-icon | Loan Document Review | `ri-file-search-line` | `ic-search` |
| card-icon | KYC/AML Analysis | `ri-user-search-line` | `cloud-posture-scan-icon` |
| card-icon | Regulatory Reporting | `ri-file-text-line` | `ic-add-file` |
| card-icon | Fraud Detection Support | `ri-alarm-warning-line` | `remediation-workflow-icon` |
| card-icon | Customer Communication Drafting | `ri-mail-send-line` | `contact-icon` |
| card-icon | Investment Analysis | `ri-line-chart-line` | `evidence-mapping-icon` |
| card-icon | DeepSeek V4-Flash | `ri-brain-line` | `local-ai-inference-icon` |
| card-icon | Llama 4 Scout | `ri-robot-2-line` | `local-ai-inference-icon` |
| card-icon | R1 70B Distill or Qwen 3 72B | `ri-scales-3-line` | `local-ai-inference-icon` |
| risk-card | No Financial-Specific Fine-Tuning | `ri-search-eye-line` | `ic-search` |
| risk-card | No Banking System Integration | `ri-links-line` | `ic-plugins` |
| risk-card | No Regulatory Filing Connectors | `ri-book-2-line` | `resources-icon` |
| risk-card | You Own the Maintenance | `ri-settings-3-line` | `ic-default-access` |
| risk-card | Does cloud AI create GLBA compliance risk? | `ri-scales-3-line` | `local-ai-inference-icon` |
| risk-card | What financial workflows does this hardware support? | `ri-brain-line` | `agentic-orchestration-icon` |
| risk-card | How does the cost compare for a 50-person institution? | `ri-coin-line` | `ai-cost-comparison-icon` |
| risk-card | Does our institution need dedicated IT staff? | `ri-tools-line` | `ic-skills-teacher` |

### defense-contractors.html — 17 slots

| Slot | Card | Now | Proposed |
|---|---|---|---|
| card-icon | Your Physical Security Controls | `ri-shield-check-line` | `air-gapped-icon` |
| card-icon | Air-Gap Capable | `ri-wifi-off-line` | `air-gapped-icon` |
| card-icon | Network Segregation Ready | `ri-lock-line` | `itarr-cmmc-ai-icon` |
| card-icon | CUI-Adjacent Document Analysis | `ri-file-search-line` | `ic-search` |
| card-icon | Proposal Drafting | `ri-draft-line` | `ic-add-file` |
| card-icon | Technical Writing Support | `ri-file-text-line` | `ic-add-file` |
| card-icon | Contract Compliance Research | `ri-search-eye-line` | `ic-search` |
| card-icon | Security Documentation | `ri-shield-keyhole-line` | `WSF-icon` |
| card-icon | Internal Communications | `ri-mail-send-line` | `contact-icon` |
| risk-card | No CMMC Certification | `ri-award-line` | `compliance-evidence-icon` |
| risk-card | No Classified Network Connectivity | `ri-lock-line` | `itarr-cmmc-ai-icon` |
| risk-card | No GFE Integration | `ri-government-line` | `local-govt-ai-icon` |
| risk-card | You Own the Security | `ri-settings-3-line` | `ic-default-access` |
| risk-card | Can I process CUI through a commercial cloud AI API? | `ri-file-shield-2-line` | `hipaa-ai-icon` |
| risk-card | Does cloud AI create ITAR export risk? | `ri-global-line` | `itarr-cmmc-ai-icon` |
| risk-card | Does this hardware have CMMC certification? | `ri-shield-check-line` | `air-gapped-icon` |
| risk-card | Can it operate air-gapped? | `ri-wifi-off-line` | `air-gapped-icon` |

### insurance.html — 20 slots

| Slot | Card | Now | Proposed |
|---|---|---|---|
| card-icon | Zero External Transmission | `ri-shield-check-line` | `air-gapped-icon` |
| card-icon | A System You Own | `ri-server-line` | `server-rack-icon` |
| card-icon | Air-Gap Capable | `ri-wifi-off-line` | `air-gapped-icon` |
| card-icon | Claims Processing | `ri-file-search-line` | `ic-search` |
| card-icon | Underwriting Analysis | `ri-bar-chart-grouped-line` | `evidence-mapping-icon` |
| card-icon | Fraud Detection | `ri-alarm-warning-line` | `remediation-workflow-icon` |
| card-icon | Policy Document Review | `ri-file-text-line` | `ic-add-file` |
| card-icon | Actuarial Support | `ri-calculator-line` | `ai-cost-comparison-icon` |
| card-icon | Customer Correspondence | `ri-mail-send-line` | `contact-icon` |
| card-icon | DeepSeek V4-Flash | `ri-brain-line` | `local-ai-inference-icon` |
| card-icon | Llama 4 Scout | `ri-robot-2-line` | `local-ai-inference-icon` |
| card-icon | R1 70B Distill or Qwen 3 72B | `ri-scales-3-line` | `local-ai-inference-icon` |
| risk-card | No Insurance-Specific Fine-Tuning | `ri-search-eye-line` | `ic-search` |
| risk-card | No Claims Management Integration | `ri-links-line` | `ic-plugins` |
| risk-card | No Actuarial Modeling Engine | `ri-calculator-line` | `ai-cost-comparison-icon` |
| risk-card | You Own the Maintenance | `ri-settings-3-line` | `ic-default-access` |
| risk-card | Does cloud AI create HIPAA risk for health insurers? | `ri-shield-check-line` | `air-gapped-icon` |
| risk-card | What insurance workflows does this hardware support? | `ri-brain-line` | `agentic-orchestration-icon` |
| risk-card | How does the cost compare for a 30-person insurance office? | `ri-coin-line` | `ai-cost-comparison-icon` |
| risk-card | Does our carrier need dedicated IT staff? | `ri-tools-line` | `ic-skills-teacher` |

### research-labs.html — 21 slots

| Slot | Card | Now | Proposed |
|---|---|---|---|
| card-icon | IP Stays Under Your Roof | `ri-lock-line` | `itarr-cmmc-ai-icon` |
| card-icon | Unlimited Inference | `ri-infinity-line` | `on-prem-ai-icon` |
| card-icon | Open Weights, Full Transparency | `ri-open-source-line` | `ic-default-access` |
| card-icon | Literature Synthesis | `ri-book-open-line` | `resources-icon` |
| card-icon | Qualitative Data Analysis | `ri-bar-chart-grouped-line` | `evidence-mapping-icon` |
| card-icon | Grant Proposal Drafting | `ri-file-text-line` | `ic-add-file` |
| card-icon | Dataset Annotation | `ri-price-tag-3-line` | `ic-plan` |
| card-icon | Code Generation for Analysis | `ri-code-s-slash-line` | `ic-coding` |
| card-icon | Academic Writing Support | `ri-edit-line` | `ic-add-file` |
| risk-card | 1M Token Context Window | `ri-file-list-3-line` | `ic-code-window` |
| risk-card | MIT License: Inspect, Modify, Extend | `ri-open-source-line` | `ic-default-access` |
| risk-card | Reproducibility | `ri-restart-line` | `ic-plan` |
| risk-card | IRB and Data Governance | `ri-file-shield-2-line` | `hipaa-ai-icon` |
| risk-card | Not a Research Computing Cluster | `ri-server-line` | `server-rack-icon` |
| risk-card | Inference Only, Not Training | `ri-brain-line` | `local-ai-inference-icon` |
| risk-card | No Research Database Integration | `ri-database-2-line` | `resources-icon` |
| risk-card | You Own the Maintenance | `ri-settings-3-line` | `ic-default-access` |
| risk-card | Does cloud AI risk my unpublished research data? | `ri-lock-line` | `itarr-cmmc-ai-icon` |
| risk-card | How does local AI help with grant data residency requirements? | `ri-file-shield-2-line` | `hipaa-ai-icon` |
| risk-card | Can researchers inspect and modify the models? | `ri-open-source-line` | `ic-default-access` |
| risk-card | How does cost compare for a heavy-usage research lab? | `ri-coin-line` | `ai-cost-comparison-icon` |

### solutions.html — 10 slots

| Slot | Card | Now | Proposed |
|---|---|---|---|
| card-icon | Tribal Nations | `ri-earth-line` | `tribal-nation-icon` |
| card-icon | Government | `ri-government-line` | `local-govt-ai-icon` |
| card-icon | Education | `ri-graduation-cap-line` | `higher-learning-ai-icon` |
| card-icon | Casino Gaming | `ri-dice-line` | `casino-ai-icon` |
| card-icon | A Stack Sized to the Work | `ri-cpu-line` | `server-rack-icon` |
| card-icon | OpenWebUI Interface | `ri-window-line` | `ic-code-window` |
| card-icon | Air-Gap Capable | `ri-lock-line` | `itarr-cmmc-ai-icon` |
| card-icon | Swappable Open-Weight Models | `ri-settings-3-line` | `ic-default-access` |
| card-icon | One-Time Purchase, Zero Token Fees | `ri-money-dollar-circle-line` | `ai-cost-comparison-icon` |
| card-icon | Direct Engineer Support | `ri-tools-line` | `ic-skills-teacher` |
