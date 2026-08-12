import test from 'node:test'
import assert from 'node:assert/strict'
import { applyInsertion, InsertionError } from './insert'
import type { Surface } from './content'

const blogSurface: Surface = {
  path: 'blog.html',
  anchor: '      <div class="blog-grid fade-in">',
  anchor_trailing_newline: true,
  position: 'after',
  prepend_newline: false,
  // includes a literal '$5' to prove '$' is not read as a replacement pattern
  fragment_lines: ['        <!-- card p04 -->', '        <div>save $5</div>', ''],
  marker: 'href="blog/x.html"',
  present_count: 2
}

const sitemapSurface: Surface = {
  path: 'sitemap.xml',
  anchor: '</urlset>',
  anchor_trailing_newline: false,
  position: 'before',
  prepend_newline: false,
  fragment_lines: ['  <url>', '    <loc>https://islandmountain.io/blog/x.html</loc>', '  </url>'],
  marker: '<loc>https://islandmountain.io/blog/x.html</loc>',
  present_count: 1
}

test('after: inserts fragment right after the anchor line', () => {
  const live = 'top\n      <div class="blog-grid fade-in">\n      </div>\n'
  const out = applyInsertion(live, blogSurface)
  assert.ok(out.includes('<!-- card p04 -->'))
  assert.ok(out.indexOf('blog-grid fade-in') < out.indexOf('card p04'))
  assert.ok(out.includes('save $5'), 'literal $ must survive replacement')
})

test('after: idempotent when marker already at present_count', () => {
  const s: Surface = { ...blogSurface, fragment_lines: ['x'] }
  const live = 'href="blog/x.html" a href="blog/x.html"\n      <div class="blog-grid fade-in">\n'
  assert.equal(applyInsertion(live, s), live)
})

test('after: CRLF files stay CRLF', () => {
  const live = 'top\r\n      <div class="blog-grid fade-in">\r\n      </div>\r\n'
  const out = applyInsertion(live, blogSurface)
  assert.ok(out.includes('\r\n        <!-- card p04 -->\r\n'))
})

test('before: inserts entry before the closing token', () => {
  const live = '<urlset>\n  <url><loc>a</loc></url>\n</urlset>\n'
  const out = applyInsertion(live, sitemapSurface)
  assert.ok(out.indexOf('blog/x.html') < out.indexOf('</urlset>'))
})

test('before: idempotent when URL already present', () => {
  const live = '<urlset>\n<loc>https://islandmountain.io/blog/x.html</loc>\n</urlset>\n'
  assert.equal(applyInsertion(live, sitemapSurface), live)
})

test('refuses on an unexpected marker count (partial/corrupt state)', () => {
  const live = 'href="blog/x.html"\n      <div class="blog-grid fade-in">\n' // 1 hit, expected 0 or 2
  assert.throws(() => applyInsertion(live, blogSurface), InsertionError)
})

test('refuses when the anchor is missing', () => {
  const live = 'no anchor here\n'
  assert.throws(() => applyInsertion(live, blogSurface), InsertionError)
})
