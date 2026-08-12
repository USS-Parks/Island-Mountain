/**
 * Faithful TypeScript port of island_mountain_publisher.discovery's four marker-anchored
 * insertions. Idempotent and duplicate-safe: returns the input unchanged when the item is
 * already present, and refuses (throws) when the anchor is missing/ambiguous rather than
 * corrupting a live discovery surface.
 */
import type { Surface } from './content'

export class InsertionError extends Error {}

function countOccurrences(haystack: string, needle: string): number {
  if (needle === '') return 0
  let count = 0
  let index = 0
  for (;;) {
    const found = haystack.indexOf(needle, index)
    if (found === -1) break
    count += 1
    index = found + needle.length
  }
  return count
}

/** Apply one discovery-surface insertion against live file content. */
export function applyInsertion(live: string, surface: Surface): string {
  const nl = live.includes('\r\n') ? '\r\n' : '\n'
  const present = countOccurrences(live, surface.marker)
  if (present === surface.present_count) return live // already published — no-op
  if (present !== 0) {
    throw new InsertionError(
      `${surface.path}: expected 0 or ${surface.present_count} occurrences of the marker, found ${present}`
    )
  }
  const fragment = surface.fragment_lines.join(nl)
  if (surface.position === 'before') {
    if (countOccurrences(live, surface.anchor) !== 1) {
      throw new InsertionError(
        `${surface.path}: anchor '${surface.anchor}' is missing or ambiguous`
      )
    }
    // Function replacement: never let '$' in the fragment be read as a replacement pattern.
    return live.replace(surface.anchor, () => fragment + nl + surface.anchor)
  }
  const target = surface.anchor + (surface.anchor_trailing_newline ? nl : '')
  if (countOccurrences(live, target) !== 1) {
    throw new InsertionError(`${surface.path}: insertion anchor is missing or ambiguous`)
  }
  const insertion = (surface.prepend_newline ? nl : '') + fragment
  return live.replace(target, () => target + insertion)
}
