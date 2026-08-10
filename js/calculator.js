/* ============================================================
   Island Mountain — AI Cost Comparison Calculator (inline widget)
   Drop <div class="im-calc" data-im-calc-preset="law"></div> into a page,
   include css/calculator.css once and this script once (defer). The widget
   builds itself, always-expanded and inline. No dependencies.

   Economic constants calibrated 2026-08-10; sources are noted per-line and
   in _work/calculator/CALIBRATION.md. Nothing rendered is an Island Mountain
   price: cloud costs derive from the visitor's own workload at real frontier
   API rates; owned costs are representative market hardware ranges. The scoped
   IM number is never shown; it travels only by email through /api/worksheet.
   ============================================================ */
;(function () {
  'use strict'

  var isLocal = /^(localhost|127\.0\.0\.1)$/.test(location.hostname)
  var API = isLocal
    ? 'http://localhost:8787'
    : 'https://island-mountain-funnel.basho-parks.workers.dev'

  // --- Calibrated model (see CALIBRATION.md) --------------------------------
  var DEPTH = {
    name: ['Lookup / classify', 'Draft / summarize', 'Analyze / reason', 'Agentic multi-step'],
    tpr: [500, 1800, 4500, 13000], // tokens per request (in+out), representative
    price: [7.3, 11.25, 17.5, 23.75], // $/1M blended frontier (llm-token-rates.webp, $5/$30 anchor)
    tokPerSecGpu: [2500, 1400, 650, 280], // throughput per accelerator (smaller model = faster)
    gpuLo: [8000, 20000, 28000, 38000], // bare GPU street $ (Aug 2026): L40S->H100->H200->B200 class
    gpuHi: [12000, 32000, 40000, 62000]
  }
  var CTX = { name: ['Short', 'Standard', 'Long-doc / RAG'], mult: [0.6, 1.0, 2.5] }

  // Per-vertical defaults (conc, vol slider pos 0-100, depth 0-3, ctx 0-2, growth %).
  // First-pass shapes for owner review.
  var PRESETS = {
    finance: { conc: 40, vol: 49, depth: 2, ctx: 1, growth: 20 },
    law: { conc: 15, vol: 37, depth: 2, ctx: 2, growth: 15 },
    health: { conc: 120, vol: 77, depth: 1, ctx: 1, growth: 25 },
    insurance: { conc: 50, vol: 55, depth: 2, ctx: 2, growth: 18 },
    casino: { conc: 30, vol: 60, depth: 1, ctx: 1, growth: 15 },
    government: { conc: 80, vol: 60, depth: 2, ctx: 2, growth: 12 },
    energy: { conc: 25, vol: 45, depth: 2, ctx: 1, growth: 15 },
    defense: { conc: 35, vol: 40, depth: 3, ctx: 2, growth: 20 },
    education: { conc: 150, vol: 70, depth: 1, ctx: 1, growth: 20 },
    tribal: { conc: 20, vol: 35, depth: 2, ctx: 1, growth: 15 },
    research: { conc: 20, vol: 40, depth: 3, ctx: 2, growth: 25 },
    custom: null
  }
  var LABEL = {
    finance: 'Regional bank',
    law: 'Law firm',
    health: 'Health system',
    insurance: 'Insurer',
    casino: 'Casino floor',
    government: 'Government agency',
    energy: 'Utility',
    defense: 'Defense program',
    education: 'University',
    tribal: 'Tribal government',
    research: 'Research lab',
    custom: 'Custom'
  }

  var CAPTION =
    'Representative market hardware costs, shown to illustrate ownership economics. ' +
    'Not an Island Mountain quote, specification, or recommendation. Rented figures come from your ' +
    'workload settings (or your own override). Your build is right-sized after Discovery, and the ' +
    'scoped number travels by email, never on this page.'

  var SUB1 =
    'Set the temperature of your actual work: how many people, how much volume, how hard the ' +
    'thinking. See what owning your own inference costs over five years, and the month it pays for ' +
    'itself. Every number here is market data or your own; none is an Island Mountain price.'
  var SUB2 =
    'Both put AI on your premises. Only one is sized to the work you actually do, and hands ' +
    'you a stack you own outright, with no seat meter and no locked model list.'

  // --- helpers --------------------------------------------------------------
  function fmtUSD(n) {
    n = Math.round(n)
    if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(n >= 1e7 ? 1 : 2) + 'M'
    if (Math.abs(n) >= 1e4) return '$' + Math.round(n / 1e3) + 'k'
    return '$' + n.toLocaleString('en-US')
  }
  function fullUSD(n) {
    return '$' + Math.round(n).toLocaleString('en-US')
  }
  function fmtInt(n) {
    return Math.round(n).toLocaleString('en-US')
  }
  function volFromPos(pos) {
    return Math.round(200 * Math.pow(1000, pos / 100))
  } // 200..200,000

  // First-touch attribution written by js/chat-widget (localStorage im_attr).
  function imAttr() {
    var a = null
    try {
      a = JSON.parse(localStorage.getItem('im_attr'))
    } catch (e) {}
    if (!a || !a.ts || Date.now() - a.ts > 7776000000) a = {}
    return {
      utm_source: a.utm_source || '',
      utm_medium: a.utm_medium || '',
      utm_campaign: a.utm_campaign || '',
      utm_content: a.utm_content || '',
      landing_page: a.landing_page || location.pathname,
      referrer: a.referrer || document.referrer || ''
    }
  }

  function template() {
    return (
      '' +
      '<div class="imc-aurora"><b class="imc-a1"></b><b class="imc-a2"></b></div>' +
      '<div class="imc-card">' +
      '<p class="imc-eyebrow">Interactive · dial in your workload</p>' +
      '<h2 class="imc-title">Owned vs. Rented AI</h2>' +
      '<p class="imc-sub"></p>' +
      '<div class="imc-steps">' +
      '<button type="button" class="imc-s1 imc-on"><span class="imc-k">Step 1</span>Owned vs. Rented AI</button>' +
      '<button type="button" class="imc-s2"><span class="imc-k">Step 2</span>Embedded vs. the Appliance</button>' +
      '</div>' +
      '<section class="imc-step1">' +
      '<div class="imc-presetline"><span class="imc-presetlabel"></span><button type="button" class="imc-reset imc-hidden">reset</button></div>' +
      '<div class="imc-temps">' +
      tempBlock(
        'conc',
        'Peak concurrency',
        'range',
        'a handful',
        'the whole busy floor',
        '',
        1,
        500,
        40
      ) +
      tempBlock(
        'vol',
        'Daily inquiries',
        'range',
        'hundreds',
        'hundreds of thousands',
        '',
        0,
        100,
        49
      ) +
      tempBlock(
        'depth',
        'Reasoning depth',
        'steps4',
        'Lookup',
        'Draft',
        'Analyze',
        0,
        3,
        2,
        'Agentic'
      ) +
      tempBlock('ctx', 'Context size', 'steps3', 'Short', 'Standard', 'Long-doc / RAG', 0, 2, 1) +
      '</div>' +
      '<div class="imc-derived"><span class="imc-dk">This workload implies:</span>' +
      '<span><span class="imc-dv imc-copper imc-dspend"></span> <span class="imc-dk">/mo rented</span></span>' +
      '<span class="imc-dk">·</span>' +
      '<span><span class="imc-dv imc-dgpu"></span> <span class="imc-dk">accelerators to own</span></span></div>' +
      '<details class="imc-adv"><summary>Assumptions &amp; overrides</summary><div class="imc-inner">' +
      '<div class="imc-field"><label>Know your cloud bill? Override /mo</label>' +
      '<div class="imc-wrap"><span class="imc-pre">$</span><input class="imc-num imc-spend" type="number" inputmode="numeric" min="0" step="500" placeholder="derived"></div></div>' +
      '<div class="imc-field"><label>Usage growth / yr</label>' +
      '<div class="imc-wrap"><input class="imc-num imc-growth" type="number" inputmode="numeric" min="0" max="60" value="20"><span class="imc-post">%</span></div></div>' +
      '</div></details>' +
      '<div class="imc-cols">' +
      '<div class="imc-col imc-rented"><div class="imc-tag">Rented · cloud</div>' +
      '<div class="imc-head">Metered forever. Nothing owned at the end.</div>' +
      '<div class="imc-big imc-num imc-r5">$0</div><div class="imc-big"><small>over 5 years</small></div>' +
      '<div class="imc-rows imc-rrows"></div></div>' +
      '<div class="imc-col imc-owned"><div class="imc-tag">Owned · on-prem</div>' +
      '<div class="imc-head">Capital once, then near-flat. You own the asset.</div>' +
      '<div class="imc-big imc-num imc-o5">$0</div><div class="imc-big"><small>over 5 years (representative)</small></div>' +
      '<div class="imc-rows imc-orows"></div></div>' +
      '</div>' +
      '<div class="imc-hero"><span class="imc-lead"></span><span class="imc-stat imc-num imc-herostat">—</span><span class="imc-delta imc-num imc-herodelta"></span></div>' +
      '<div class="imc-chartwrap"><div class="imc-clab"><span>Cumulative cost</span><span>5 years →</span></div>' +
      '<svg class="imc-chart" viewBox="0 0 640 240" preserveAspectRatio="none" aria-label="Cumulative cost over five years"></svg>' +
      '<div class="imc-legend"><span><b style="border-color:var(--imc-slate-line)"></b>Rented (cloud)</span>' +
      '<span><b style="border-color:var(--imc-copper-line)"></b>Owned (on-prem)</span></div></div>' +
      '<div class="imc-note"></div>' +
      '<p class="imc-caption">' +
      CAPTION +
      '</p>' +
      '<div class="imc-cta"><a class="imc-btn" href="contact.html#claim-slot">Book a scoping call →</a>' +
      '<div class="imc-emailrow"><input class="imc-email" type="email" placeholder="you@organization.com" aria-label="Email">' +
      '<button type="button" class="imc-send">Email me the full breakdown</button></div>' +
      '<div class="imc-micro">Optional. We send the scoped comparison. One email, no list.</div></div>' +
      '</section>' +
      '<section class="imc-step2 imc-hidden">' +
      step2() +
      '</section>' +
      '</div>'
    )
  }

  function tempBlock(cls, label, kind, t1, t2, t3, min, max, val, t4) {
    var ticks
    if (kind === 'steps4')
      ticks =
        '<span>' +
        t1 +
        '</span><span>' +
        t2 +
        '</span><span>' +
        t3 +
        '</span><span>' +
        t4 +
        '</span>'
    else if (kind === 'steps3')
      ticks = '<span>' + t1 + '</span><span>' + t2 + '</span><span>' + t3 + '</span>'
    else ticks = '<span>' + t1 + '</span><span>' + t2 + '</span>'
    var step = kind === 'steps4' || kind === 'steps3' ? 1 : 1
    return (
      '<div class="imc-temp"><div class="imc-lab"><span>' +
      label +
      '</span><span class="imc-val imc-v' +
      cls +
      '"></span></div>' +
      '<input class="imc-' +
      cls +
      '" type="range" min="' +
      min +
      '" max="' +
      max +
      '" step="' +
      step +
      '" value="' +
      val +
      '" aria-label="' +
      label +
      '">' +
      '<div class="imc-ticks">' +
      ticks +
      '</div></div>'
    )
  }

  function step2() {
    var rows = [
      [
        'Sizing',
        'A fixed box. You buy its whole spec whether your work needs it or not.',
        'Right-sized to your actual workflows, scoped in on-site Discovery.'
      ],
      ['Hardware', 'Their appliance only.', 'Any hardware, including boxes you already own.'],
      ['Models', 'Their catalog.', 'Any open-weight model, swapped as the frontier moves.'],
      ['Cost shape', 'Per-seat recurring subscription.', 'Owned outright. No per-seat, no meter.'],
      ['Lock-in', 'Locked to the vendor box and model list.', 'No lock. You own the whole stack.'],
      ['Discovery', 'Yours to figure out.', 'We embed on-site and run it with your senior people.']
    ]
    var body = rows
      .map(function (r) {
        return (
          '<tr><td class="imc-dim">' +
          r[0] +
          '</td><td class="imc-appl">' +
          r[1] +
          '</td><td class="imc-imc">' +
          r[2] +
          '</td></tr>'
        )
      })
      .join('')
    return (
      '<table class="imc-matrix"><thead><tr><th class="imc-dim">&nbsp;</th>' +
      '<th class="imc-appl">The appliance model</th><th class="imc-imc">Island Mountain · embedded</th></tr></thead>' +
      '<tbody>' +
      body +
      '</tbody></table>' +
      '<div class="imc-waste">A fixed 8-GPU appliance bills you for <b>eight GPUs</b> whether your workflows need two ' +
      'or twelve, and re-bills every seat, every year. Embedded engineering sizes the iron to the work, once, and ' +
      'hands you the keys. <span style="color:var(--imc-dim)">The appliance per-seat subscription is a published ' +
      'competitor figure; Island Mountain’s number is scoped privately.</span></div>' +
      '<div class="imc-cta"><button type="button" class="imc-back imc-btn">← Back to the cost model</button>' +
      '<a class="imc-btn" href="contact.html#claim-slot">Book a scoping call →</a></div>'
    )
  }

  function build(root) {
    if (root.getAttribute('data-imc-ready')) return
    root.setAttribute('data-imc-ready', '1')
    var preset = root.getAttribute('data-im-calc-preset') || 'custom'
    if (!(preset in PRESETS)) preset = 'custom'
    root.innerHTML = template()

    var q = function (c) {
      return root.querySelector('.imc-' + c)
    }
    var el = {
      sub: q('sub'),
      presetlabel: q('presetlabel'),
      reset: q('reset'),
      conc: q('conc'),
      vol: q('vol'),
      depth: q('depth'),
      ctx: q('ctx'),
      spend: q('spend'),
      growth: q('growth'),
      vconc: q('vconc'),
      vvol: q('vvol'),
      vdepth: q('vdepth'),
      vctx: q('vctx'),
      dspend: q('dspend'),
      dgpu: q('dgpu'),
      r5: q('r5'),
      o5: q('o5'),
      rrows: q('rrows'),
      orows: q('orows'),
      herolead: root.querySelector('.imc-hero .imc-lead'),
      herostat: q('herostat'),
      herodelta: q('herodelta'),
      chart: q('chart'),
      note: q('note'),
      title: q('title'),
      email: q('email'),
      send: q('send'),
      micro: q('micro'),
      step1: q('step1'),
      step2: q('step2'),
      s1: q('s1'),
      s2: q('s2'),
      back: q('back')
    }

    function applyPreset(name) {
      var p = PRESETS[name]
      root.setAttribute('data-im-calc-active', name)
      el.presetlabel.textContent = LABEL[name] + ' workload'
      el.reset.classList.add('imc-hidden')
      if (p) {
        el.conc.value = p.conc
        el.vol.value = p.vol
        el.depth.value = p.depth
        el.ctx.value = p.ctx
        el.growth.value = p.growth
        el.spend.value = ''
      }
      render()
    }
    function markCustom() {
      var base = root.getAttribute('data-im-calc-active') || 'custom'
      if (base !== 'custom') {
        el.presetlabel.textContent = 'Custom workload'
        el.reset.classList.remove('imc-hidden')
      }
    }

    function readInputs() {
      var clampN = function (v, lo, hi, d) {
        v = parseFloat(v)
        return isFinite(v) ? Math.min(hi, Math.max(lo, v)) : d
      }
      var ov = parseFloat(el.spend.value)
      return {
        conc: clampN(el.conc.value, 1, 500, 40),
        volPos: clampN(el.vol.value, 0, 100, 49),
        vol: volFromPos(clampN(el.vol.value, 0, 100, 49)),
        depth: parseInt(el.depth.value, 10) || 0,
        ctx: parseInt(el.ctx.value, 10) || 0,
        growth: clampN(el.growth.value, 0, 60, 20) / 100,
        override: isFinite(ov) && ov > 0 ? ov : null
      }
    }

    function compute(s) {
      var tpr = DEPTH.tpr[s.depth] * CTX.mult[s.ctx]
      var reqMo = s.vol * 30
      var derivedSpend = ((reqMo * tpr) / 1e6) * DEPTH.price[s.depth]
      var spend = s.override != null ? s.override : derivedSpend
      var gpus = Math.max(1, Math.ceil((s.conc * 30) / DEPTH.tokPerSecGpu[s.depth]))
      var capLo = 15000 + gpus * DEPTH.gpuLo[s.depth],
        capHi = 28000 + gpus * DEPTH.gpuHi[s.depth]
      var capMid = (capLo + capHi) / 2
      var opexYr = gpus * 3500 + capMid * 0.06
      var months = 60,
        cloudCum = [],
        ownCum = [],
        cloud5 = 0,
        be = null
      for (var m = 1; m <= months; m++) {
        cloud5 += spend * Math.pow(1 + s.growth, Math.floor((m - 1) / 12))
        cloudCum.push(cloud5)
        var own = capMid + (opexYr / 12) * m
        ownCum.push(own)
        if (be === null && cloud5 >= own) be = m
      }
      return {
        tpr: tpr,
        reqMo: reqMo,
        spend: spend,
        gpus: gpus,
        capLo: capLo,
        capHi: capHi,
        opexYr: opexYr,
        cloudCum: cloudCum,
        ownCum: ownCum,
        cloud5: cloud5,
        own5: capMid + opexYr * 5,
        breakeven: be,
        months: months
      }
    }

    function setFill(node, frac) {
      node.style.setProperty('--imc-fill', (Math.max(0, Math.min(1, frac)) * 100).toFixed(1) + '%')
    }
    function rowHtml(k, v, muted) {
      return (
        '<div class="' +
        (muted ? 'imc-m' : '') +
        '"><span>' +
        k +
        '</span><span>' +
        v +
        '</span></div>'
      )
    }

    function render() {
      var s = readInputs(),
        r = compute(s)
      el.vconc.textContent = s.conc + ' users'
      el.vvol.textContent = fmtInt(s.vol) + ' / day'
      el.vdepth.textContent = DEPTH.name[s.depth]
      el.vctx.textContent = CTX.name[s.ctx]
      setFill(el.conc, (s.conc - 1) / 499)
      setFill(el.vol, s.volPos / 100)
      setFill(el.depth, s.depth / 3)
      setFill(el.ctx, s.ctx / 2)

      el.dspend.textContent = fmtUSD(r.spend) + (s.override != null ? ' (yours)' : '')
      el.dgpu.textContent = r.gpus
      el.r5.textContent = fmtUSD(r.cloud5)
      el.o5.textContent = fmtUSD(r.capLo) + '–' + fmtUSD(r.capHi)

      el.rrows.innerHTML =
        rowHtml('Tokens / request', '~' + fmtInt(r.tpr)) +
        rowHtml('Requests / month', fmtInt(r.reqMo)) +
        rowHtml('Today, per month', fullUSD(r.spend)) +
        rowHtml('Asset you own after', 'nothing', true)
      el.orows.innerHTML =
        rowHtml('Accelerators to own', String(r.gpus)) +
        rowHtml('Hardware (representative)', fmtUSD(r.capLo) + '–' + fmtUSD(r.capHi)) +
        rowHtml('Run cost / yr (power+ops)', fullUSD(r.opexYr)) +
        rowHtml('Asset you own after', 'the whole stack', true)

      var delta = r.cloud5 - r.own5
      if (r.breakeven) {
        el.herolead.textContent = 'You own it outright in'
        el.herostat.textContent = 'month ' + r.breakeven
        el.herodelta.textContent = delta >= 0 ? 'then ~' + fmtUSD(delta) + ' ahead by year 5' : ''
        el.herodelta.className = 'imc-delta imc-num imc-herodelta'
      } else {
        el.herolead.textContent = 'Break-even'
        el.herostat.textContent = 'beyond 5 yrs'
        el.herodelta.textContent = 'at this volume, renting stays cheaper'
        el.herodelta.className = 'imc-delta imc-num imc-herodelta imc-neg'
      }

      if (!r.breakeven || r.breakeven > 48) {
        el.note.className = 'imc-note imc-keeprent'
        el.note.innerHTML =
          '<strong>Honest read: at this workload, keep renting.</strong> The volume and depth here do not yet justify owning the iron. Cloud wins until usage grows or the reasoning gets heavier. We tell you that in Discovery too; we do not sell hardware you do not need.'
      } else {
        el.note.className = 'imc-note'
        el.note.innerHTML =
          '<strong>Owning pays back in month ' +
          r.breakeven +
          '.</strong> After that you run a paid-off asset while the rented line keeps climbing with usage, and your data never left the building.'
      }
      drawChart(r)
    }

    function drawChart(r) {
      var W = 640,
        H = 240,
        padL = 8,
        padR = 8,
        padT = 14,
        padB = 18
      var max = Math.max(r.cloudCum[r.months - 1], r.ownCum[r.months - 1]) * 1.04
      var x = function (m) {
        return padL + (m / (r.months - 1)) * (W - padL - padR)
      }
      var y = function (v) {
        return H - padB - (v / max) * (H - padT - padB)
      }
      var line = function (a) {
        var d = ''
        for (var i = 0; i < a.length; i++) {
          d += (i ? 'L' : 'M') + x(i).toFixed(1) + ' ' + y(a[i]).toFixed(1) + ' '
        }
        return d
      }
      var area = function (a) {
        return (
          line(a) +
          'L' +
          x(a.length - 1).toFixed(1) +
          ' ' +
          (H - padB) +
          ' L' +
          padL +
          ' ' +
          (H - padB) +
          ' Z'
        )
      }
      var svg = ''
      for (var g = 1; g <= 3; g++) {
        var gy = padT + g * ((H - padT - padB) / 4)
        svg +=
          "<line x1='" +
          padL +
          "' y1='" +
          gy.toFixed(1) +
          "' x2='" +
          (W - padR) +
          "' y2='" +
          gy.toFixed(1) +
          "' stroke='rgba(255,255,255,.06)' stroke-width='1'/>"
      }
      svg += "<path d='" + area(r.ownCum) + "' fill='rgba(245,158,11,.10)' stroke='none'/>"
      svg +=
        "<path d='" +
        line(r.cloudCum) +
        "' fill='none' stroke='var(--imc-slate-line)' stroke-width='2.4' stroke-linejoin='round'/>"
      svg +=
        "<path d='" +
        line(r.ownCum) +
        "' fill='none' stroke='var(--imc-copper-line)' stroke-width='2.6' stroke-linejoin='round'/>"
      if (r.breakeven) {
        var bx = x(r.breakeven - 1),
          by = y(r.cloudCum[r.breakeven - 1])
        svg +=
          "<line x1='" +
          bx.toFixed(1) +
          "' y1='" +
          padT +
          "' x2='" +
          bx.toFixed(1) +
          "' y2='" +
          (H - padB) +
          "' stroke='rgba(245,158,11,.55)' stroke-width='1.4' stroke-dasharray='5 4'/>"
        svg +=
          "<circle cx='" +
          bx.toFixed(1) +
          "' cy='" +
          by.toFixed(1) +
          "' r='5' fill='#0f172a' stroke='var(--imc-copper)' stroke-width='2.2'/>"
        svg +=
          "<text x='" +
          Math.min(bx + 8, W - 92).toFixed(1) +
          "' y='" +
          (padT + 13) +
          "' fill='#fde9c8' font-size='12' font-family='var(--imc-mono)'>break-even m" +
          r.breakeven +
          '</text>'
      }
      el.chart.innerHTML = svg
    }

    function goStep(n) {
      el.step1.classList.toggle('imc-hidden', n !== 1)
      el.step2.classList.toggle('imc-hidden', n !== 2)
      el.s1.classList.toggle('imc-on', n === 1)
      el.s2.classList.toggle('imc-on', n === 2)
      el.title.textContent =
        n === 1 ? 'Owned vs. Rented AI' : 'Embedded engineering vs. the Appliance'
      el.sub.textContent = n === 1 ? SUB1 : SUB2
    }

    function sendBreakdown() {
      var e = (el.email.value || '').trim()
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) {
        el.micro.textContent = 'Enter a valid email and we will send the scoped comparison.'
        el.micro.style.color = 'var(--imc-pain)'
        return
      }
      var s = readInputs(),
        r = compute(s)
      el.send.disabled = true
      el.micro.style.color = 'var(--imc-muted)'
      el.micro.textContent = 'Sending your comparison...'
      var body = Object.assign(
        {
          email: e,
          industry: LABEL[root.getAttribute('data-im-calc-active') || preset] || '',
          seats: s.conc,
          monthly_spend: Math.round(r.spend),
          growth_pct: Math.round(s.growth * 100)
        },
        imAttr()
      )
      fetch(API + '/api/worksheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })
        .then(function (res) {
          if (!res.ok) throw new Error('http ' + res.status)
          el.micro.textContent = 'On its way. Check your inbox for the scoped comparison.'
          el.micro.style.color = 'var(--imc-win)'
        })
        .catch(function () {
          el.send.disabled = false
          el.micro.textContent =
            'Something went wrong. Reach us at basho@islandmountain.io and we will send it.'
          el.micro.style.color = 'var(--imc-pain)'
        })
    }

    // wire
    el.sub.textContent = SUB1
    ;['conc', 'vol', 'depth', 'ctx'].forEach(function (id) {
      el[id].addEventListener('input', function () {
        markCustom()
        render()
      })
    })
    ;['spend', 'growth'].forEach(function (id) {
      el[id].addEventListener('input', function () {
        markCustom()
        render()
      })
    })
    el.reset.addEventListener('click', function () {
      applyPreset(root.getAttribute('data-im-calc-active') || 'custom')
    })
    el.s1.addEventListener('click', function () {
      goStep(1)
    })
    el.s2.addEventListener('click', function () {
      goStep(2)
    })
    el.back.addEventListener('click', function () {
      goStep(1)
    })
    el.send.addEventListener('click', sendBreakdown)

    applyPreset(preset)
  }

  function initAll() {
    var nodes = document.querySelectorAll('.im-calc')
    for (var i = 0; i < nodes.length; i++) build(nodes[i])
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', initAll)
  else initAll()
})()
