/**
 * Minimal GitHub Git Data API client: atomically commit a set of files to `main`.
 * Replaces the Windows path's local `git commit && git push`; the resulting commit is what
 * GitHub Pages deploys. Requires env.GITHUB_TOKEN (fine-grained PAT, Contents: read+write).
 */
import type { Env } from '../types'

const REPO = 'USS-Parks/islandmountain'
const API = 'https://api.github.com'
const UA = 'island-mountain-publisher'

export interface FileChange {
  path: string
  content: string
}

function authHeaders(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.GITHUB_TOKEN}`,
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': UA
  }
}

async function gh(env: Env, method: string, path: string, body?: unknown): Promise<any> {
  const headers = authHeaders(env)
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  const res = await fetch(`${API}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body)
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub ${method} ${path} -> ${res.status}: ${text.slice(0, 300)}`)
  }
  if (res.status === 204) return {}
  const raw = await res.text()
  return raw ? JSON.parse(raw) : {}
}

function base64ToBytes(b64: string): Uint8Array {
  const clean = b64.replace(/\n/g, '')
  return Uint8Array.from(atob(clean), (c) => c.charCodeAt(0))
}

/** Read a repo text file at a pinned ref; null when it does not exist (404). */
export async function readFileTextOrNull(
  env: Env,
  filePath: string,
  ref: string
): Promise<string | null> {
  const res = await fetch(`${API}/repos/${REPO}/contents/${encodeURI(filePath)}?ref=${ref}`, {
    headers: authHeaders(env)
  })
  if (res.status === 404) return null
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`GitHub read ${filePath} -> ${res.status}: ${text.slice(0, 200)}`)
  }
  const data = (await res.json()) as { content?: string }
  return new TextDecoder().decode(base64ToBytes(data.content ?? ''))
}

/** Read a repo binary file at a ref as bytes (the LinkedIn card PNG). */
export async function readFileBytes(env: Env, filePath: string, ref: string): Promise<Uint8Array> {
  const data = (await gh(
    env,
    'GET',
    `/repos/${REPO}/contents/${encodeURI(filePath)}?ref=${ref}`
  )) as {
    content: string
  }
  return base64ToBytes(data.content)
}

/**
 * Atomically commit files to main via the Git Data API. `build` receives a reader pinned at
 * the base commit, so surface patches are consistent with the commit's parent; if the ref
 * advanced under us (a concurrent push), the whole build retries against the new HEAD.
 * Returns the new commit sha, or the unchanged base sha when `build` yields no changes.
 */
export async function commitFiles(
  env: Env,
  message: string,
  build: (readAtBase: (path: string) => Promise<string | null>) => Promise<FileChange[]>
): Promise<string> {
  let lastErr: unknown
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const ref = await gh(env, 'GET', `/repos/${REPO}/git/ref/heads/main`)
    const baseCommitSha = ref.object.sha as string
    const baseCommit = await gh(env, 'GET', `/repos/${REPO}/git/commits/${baseCommitSha}`)
    const baseTreeSha = baseCommit.tree.sha as string
    const files = await build((p) => readFileTextOrNull(env, p, baseCommitSha))
    if (files.length === 0) return baseCommitSha
    const tree = await gh(env, 'POST', `/repos/${REPO}/git/trees`, {
      base_tree: baseTreeSha,
      tree: files.map((f) => ({ path: f.path, mode: '100644', type: 'blob', content: f.content }))
    })
    const commit = await gh(env, 'POST', `/repos/${REPO}/git/commits`, {
      message,
      tree: tree.sha,
      parents: [baseCommitSha]
    })
    try {
      await gh(env, 'PATCH', `/repos/${REPO}/git/refs/heads/main`, {
        sha: commit.sha,
        force: false
      })
      return commit.sha as string
    } catch (err) {
      lastErr = err // ref advanced under us: rebuild against the new HEAD
    }
  }
  throw new Error(`commitFiles: ref update kept failing: ${String(lastErr)}`)
}

/**
 * Prove the FULL write path (blob -> tree -> commit -> ref create/update/delete) with the
 * real token, without ever touching main: everything happens on a throwaway
 * `publisher-writecheck` branch that is created, committed to, read back, and deleted before
 * returning. Exposed via POST /api/publisher/run?check=write.
 */
export async function githubWriteCheck(
  env: Env
): Promise<{ ok: boolean; scratchCommit: string; detail: string }> {
  const branch = 'publisher-writecheck'
  const refHeads = `/repos/${REPO}/git/refs/heads/${branch}`
  const mainRef = await gh(env, 'GET', `/repos/${REPO}/git/ref/heads/main`)
  const baseSha = mainRef.object.sha as string
  const baseCommit = await gh(env, 'GET', `/repos/${REPO}/git/commits/${baseSha}`)
  const baseTreeSha = baseCommit.tree.sha as string
  // Start from a clean scratch branch (ignore "absent" on the pre-emptive delete).
  try {
    await gh(env, 'DELETE', refHeads)
  } catch {
    /* branch not present */
  }
  await gh(env, 'POST', `/repos/${REPO}/git/refs`, { ref: `refs/heads/${branch}`, sha: baseSha })
  const stamp = new Date().toISOString()
  const marker = `write-path ok ${stamp}\n`
  const tree = await gh(env, 'POST', `/repos/${REPO}/git/trees`, {
    base_tree: baseTreeSha,
    tree: [{ path: '.publisher-writecheck', mode: '100644', type: 'blob', content: marker }]
  })
  const commit = await gh(env, 'POST', `/repos/${REPO}/git/commits`, {
    message: 'publisher write-path self-check (scratch branch, auto-deleted)',
    tree: tree.sha,
    parents: [baseSha]
  })
  await gh(env, 'PATCH', refHeads, { sha: commit.sha, force: true })
  const readback = await readFileTextOrNull(env, '.publisher-writecheck', commit.sha as string)
  await gh(env, 'DELETE', refHeads) // main never saw any of this
  return {
    ok: readback === marker,
    scratchCommit: commit.sha as string,
    detail: 'created scratch branch, committed a blob, read it back, deleted the branch'
  }
}
