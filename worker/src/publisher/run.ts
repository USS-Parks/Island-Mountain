/**
 * Autonomous publisher orchestration — the cloud replacement for the Windows/WSL
 * `im-publisher run-due`. Idempotent: safe to call on every cron fire (and manually via
 * POST /api/publisher/run). Blog lane commits to `main` via the GitHub API; LinkedIn lane
 * posts via REST. All gating mirrors the Python run_due (blog at 05:00 PT; LinkedIn in its
 * window, hard cutoff 08:01 PT; never point LinkedIn at an article that is not live).
 */
import type { Env } from '../types'
import { dayFor, linkedinCutoffMs, pacificDate, type CampaignDay } from './content'
import { applyInsertion, upsertSitemapTxt } from './insert'
import { commitFiles, type FileChange } from './github'
import { done, ensureLedger, record, remoteId } from './ledger'
import { createComment, createPost, uploadImage } from './linkedin'

// Cloudflare 403s bot user-agents (default Workers/urllib UA); browsers get 200. The
// blog-live probe must present a browser UA or it falsely defers every LinkedIn post.
const BROWSER_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/126.0 Safari/537.36'

async function publishBlog(env: Env, day: CampaignDay): Promise<string> {
  return commitFiles(
    env,
    `Publish ${day.campaign_id}: ${day.linkedin.title}`,
    async (readAtBase) => {
      const files: FileChange[] = []
      const existingArticle = await readAtBase(day.blog_path)
      if (existingArticle !== day.article_html) {
        files.push({ path: day.blog_path, content: day.article_html })
      }
      for (const surface of day.surfaces) {
        const live = await readAtBase(surface.path)
        if (live === null) throw new Error(`missing ${surface.path} in repository`)
        const updated = applyInsertion(live, surface)
        if (updated !== live) files.push({ path: surface.path, content: updated })
      }
      const sitemapTxt = await readAtBase('sitemap.txt')
      if (sitemapTxt === null) throw new Error('missing sitemap.txt in repository')
      const updatedSitemapTxt = upsertSitemapTxt(sitemapTxt, day.blog_url)
      if (updatedSitemapTxt !== sitemapTxt) {
        files.push({ path: 'sitemap.txt', content: updatedSitemapTxt })
      }
      return files
    }
  )
}

async function publishLinkedIn(env: Env, day: CampaignDay): Promise<string> {
  const actor = env.LINKEDIN_ACTOR_URN ?? ''
  if (!actor.startsWith('urn:li:person:')) {
    return `linkedin ${day.campaign_id} aborted: LINKEDIN_ACTOR_URN must be a person URN`
  }
  // Fail closed: never let LinkedIn point at an article that is not live.
  const liveCheck = await fetch(day.blog_url, {
    method: 'GET',
    headers: { 'User-Agent': BROWSER_UA }
  })
  if (liveCheck.status !== 200) {
    return `linkedin ${day.campaign_id} deferred: blog HTTP ${liveCheck.status}`
  }
  let postUrn = await remoteId(env, day.campaign_id, 'linkedin_post')
  if (!postUrn) {
    const imageUrn = await uploadImage(env, day)
    await record(env, day.campaign_id, 'linkedin_image', imageUrn)
    postUrn = await createPost(env, day, imageUrn)
    await record(env, day.campaign_id, 'linkedin_post', postUrn)
  }
  const commentId = await createComment(env, day, postUrn)
  await record(env, day.campaign_id, 'linkedin_comment', commentId)
  return `linkedin ${day.campaign_id} posted ${postUrn}`
}

async function blogLane(env: Env, day: CampaignDay, now: Date): Promise<string> {
  if (!env.GITHUB_TOKEN) return `blog ${day.campaign_id} skipped: GITHUB_TOKEN unset`
  if (now.getTime() < Date.parse(day.blog_at)) return `blog ${day.campaign_id} not yet due`
  if (await done(env, day.campaign_id, 'blog')) return `blog ${day.campaign_id} already done`
  const sha = await publishBlog(env, day)
  await record(env, day.campaign_id, 'blog', sha)
  return `blog ${day.campaign_id} published ${sha}`
}

async function linkedinLane(env: Env, day: CampaignDay, now: Date): Promise<string> {
  if (!env.LINKEDIN_ACCESS_TOKEN || !env.LINKEDIN_ACTOR_URN || !env.LINKEDIN_VERSION) {
    return `linkedin ${day.campaign_id} skipped: secrets unset`
  }
  const nowMs = now.getTime()
  if (nowMs < Date.parse(day.linkedin_at)) return `linkedin ${day.campaign_id} not yet due`
  if (nowMs >= linkedinCutoffMs(day)) return `linkedin ${day.campaign_id} past 08:01 cutoff`
  if (await done(env, day.campaign_id, 'linkedin_comment')) {
    return `linkedin ${day.campaign_id} already done`
  }
  return publishLinkedIn(env, day)
}

/** Run today's due lanes for the Pacific date of `now`. Idempotent across repeated calls. */
export async function runPublisher(env: Env, now: Date = new Date()): Promise<string[]> {
  await ensureLedger(env)
  const today = pacificDate(now)
  const day = dayFor(today)
  if (!day) return [`no campaign scheduled for ${today}`]
  return [await blogLane(env, day, now), await linkedinLane(env, day, now)]
}

/**
 * Read-only diagnosis of why the LinkedIn lane may not be posting: is the blog live to the
 * Worker's own fetch, is the token valid (userinfo), does the actor URN match the token's
 * member, and does the first write (initializeUpload — reserves an upload, posts nothing)
 * succeed. Exposed via POST /api/publisher/run?check=linkedin.
 */
export async function linkedinCheck(env: Env): Promise<Record<string, unknown>> {
  const today = pacificDate(new Date())
  const day = dayFor(today)
  const out: Record<string, unknown> = {
    today,
    item: day?.campaign_id ?? null,
    secretsPresent: {
      token: Boolean(env.LINKEDIN_ACCESS_TOKEN),
      actor: env.LINKEDIN_ACTOR_URN ?? null,
      version: env.LINKEDIN_VERSION ?? null
    }
  }
  if (day) {
    const r = await fetch(day.blog_url, { method: 'GET', headers: { 'User-Agent': BROWSER_UA } })
    out.blogLive = { url: day.blog_url, status: r.status }
  }
  const token = env.LINKEDIN_ACCESS_TOKEN
  if (token) {
    const u = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    })
    if (u.ok) {
      const info = (await u.json()) as { sub?: string }
      out.userinfo = {
        status: u.status,
        sub: info.sub ?? null,
        actorMatches: info.sub ? (env.LINKEDIN_ACTOR_URN ?? '').endsWith(info.sub) : null
      }
    } else {
      out.userinfo = { status: u.status, error: (await u.text()).slice(0, 200) }
    }
    if (env.LINKEDIN_ACTOR_URN && env.LINKEDIN_VERSION) {
      const init = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'LinkedIn-Version': env.LINKEDIN_VERSION,
          'X-Restli-Protocol-Version': '2.0.0',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ initializeUploadRequest: { owner: env.LINKEDIN_ACTOR_URN } })
      })
      out.initializeUpload = {
        status: init.status,
        error: init.ok ? null : (await init.text()).slice(0, 200)
      }
    }
  }
  return out
}
