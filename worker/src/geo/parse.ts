/**
 * Lookout visibility parser — deterministic, no LLM. Given one engine's answer
 * text + its citations, decide whether Island Mountain showed up, whether it was
 * cited, where it ranked, and its share of voice against the competitor set.
 * Share of voice is presence-based (share of brands *named*, not raw frequency)
 * so nested aliases like "Island Mountain" inside "Island Mountain AI" can't
 * skew the number.
 */

export interface Entities {
  imAliases: string[]
  imDomain: string
  competitors: { name: string; domain?: string }[]
}

export interface Visibility {
  im_mentioned: boolean
  im_cited: boolean
  im_position: number | null
  competitors: string[]
  sov: number // 0..1
}

/** Earliest character index at which any needle appears (case-insensitive), or -1. */
function firstIndex(haystack: string, needles: string[]): number {
  const h = haystack.toLowerCase()
  let best = -1
  for (const nd of needles) {
    if (!nd) continue
    const idx = h.indexOf(nd.toLowerCase())
    if (idx !== -1 && (best === -1 || idx < best)) best = idx
  }
  return best
}

/** Does a URL's host (or the raw string, if unparseable) contain the domain? */
function hostIncludes(url: string, domain: string): boolean {
  const d = domain.toLowerCase()
  try {
    return new URL(url).host.toLowerCase().includes(d)
  } catch {
    return url.toLowerCase().includes(d)
  }
}

export function parseVisibility(answer: string, citations: string[], ent: Entities): Visibility {
  const text = answer || ''
  const imNeedles = [...ent.imAliases, ent.imDomain]
  const imFirst = firstIndex(text, imNeedles)
  const im_mentioned = imFirst !== -1

  const im_cited = (citations || []).some((u) => hostIncludes(u, ent.imDomain))

  const compFirsts: { name: string; first: number }[] = []
  for (const c of ent.competitors) {
    const first = firstIndex(text, [c.name, ...(c.domain ? [c.domain] : [])])
    if (first !== -1) compFirsts.push({ name: c.name, first })
  }
  const competitors = compFirsts.map((c) => c.name)

  // Rank IM among all named brands by first appearance.
  let im_position: number | null = null
  if (im_mentioned) {
    im_position = compFirsts.filter((c) => c.first < imFirst).length + 1
  }

  // Share of the brands named in this answer.
  const brands = (im_mentioned ? 1 : 0) + competitors.length
  const sov = brands > 0 ? (im_mentioned ? 1 : 0) / brands : 0

  return { im_mentioned, im_cited, im_position, competitors, sov }
}
