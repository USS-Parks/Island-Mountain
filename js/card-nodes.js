/* Island Mountain - Aurora edge-node sequencer (one source of truth).
   Arms each .beam-card once, as it first scrolls into view; the CSS then
   loops the glowing node perpetually along the top + right edge. A rolling
   --i staggers the cascade so cards fire in sequence rather than lockstep. */
;(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  var cards = document.querySelectorAll('.beam-card')
  if (!cards.length) return
  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(cards, function (c) {
      c.classList.add('node-live')
    })
    return
  }
  var CAP = 8,
    live = 0
  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting && !en.target.classList.contains('node-live')) {
          en.target.style.setProperty('--i', live++ % CAP)
          en.target.classList.add('node-live')
          io.unobserve(en.target)
        }
      })
    },
    { threshold: 0.2, rootMargin: '0px 0px -6% 0px' }
  )
  Array.prototype.forEach.call(cards, function (c) {
    io.observe(c)
  })
})()
