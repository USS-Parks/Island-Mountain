/* Credo chain banner motion — dotted gradient arcs drawn in by scroll.
   A comet head (halo, colored core, hot spark) rides each arc's front as the
   user scrolls; dots bloom as it passes and settle into the printed path; the
   arrowhead lands as the head arrives. Scrolling up rewinds. Arcs sweep out
   to bookend the window frame, padded so nothing bleeds. Styles:
   css/credo-chain.css. Markup: index.html (#credoInner / #credoSvg). */
;(function () {
  'use strict'
  var K = {
    DOTS: 40, // dots per arc
    DOT_R: 3.6, // resting dot radius px
    BLOOM: 0.09, // bloom window behind the front, fraction of the arc
    HEAD_R: 6.5, // comet head core radius px
    FRAME_PAD: 44, // gap between an arc's apex and the window edge px
    ACTION: 0.72, // scrub action line, fraction of viewport height
    EDGE_IN: 8 // anchor inset into card edges px
  }
  var COLORS = [
    [70, 150, 250],
    [250, 150, 80],
    [120, 205, 95],
    [185, 130, 250]
  ]
  var NS = 'http://www.w3.org/2000/svg'
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  var inner = document.getElementById('credoInner')
  var svg = document.getElementById('credoSvg')
  if (!inner || !svg) return
  var cards = Array.prototype.slice.call(inner.querySelectorAll('.credo-card'))
  if (cards.length < 2) return
  var gaps = []

  function mix(c1, c2, t) {
    return (
      'rgb(' +
      Math.round(c1[0] + (c2[0] - c1[0]) * t) +
      ',' +
      Math.round(c1[1] + (c2[1] - c1[1]) * t) +
      ',' +
      Math.round(c1[2] + (c2[2] - c1[2]) * t) +
      ')'
    )
  }
  function bez(g, t) {
    var u = 1 - t,
      uu = u * u,
      tt = t * t
    var x = uu * u * g.A.x + 3 * uu * t * g.C1.x + 3 * u * tt * g.C2.x + tt * t * g.B.x
    var y = uu * u * g.A.y + 3 * uu * t * g.C1.y + 3 * u * tt * g.C2.y + tt * t * g.B.y
    var dx = 3 * uu * (g.C1.x - g.A.x) + 6 * u * t * (g.C2.x - g.C1.x) + 3 * tt * (g.B.x - g.C2.x)
    var dy = 3 * uu * (g.C1.y - g.A.y) + 6 * u * t * (g.C2.y - g.C1.y) + 3 * tt * (g.B.y - g.C2.y)
    return { x: x, y: y, ang: (Math.atan2(dy, dx) * 180) / Math.PI }
  }
  function el(name, attrs, parent) {
    var e = document.createElementNS(NS, name)
    for (var a in attrs) e.setAttribute(a, attrs[a])
    parent.appendChild(e)
    return e
  }

  function build() {
    if (inner.clientWidth < 320) {
      setTimeout(function () {
        build()
        update()
      }, 200)
      return
    }
    var ir = inner.getBoundingClientRect()
    var top = ir.top + window.scrollY
    var w = inner.clientWidth,
      h = inner.offsetHeight
    svg.setAttribute('viewBox', '0 0 ' + w + ' ' + h)
    svg.style.width = w + 'px'
    svg.style.height = h + 'px'
    while (svg.firstChild) svg.removeChild(svg.firstChild)
    gaps = []

    for (var k = 0; k < cards.length - 1; k++) {
      var ra = cards[k].getBoundingClientRect(),
        rb = cards[k + 1].getBoundingClientRect()
      var right = k % 2 === 0 // arcs bow right, left, right down the page
      var A = right
        ? { x: ra.right - ir.left - K.EDGE_IN, y: ra.top - ir.top + ra.height * 0.8 }
        : { x: ra.left - ir.left + K.EDGE_IN, y: ra.top - ir.top + ra.height * 0.8 }
      var B = right
        ? { x: rb.left - ir.left + rb.width * 0.78, y: rb.top - ir.top + 4 }
        : { x: rb.left - ir.left + rb.width * 0.22, y: rb.top - ir.top + 4 }
      var dy = B.y - A.y
      // Bookend sweep: the arc's apex kisses the page frame, padded so nothing bleeds
      var pad = Math.max(16, Math.min(K.FRAME_PAD, window.innerWidth * 0.035))
      var apexX = right ? window.innerWidth - ir.left - pad : pad - ir.left
      var cpX = (apexX - 0.125 * (A.x + B.x)) / 0.75
      var g = {
        A: A,
        B: B,
        right: right,
        C1: { x: cpX, y: A.y + dy * 0.25 },
        C2: { x: cpX, y: B.y - dy * 0.25 },
        yA: top + A.y,
        yB: top + B.y,
        dots: []
      }

      // The dotted arc itself, revealed dot by dot as the front advances
      for (var j = 0; j < K.DOTS; j++) {
        var t = (j + 0.5) / K.DOTS,
          s = bez(g, t)
        var dot = el(
          'circle',
          {
            cx: s.x.toFixed(1),
            cy: s.y.toFixed(1),
            r: K.DOT_R,
            fill: mix(COLORS[k], COLORS[k + 1], t),
            class: 'credo-dot'
          },
          svg
        )
        dot.style.opacity = 0
        g.dots.push({ n: dot, t: t })
      }
      // Arrowhead at the landing edge
      var e = bez(g, 1),
        rad = (e.ang * Math.PI) / 180
      var tipx = e.x + 12 * Math.cos(rad),
        tipy = e.y + 12 * Math.sin(rad)
      var lx = e.x - 7 * Math.sin(rad),
        ly = e.y + 7 * Math.cos(rad)
      var rx = e.x + 7 * Math.sin(rad),
        ry = e.y - 7 * Math.cos(rad)
      g.arrow = el(
        'polygon',
        {
          points:
            tipx.toFixed(1) +
            ',' +
            tipy.toFixed(1) +
            ' ' +
            lx.toFixed(1) +
            ',' +
            ly.toFixed(1) +
            ' ' +
            rx.toFixed(1) +
            ',' +
            ry.toFixed(1),
          fill: mix(COLORS[k + 1], COLORS[k + 1], 0),
          class: 'credo-arrow'
        },
        svg
      )
      g.arrow.style.opacity = 0

      // Comet head riding the arc front: soft halo, colored core, hot spark
      g.halo = el('circle', { r: 15, fill: '#fff' }, svg)
      g.halo.style.filter = 'blur(7px)'
      g.halo.style.opacity = 0
      g.head = el('circle', { r: K.HEAD_R, fill: '#fff' }, svg)
      g.head.style.opacity = 0
      g.spark = el('circle', { r: 2.8, fill: '#fff7ed' }, svg)
      g.spark.style.opacity = 0
      gaps.push(g)
    }
  }

  function progressFor(g) {
    var line = window.scrollY + window.innerHeight * K.ACTION
    var p = (line - g.yA) / (g.yB - g.yA)
    return p < 0 ? 0 : p > 1 ? 1 : p
  }

  function update() {
    for (var k = 0; k < gaps.length; k++) {
      var g = gaps[k],
        p = reduced ? 1 : progressFor(g)
      // Dots bloom as the front passes, then settle into the printed path
      for (var j = 0; j < g.dots.length; j++) {
        var n = g.dots[j].n,
          d = p - g.dots[j].t
        if (d <= 0) {
          n.style.opacity = 0
        } else if (d < K.BLOOM) {
          var b = Math.sin((Math.PI * d) / K.BLOOM)
          n.style.opacity = (0.55 + 0.45 * b).toFixed(3)
          n.setAttribute('r', (K.DOT_R * (1 + 0.8 * b)).toFixed(2))
        } else {
          n.style.opacity = 0.82
          n.setAttribute('r', K.DOT_R)
        }
      }
      // Comet head rides the front, its color blending origin into destination
      var hv = p <= 0 || p >= 1 ? 0 : Math.min(1, p * 10, (1 - p) * 10)
      var hs = bez(g, p),
        col = mix(COLORS[k], COLORS[k + 1], p)
      g.halo.setAttribute('cx', hs.x.toFixed(1))
      g.halo.setAttribute('cy', hs.y.toFixed(1))
      g.halo.setAttribute('fill', col)
      g.halo.style.opacity = (0.5 * hv).toFixed(3)
      g.head.setAttribute('cx', hs.x.toFixed(1))
      g.head.setAttribute('cy', hs.y.toFixed(1))
      g.head.setAttribute('fill', col)
      g.head.style.opacity = (0.95 * hv).toFixed(3)
      g.spark.setAttribute('cx', hs.x.toFixed(1))
      g.spark.setAttribute('cy', hs.y.toFixed(1))
      g.spark.style.opacity = hv.toFixed(3)
      g.arrow.style.opacity = p > 0.93 ? 1 : 0
    }
    // Cards ease in as the action line reaches them (scrubbed, reversible)
    for (var c = 1; c < cards.length; c++) {
      var r = cards[c].getBoundingClientRect()
      var pr = reduced
        ? 1
        : Math.min(1, Math.max(0, (window.innerHeight * K.ACTION - r.top + 40) / 240))
      cards[c].style.opacity = (0.22 + 0.78 * pr).toFixed(3)
      cards[c].style.transform = 'translateY(' + ((1 - pr) * 26).toFixed(1) + 'px)'
    }
  }

  var ticking = false
  function onScroll() {
    if (ticking) return
    ticking = true
    requestAnimationFrame(function () {
      update()
      ticking = false
    })
  }
  var rT
  function onResize() {
    clearTimeout(rT)
    rT = setTimeout(function () {
      build()
      update()
    }, 150)
  }

  build()
  update()
  window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', onResize)
  if (document.fonts && document.fonts.ready)
    document.fonts.ready.then(function () {
      build()
      update()
    })
  window.addEventListener('load', function () {
    build()
    update()
  })
})()
