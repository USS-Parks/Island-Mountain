# Product Lines

## Summit Series (Current, Shipping)

On-premises AI inference servers. Pre-built, burn-tested, ready to deploy.

### Summit Base
- GPUs: 2x NVIDIA RTX PRO 6000 Blackwell Server Edition 96GB (new, professional-grade)
- VRAM: 192GB GDDR7 ECC total | Bandwidth: 1,597 GB/s per GPU
- Price: $59,000 - $69,000
- Availability: InStock
- SKU: IM-SUMMIT-BASE
- Ships with: DeepSeek V4-Flash (FP8), Llama 4 Scout, and buyer-selected R1 70B Distill or Qwen 3 72B
- Target: Entry point for regulated organizations. Runs V4-Flash at FP8 (~170GB, ~22GB headroom).

### Summit Ridge
- GPUs: Build-to-order configuration (RTX PRO 6000 Blackwell)
- Price: $95,000 - $120,000
- Availability: PreOrder
- SKU: IM-SUMMIT-RIDGE
- Target: Custom GPU, CPU, and RAM options matched to buyer's use case. Built for teams needing a system spec'd to their models and concurrency requirements.
- Note: No "2-3x faster" claim (removed Session 44 as unsubstantiated). Performance is similar to Base with same models per faq.html.

### Summit Pinnacle
- GPUs: 4x NVIDIA RTX PRO 6000 Blackwell 96GB
- VRAM: 384GB GDDR7 ECC total | Bandwidth: 1,597 GB/s per GPU
- Price: $175,000 - $225,000
- Availability: PreSale (ships July 2026)
- SKU: IM-SUMMIT-PINNACLE
- Target: Maximum performance, largest models, V4-Flash at full FP16 quality

## Landfall Series (Prosumer, Pre-Orders Open)

- Landfall Scout: NVIDIA RTX 5080 16GB. $7,000 - $8,000
- Landfall Ranger: NVIDIA RTX 5090 32GB. $9,500 - $11,500
- Landfall Pack Leader: NVIDIA RTX PRO 4500 Blackwell 32GB (MIG 2x16GB virtual). $15,000 - $22,000
- Strategy: Scout buyer = warm referral path to Summit Base institutional sale
- Teaser sections on: products.html, index.html, investors.html

## Citadel Series (Future, Enterprise)

- Multi-rack SCIF systems, anchored on NVIDIA DGX B200 (8x B200) reference platform
- Price: $400,000 - $500,000
- Timeline: Scoped after first Summit-tier defense deployment
- Mentioned on: investors.html (Milestones section)

## Software Stack (all tiers)

- Ubuntu Linux (hardened)
- Ollama (model serving)
- vLLM (inference engine, tensor parallelism for multi-user concurrency)
- Open WebUI (user interface, multi-user)
- Air-gap capable: OFFLINE_MODE, HF_HUB_OFFLINE, disabled telemetry/sharing/web-search/signup

## Model Ecosystem (updated Session 32)

- DeepSeek V4-Flash: primary inference model (shipped quantized on Summit Base)
- Llama 3.3 70B: general-purpose (replaced Llama 3.1 70B site-wide in Session 32)
- Buyer-selected third model: R1 70B Distill or Qwen 2.5 72B
- MIT/Apache licensing claims corrected to "permissive open-source licenses" (Session 32)
- Western-origin model availability notes on technology, defense, government pages
- Mixtral 8x22B removed from stack (Session 32)
- Model Ecosystem section on technology.html describes Llama 4 Scout, GPT-OSS, Phi-4 refs

## Pricing Context

- No token fees, no subscription, hardware ownership
- Financing available
- TCO comparison vs cloud: $64,000-$220,000+ cloud cost over 5 years (transparent range with May 2026 pricing, assumptions stated; Session 47 fix)
- Break-even typically under 12 months (lower $59K-$69K Base entry vs prior $75K-$85K)
- Warranty + direct phone support (1-801-609-1130)

## Professional-Grade GPUs (Competitive Differentiator)

- New cards via authorized NVIDIA channels with full procurement documentation
- ECC GDDR7 memory, passive server cooling, PCIe Gen 5, ISV-certified drivers, always-on duty cycle rating
- Compliance architecture argument vs consumer GPUs (RTX 4090 etc.)
- Section on products.html: "Why Professional-Grade GPUs"

## Resolved: H100 Bandwidth Issue (Session 73)

The old "3.35 TB/s H100 SXM5" bandwidth error is moot. The Blackwell overhaul (Session 73, 73A-73G) replaced all H100/H200 hardware with NVIDIA RTX PRO 6000 Blackwell (96GB GDDR7 ECC, 1,597 GB/s). No SXM/HBM bandwidth figures remain on the site except as explicit comparison points in blog/h100-vs-h200-inference-comparison.html.
