# Product Lines

## Summit Series (Current, Shipping)

On-premises AI inference servers. Pre-built, burn-tested, ready to deploy.

### Summit Base
- GPUs: 2x NVIDIA H100 80GB PCIe (refurbished, enterprise provenance)
- Price: $75,000 - $85,000
- Availability: InStock
- SKU: IM-SUMMIT-BASE
- Ships with: DeepSeek V4-Flash (quantized), Llama 3.3 70B, and buyer-selected R1 70B Distill or Qwen 2.5 72B
- Target: Entry point for regulated organizations

### Summit Ridge
- GPUs: Build-to-order configuration (H100 80GB PCIe)
- Price: $150,000 - $160,000
- Availability: PreOrder
- SKU: IM-SUMMIT-RIDGE
- Target: Custom GPU, CPU, and RAM options matched to buyer's use case. Built for teams needing a system spec'd to their models and concurrency requirements.
- Note: No "2-3x faster" claim (removed Session 44 as unsubstantiated). Performance is similar to Base with same quantized models per faq.html.

### Summit Pinnacle
- GPUs: 2x NVIDIA H200 141GB
- Price: $350,000 - $400,000
- Availability: PreSale (coming Q3 2026)
- SKU: IM-SUMMIT-PINNACLE
- Target: Maximum performance, largest models

## Landfall Series (In Development, Prosumer)

- Landfall Solo: $4,500 - $7,500
- Landfall Crew: $9,000 - $14,000
- Strategy: Solo buyer = warm referral path to Summit Base institutional sale
- Teaser sections on: products.html, index.html, investors.html

## Citadel Series (Future, Enterprise)

- Multi-rack SCIF systems
- Price: $400K+
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
- Break-even typically 12-18 months
- Warranty + direct phone support (1-801-609-1130)

## GPU Provenance (Competitive Differentiator)

- Enterprise procurement documentation
- RMA chains maintained
- Compliance architecture argument vs consumer GPUs (RTX 4090 etc.)
- Section on products.html: "Why Enterprise GPUs, Not Consumer Cards"

## Known Accuracy Issue

faq.html references "3.35 TB/s memory bandwidth" for H100 GPUs. This is correct for H100 SXM5 only. Summit Base uses H100 PCIe with 2.0 TB/s HBM2e bandwidth. Flagged Session 44 for future fix.
