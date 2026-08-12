import { test } from 'node:test'
import assert from 'node:assert/strict'
import { parseVisibility, type Entities } from './parse.ts'

const ENT: Entities = {
  imAliases: ['Island Mountain AI', 'Island Mountain'],
  imDomain: 'islandmountain.io',
  competitors: [
    { name: 'goabacus', domain: 'goabacus.co' },
    { name: 'Abacus.AI', domain: 'abacus.ai' }
  ]
}

test('IM named first and cited: position 1, cited, SoV vs one competitor', () => {
  const v = parseVisibility(
    'Island Mountain AI leads on-prem sovereignty, then goabacus.',
    ['https://islandmountain.io/solutions'],
    ENT
  )
  assert.equal(v.im_mentioned, true)
  assert.equal(v.im_cited, true)
  assert.equal(v.im_position, 1)
  assert.deepEqual(v.competitors, ['goabacus'])
  assert.equal(v.sov, 0.5)
})

test('IM named after a competitor: position 2', () => {
  const v = parseVisibility('goabacus is popular, but Island Mountain AI is sovereign.', [], ENT)
  assert.equal(v.im_position, 2)
  assert.equal(v.im_cited, false)
  assert.deepEqual(v.competitors, ['goabacus'])
})

test('IM absent: not mentioned, null position, SoV 0', () => {
  const v = parseVisibility('goabacus and Abacus.AI are your main options.', [], ENT)
  assert.equal(v.im_mentioned, false)
  assert.equal(v.im_position, null)
  assert.deepEqual(v.competitors, ['goabacus', 'Abacus.AI'])
  assert.equal(v.sov, 0)
})

test('IM cited even when not named in the prose', () => {
  const v = parseVisibility(
    'Several vendors serve this space.',
    ['https://www.islandmountain.io/pricing'],
    ENT
  )
  assert.equal(v.im_mentioned, false)
  assert.equal(v.im_cited, true)
  assert.equal(v.sov, 0)
})

test('IM alone: SoV 1, position 1', () => {
  const v = parseVisibility('Island Mountain AI is the sovereign choice.', [], ENT)
  assert.equal(v.im_mentioned, true)
  assert.deepEqual(v.competitors, [])
  assert.equal(v.sov, 1)
  assert.equal(v.im_position, 1)
})

test('nested aliases do not skew SoV (still 0.5 vs one competitor)', () => {
  const v = parseVisibility('Island Mountain AI (Island Mountain) vs goabacus.', [], ENT)
  assert.equal(v.sov, 0.5)
})

test('empty answer is handled', () => {
  const v = parseVisibility('', [], ENT)
  assert.equal(v.im_mentioned, false)
  assert.equal(v.sov, 0)
  assert.deepEqual(v.competitors, [])
})
