/* Island Mountain - Aurora comet-node sequencer (one source of truth).
   Arms each .beam-card once, as it first scrolls into view; the CSS then
   loops the comet perpetually along the top + right border. A rolling --i
   staggers the cascade so cards fire in sequence rather than in lockstep.
   --corner / --brc give each card's top-right and bottom-right corner
   positions along its border path, so the top runs fast and the right
   runs slow whatever the card's aspect ratio. */
;(function () {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
  var cards = document.querySelectorAll('.beam-card')
  if (!cards.length) return

  // Position (as a % of the border path, clockwise from top-left) of the
  // top-right and bottom-right corners, matching offset-path:border-box.
  function setCorners(card) {
    var w = card.offsetWidth,
      h = card.offsetHeight
    if (!w || !h) return
    var r = parseFloat(getComputedStyle(card).borderTopRightRadius) || 0
    r = Math.min(r, w / 2, h / 2)
    var arc = (Math.PI * r) / 2
    var top = Math.max(0, w - 2 * r),
      right = Math.max(0, h - 2 * r)
    var L = 2 * top + 2 * right + 4 * arc
    if (L <= 0) return
    card.style.setProperty('--corner', (((top + arc / 2) / L) * 100).toFixed(2) + '%')
    card.style.setProperty('--brc', (((top + arc + right + arc / 2) / L) * 100).toFixed(2) + '%')
  }

  if (!('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(cards, function (c) {
      setCorners(c)
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
          setCorners(en.target)
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

  var t
  window.addEventListener('resize', function () {
    clearTimeout(t)
    t = setTimeout(function () {
      Array.prototype.forEach.call(document.querySelectorAll('.beam-card.node-live'), setCorners)
    }, 200)
  })
})()
