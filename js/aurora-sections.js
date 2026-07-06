/* ============================================================
   Island Mountain - aurora scroll sections
   Loads after hero-cinematic.js.
   1) Sovereign Stack video plays only while on screen.
   2) The VERA mosaic is a PAGE-WIDE fixed background rendered on a
      single <canvas>: ultra-fine tesserae of the real 300dpi mosaic
      snow down and reconstruct the chip in fill order (left -> right,
      then up the right edge), keyed to total page scroll, so the whole
      chip stands assembled behind the footer at the very bottom.
      Canvas keeps it one compositing layer (phone-friendly).
   Respects prefers-reduced-motion.
   ============================================================ */
;(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches

  /* ---- 1. Sovereign Stack video: play in view, pause out of view ---- */
  var stackVid = document.querySelector('.au-stackvid')
  if (stackVid) {
    new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) {
            var pr = stackVid.play()
            if (pr && pr.catch) pr.catch(function () {})
          } else {
            stackVid.pause()
          }
        })
      },
      { threshold: 0.3 }
    ).observe(stackVid)
  }

  /* ---- 2. Page-wide VERA mosaic reconstruction on one canvas ---- */
  var canvas = document.getElementById('au-mosaic-canvas')
  if (!canvas || !canvas.getContext) return
  var ctx = canvas.getContext('2d')
  var IMG = 'images/gpu_mosaic_tapestry_300dpi.png'
  var COLS = 10,
    ROWS = 15 // ~150 ultra-fine tesserae
  function ease(t) {
    return t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t)
  }
  function easeOut(t) {
    return t < 0 ? 0 : t > 1 ? 1 : 1 - (1 - t) * (1 - t)
  }
  function rnd(i) {
    var x = Math.sin(i * 127.1 + 31.7) * 43758.5
    return x - Math.floor(x)
  }

  var img = new Image(),
    ready = false,
    tiles = [],
    cssW = 0,
    cssH = 0

  function layout() {
    cssW = window.innerWidth
    cssH = window.innerHeight
    var dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = Math.round(cssW * dpr)
    canvas.height = Math.round(cssH * dpr)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    if (!ready) return
    var iw = img.naturalWidth,
      ih = img.naturalHeight // real mosaic (2:3)
    var boxH = Math.min(cssH * 0.94, cssW * 0.96 * (ih / iw)),
      boxW = boxH * (iw / ih)
    if (boxW > cssW * 0.96) {
      boxW = cssW * 0.96
      boxH = boxW * (ih / iw)
    }
    var x0 = (cssW - boxW) / 2,
      y0 = cssH - boxH - cssH * 0.03 // bottom-anchored
    var tw = boxW / COLS,
      th = boxH / ROWS,
      sw = iw / COLS,
      sh = ih / ROWS
    tiles = []
    for (var r = 0; r < ROWS; r++)
      for (var c = 0; c < COLS; c++) {
        var nx = c / (COLS - 1),
          ny = r / (ROWS - 1)
        tiles.push({
          sx: c * sw,
          sy: r * sh,
          sw: sw,
          sh: sh,
          tx: x0 + c * tw,
          ty: y0 + r * th,
          tw: tw,
          th: th,
          ord: nx * 0.9 + (1 - ny) * 0.1 * nx, // left->right, right edge fills up
          fall: 38 + rnd(r * COLS + c) * 66
        })
      }
    var mn = 1,
      mx = 0
    tiles.forEach(function (t) {
      if (t.ord < mn) mn = t.ord
      if (t.ord > mx) mx = t.ord
    })
    tiles.forEach(function (t) {
      t.t0 = ((t.ord - mn) / (mx - mn || 1)) * 0.9
      t.dur = 0.1
    })
  }

  function render(p) {
    if (!ready) return
    ctx.clearRect(0, 0, cssW, cssH)
    for (var k = 0; k < tiles.length; k++) {
      var t = tiles[k]
      var lp = ease((p - t.t0) / t.dur)
      if (lp <= 0) continue
      var y = t.ty - t.fall * (1 - easeOut(lp))
      ctx.globalAlpha = Math.min(1, lp * 2.5)
      ctx.drawImage(img, t.sx, t.sy, t.sw, t.sh, t.tx, y, t.tw + 0.6, t.th + 0.6) // +0.6 hides seams
    }
    ctx.globalAlpha = 1
  }

  function progress() {
    var max =
      (document.documentElement.scrollHeight || document.body.scrollHeight) - window.innerHeight
    var p = max > 0 ? (window.scrollY || window.pageYOffset) / max : 0
    return p < 0 ? 0 : p > 1 ? 1 : p
  }

  var curP = 0,
    ticking = false
  function tick() {
    ticking = false
    render(curP)
  }
  function onScroll() {
    curP = progress()
    if (!ticking) {
      ticking = true
      requestAnimationFrame(tick)
    }
  }

  img.onload = function () {
    ready = true
    layout()
    curP = progress()
    render(reduce ? 1 : curP)
  }
  img.src = IMG

  layout()
  if (!reduce) window.addEventListener('scroll', onScroll, { passive: true })
  window.addEventListener('resize', function () {
    layout()
    curP = progress()
    render(reduce ? 1 : curP)
  })
})()
