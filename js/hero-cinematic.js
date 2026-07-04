/* ============================================================
   Island Mountain - Aurora cinematic controller
   ============================================================ */
;(function () {
  'use strict'
  var html = document.documentElement
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches

  function revealHero() {
    var h = document.querySelector('.au-hero')
    if (!h) return
    h.classList.add('in')
    h.querySelectorAll('.au-h1, .au-stagger, .au-reveal').forEach(function (el) {
      el.classList.add('in')
    })
  }

  // ---- Intro reveal ----
  var intro = document.getElementById('aurora-intro')
  var seen = false
  try {
    seen = sessionStorage.getItem('au-intro') === '1'
  } catch (e) {}

  function endIntro() {
    if (html.classList.contains('intro-done')) return
    html.classList.add('intro-done')
    try {
      sessionStorage.setItem('au-intro', '1')
    } catch (e) {}
    revealHero()
    setTimeout(function () {
      if (intro) intro.style.display = 'none'
    }, 900)
  }

  if (!intro || reduce || seen) {
    if (intro) intro.style.display = 'none'
    html.classList.add('intro-done')
    revealHero()
  } else {
    var vid = intro.querySelector('video')
    var skip = intro.querySelector('.au-skip')
    if (skip) skip.addEventListener('click', endIntro)
    if (vid) {
      var p = vid.play && vid.play()
      if (p && p.catch) p.catch(function () {})
      vid.addEventListener('ended', endIntro)
    }
    setTimeout(endIntro, 11000)
  }

  // Failsafe: guarantee hero + sections reveal even if rAF/intro/IO never fire
  setTimeout(revealHero, 1000)
  setTimeout(function () {
    document.querySelectorAll('.au-reveal, .au-stagger').forEach(function (el) {
      el.classList.add('in')
    })
  }, 3000)

  // ---- Per-WORD, per-letter split ----
  function split(el) {
    var text = el.textContent
    el.setAttribute('aria-label', text)
    el.textContent = ''
    var ci = 0
    text.split(/(\s+)/).forEach(function (chunk) {
      if (chunk === '') return
      if (/^\s+$/.test(chunk)) {
        el.appendChild(document.createTextNode(' '))
        return
      }
      var w = document.createElement('span')
      w.className = 'au-word'
      w.setAttribute('aria-hidden', 'true')
      chunk.split('').forEach(function (ch) {
        var s = document.createElement('span')
        s.className = 'char'
        s.style.setProperty('--c', ci++)
        s.textContent = ch
        w.appendChild(s)
      })
      el.appendChild(w)
    })
  }
  if (!reduce) {
    document.querySelectorAll('.au-h1[data-split]').forEach(split)
  }

  // ---- Rotating phrase ----
  var rot = document.querySelector('.au-rotator')
  if (rot) {
    var words = rot.querySelectorAll('span')
    if (words.length) {
      words[0].classList.add('on')
      if (!reduce && words.length > 1) {
        var idx = 0
        setInterval(function () {
          words[idx].classList.remove('on')
          idx = (idx + 1) % words.length
          words[idx].classList.add('on')
        }, 2400)
      }
    }
  }

  // ---- Typewriter (one char at a time, on first scroll into view) ----
  function typewrite(el) {
    if (el.dataset.twStarted) return
    el.dataset.twStarted = '1'
    var full = el.getAttribute('data-typewriter')
    el.setAttribute('aria-label', full)
    if (reduce) {
      el.textContent = full
      return
    }
    el.textContent = ''
    el.classList.add('au-tw')
    var i = 0
    ;(function step() {
      el.textContent = full.slice(0, i)
      if (i++ < full.length) setTimeout(step, 36)
    })()
  }

  // ---- Below-the-fold reveal + typewriter triggers ----
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (e) {
          if (!e.isIntersecting) return
          if (e.target.hasAttribute('data-typewriter')) typewrite(e.target)
          else e.target.classList.add('in')
          io.unobserve(e.target)
        })
      },
      { threshold: 0.2, rootMargin: '0px 0px -6% 0px' }
    )
    document.querySelectorAll('.au-stagger, .au-reveal, [data-typewriter]').forEach(function (el) {
      if (!el.closest('.au-hero')) io.observe(el)
    })
  } else {
    document.querySelectorAll('.au-stagger, .au-reveal').forEach(function (el) {
      el.classList.add('in')
    })
  }
})()
