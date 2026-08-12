/**
 * LinkedIn REST client — TypeScript port of island_mountain_publisher.linkedin.
 * Upload the campaign card, publish the summary post, then add the article first comment.
 * The comment uses the /v2 socialActions API (the versioned /rest one is partner-gated for
 * member tokens — proven 2026-08-10). Requires the three LINKEDIN_* secrets.
 */
import type { Env } from '../types'
import type { CampaignDay } from './content'
import { readFileBytes } from './github'

const REST = 'https://api.linkedin.com/rest'
const V2 = 'https://api.linkedin.com/v2'

function headers(env: Env): Record<string, string> {
  return {
    Authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
    'LinkedIn-Version': env.LINKEDIN_VERSION as string,
    'X-Restli-Protocol-Version': '2.0.0',
    'Content-Type': 'application/json'
  }
}

async function fail(prefix: string, res: Response): Promise<never> {
  throw new Error(`${prefix} ${res.status}: ${(await res.text()).slice(0, 200)}`)
}

export async function uploadImage(env: Env, day: CampaignDay): Promise<string> {
  const actor = env.LINKEDIN_ACTOR_URN as string
  if (!day.linkedin.card_path) throw new Error(`${day.campaign_id}: no card`)
  const initRes = await fetch(`${REST}/images?action=initializeUpload`, {
    method: 'POST',
    headers: headers(env),
    body: JSON.stringify({ initializeUploadRequest: { owner: actor } })
  })
  if (!initRes.ok) await fail('LinkedIn initializeUpload', initRes)
  const init = (await initRes.json()) as { value?: { uploadUrl?: string; image?: string } }
  const uploadUrl = init.value?.uploadUrl
  const imageUrn = init.value?.image
  if (!uploadUrl || !imageUrn) throw new Error('LinkedIn returned no image upload target')
  const bytes = await readFileBytes(env, day.linkedin.card_path, 'main')
  const put = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${env.LINKEDIN_ACCESS_TOKEN}`,
      'Content-Type': 'application/octet-stream'
    },
    body: bytes
  })
  if (!put.ok) await fail('LinkedIn image PUT', put)
  const encoded = encodeURIComponent(imageUrn)
  for (let attempt = 0; attempt < 12; attempt += 1) {
    const check = await fetch(`${REST}/images/${encoded}`, { headers: headers(env) })
    if (check.ok) {
      const img = (await check.json()) as { status?: string }
      if (img.status === 'AVAILABLE') return imageUrn
    }
    await new Promise((resolve) => setTimeout(resolve, 5000))
  }
  throw new Error('LinkedIn image did not become AVAILABLE')
}

export async function createPost(env: Env, day: CampaignDay, imageUrn: string): Promise<string> {
  const res = await fetch(`${REST}/posts`, {
    method: 'POST',
    headers: headers(env),
    body: JSON.stringify({
      author: env.LINKEDIN_ACTOR_URN,
      commentary: day.linkedin.commentary,
      visibility: 'PUBLIC',
      distribution: {
        feedDistribution: 'MAIN_FEED',
        targetEntities: [],
        thirdPartyDistributionChannels: []
      },
      content: {
        media: { id: imageUrn, title: day.linkedin.title, altText: day.linkedin.alt_text }
      },
      lifecycleState: 'PUBLISHED',
      isReshareDisabledByAuthor: false
    })
  })
  if (!res.ok) await fail('LinkedIn createPost', res)
  const urn = res.headers.get('x-restli-id')
  if (!urn) throw new Error('LinkedIn created no identifiable post')
  return urn
}

export async function createComment(env: Env, day: CampaignDay, postUrn: string): Promise<string> {
  const encoded = encodeURIComponent(postUrn)
  const res = await fetch(`${V2}/socialActions/${encoded}/comments`, {
    method: 'POST',
    headers: headers(env),
    body: JSON.stringify({
      actor: env.LINKEDIN_ACTOR_URN,
      message: { text: day.linkedin.first_comment }
    })
  })
  if (!res.ok) await fail('LinkedIn createComment', res)
  const id = res.headers.get('x-restli-id')
  if (!id) throw new Error('LinkedIn created no identifiable comment')
  return id
}
