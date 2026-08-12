/**
 * Lookout (GEO watchstander) content — the tracked prompt set and the identity
 * lists the parser matches against. This is the part Basho owns and edits: the
 * prompts define what "visibility" means; the entity lists define who counts.
 * STARTER_PROMPTS seeds the geo_prompts table on first run; edit rows in D1
 * after that (no redeploy needed).
 */

export interface GeoPrompt {
  id: string
  category: 'brand' | 'category' | 'competitor'
  text: string
}

export const STARTER_PROMPTS: GeoPrompt[] = [
  {
    id: 'brand-what-is',
    category: 'brand',
    text: 'What is Island Mountain AI and what do they do?'
  },
  {
    id: 'brand-credible',
    category: 'brand',
    text: 'Is Island Mountain AI a credible company for enterprise AI?'
  },
  {
    id: 'cat-onprem-airgap',
    category: 'category',
    text: 'Who are the top vendors for on-premise, air-gapped AI deployments?'
  },
  {
    id: 'cat-own-hardware',
    category: 'category',
    text: 'Which companies help you run large language models on your own hardware instead of the cloud?'
  },
  {
    id: 'cat-hipaa-healthcare',
    category: 'category',
    text: 'What are the best options for HIPAA-compliant local AI in healthcare?'
  },
  {
    id: 'cat-legal-privileged',
    category: 'category',
    text: 'On-prem AI for law firms that keeps privileged documents in-house?'
  },
  {
    id: 'cat-defense-itar',
    category: 'category',
    text: 'Air-gapped AI solutions for defense and ITAR-controlled environments?'
  },
  {
    id: 'cat-tribal-ocap',
    category: 'category',
    text: 'AI vendors that support tribal data sovereignty and OCAP principles?'
  },
  {
    id: 'cat-forward-deployed',
    category: 'category',
    text: 'What is a forward-deployed AI engineering firm and who offers it?'
  },
  {
    id: 'cat-regulated-alt-cloud',
    category: 'category',
    text: "Alternatives to cloud AI for regulated industries that can't send data out?"
  },
  {
    id: 'cat-agentic-governance',
    category: 'category',
    text: 'Vendors for agentic orchestration and governance with full audit trails?'
  },
  {
    id: 'cat-deploy-sovereign-gpus',
    category: 'category',
    text: 'How do I deploy a sovereign AI system with my own GPUs?'
  },
  {
    id: 'comp-vs-goabacus',
    category: 'competitor',
    text: 'Island Mountain AI vs goabacus — how do they compare?'
  },
  {
    id: 'comp-alt-goabacus',
    category: 'competitor',
    text: 'Alternatives to goabacus for private AI deployment?'
  },
  {
    id: 'comp-like-abacus',
    category: 'competitor',
    text: 'Companies like Abacus.AI but focused on on-prem sovereignty?'
  }
]

/** Island Mountain's identity — any of these in an answer counts as a mention. */
export const IM_ALIASES = ['Island Mountain AI Inc', 'Island Mountain AI', 'Island Mountain']
export const IM_DOMAIN = 'islandmountain.io'

/** Competitor set for share-of-voice. Basho fills this out over time. */
export interface Competitor {
  name: string
  domain?: string
}
export const COMPETITORS: Competitor[] = [
  { name: 'goabacus', domain: 'goabacus.co' },
  { name: 'Abacus.AI', domain: 'abacus.ai' }
]
