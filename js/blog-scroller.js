/* ============================================================
   Island Mountain - Blog rail driver (one source of truth)
   Turns the ‹ › controls one page at a time (a page = however many
   cards are fully visible), keeps them disabled at each end, and
   mirrors that on Left/Right keys. Native overflow handles touch /
   trackpad; CSS scroll-snap settles each turn. Paired with
   css/blog-scroller.css on the homepage and Woven Security page.
   ============================================================ */
;(function () {
  'use strict'
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  function setup(section) {
    var track = section.querySelector('.blog-rail')
    if (!track) return
    var prev = section.querySelector('[data-dir="prev"]')
    var next = section.querySelector('[data-dir="next"]')

    function gap() {
      var cs = getComputedStyle(track)
      return parseFloat(cs.columnGap || cs.gap) || 0
    }
    // One "page" = the number of fully visible cards, so a turn lands cleanly.
    function pageSize() {
      var card = track.querySelector('.blog-rail-card')
      if (!card) return track.clientWidth
      var step = card.getBoundingClientRect().width + gap()
      var n = Math.max(1, Math.floor((track.clientWidth + gap()) / step))
      return n * step
    }
    function go(dir) {
      track.scrollBy({ left: dir * pageSize(), behavior: reduce ? 'auto' : 'smooth' })
    }
    // Coalesce to one layout read per frame: scroll events fire faster than
    // paint, and reading scrollWidth/clientWidth mid-handler forces reflow.
    var queued = false
    function update() {
      if (queued) return
      queued = true
      requestAnimationFrame(function () {
        queued = false
        var max = track.scrollWidth - track.clientWidth - 2
        if (prev) prev.disabled = track.scrollLeft <= 2
        if (next) next.disabled = track.scrollLeft >= max
      })
    }

    if (prev)
      prev.addEventListener('click', function () {
        go(-1)
      })
    if (next)
      next.addEventListener('click', function () {
        go(1)
      })
    track.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault()
        go(1)
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault()
        go(-1)
      }
    })
    update()
  }

  function init() {
    var rails = document.querySelectorAll('[data-blog-rail]')
    for (var i = 0; i < rails.length; i++) setup(rails[i])
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init)
  } else {
    init()
  }
})()
