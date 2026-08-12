import { esc } from '../integrations/resend'
import type { GeoSnapshot } from './store'

/**
 * Lookout dashboard — pure aggregation + a self-contained, theme-aware HTML
 * render (inline SVG, no libraries). Colors follow the validated dataviz
 * categorical palette (Claude=blue, OpenAI=orange, Gemini=aqua, Perplexity=
 * yellow), fixed by engine; the legend + endpoint labels + the per-prompt table
 * carry identity so the light-surface contrast relief rule is satisfied.
 */

const ENGINE_META: { id: string; label: string }[] = [
  { id: 'claude', label: 'Claude' },
  { id: 'openai', label: 'OpenAI' },
  { id: 'gemini', label: 'Gemini' },
  { id: 'perplexity', label: 'Perplexity' }
]

// --- Aggregation (pure) -----------------------------------------------------

export interface EngineStat {
  engine: string
  sov: number
  cells: number
  mentions: number
  cites: number
}
export interface PromptRow {
  prompt_id: string
  prompt_text: string
  cells: Record<string, { mentioned: boolean; cited: boolean; position: number | null }>
}
export interface RunAgg {
  run_date: string
  sov: number
  mentionRate: number
  citeRate: number
  cells: number
  byEngine: EngineStat[]
  prompts: PromptRow[]
  competitors: { name: string; count: number }[]
}

export function aggregateRun(rows: GeoSnapshot[]): RunAgg {
  const cells = rows.length
  const mentions = rows.filter((r) => r.im_mentioned).length
  const cites = rows.filter((r) => r.im_cited).length
  const sov = cells ? rows.reduce((s, r) => s + (r.sov ?? 0), 0) / cells : 0

  const engMap = new Map<string, { sov: number; cells: number; mentions: number; cites: number }>()
  for (const r of rows) {
    const e = engMap.get(r.engine) ?? { sov: 0, cells: 0, mentions: 0, cites: 0 }
    e.sov += r.sov ?? 0
    e.cells++
    if (r.im_mentioned) e.mentions++
    if (r.im_cited) e.cites++
    engMap.set(r.engine, e)
  }
  const byEngine: EngineStat[] = [...engMap.entries()].map(([engine, e]) => ({
    engine,
    sov: e.cells ? e.sov / e.cells : 0,
    cells: e.cells,
    mentions: e.mentions,
    cites: e.cites
  }))

  const promptMap = new Map<string, PromptRow>()
  for (const r of rows) {
    let p = promptMap.get(r.prompt_id)
    if (!p) {
      p = { prompt_id: r.prompt_id, prompt_text: r.prompt_text ?? r.prompt_id, cells: {} }
      promptMap.set(r.prompt_id, p)
    }
    p.cells[r.engine] = {
      mentioned: !!r.im_mentioned,
      cited: !!r.im_cited,
      position: r.im_position
    }
  }

  const compMap = new Map<string, number>()
  for (const r of rows) {
    let names: string[] = []
    try {
      const parsed = JSON.parse(r.competitors ?? '[]')
      if (Array.isArray(parsed)) names = parsed.map((n) => String(n))
    } catch {
      names = []
    }
    for (const n of names) compMap.set(n, (compMap.get(n) ?? 0) + 1)
  }
  const competitors = [...compMap.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  return {
    run_date: rows[0]?.run_date ?? '',
    sov,
    mentionRate: cells ? mentions / cells : 0,
    citeRate: cells ? cites / cells : 0,
    cells,
    byEngine,
    prompts: [...promptMap.values()],
    competitors
  }
}

export interface TrendPoint {
  run_date: string
  overall: number
  byEngine: Record<string, number>
}

export function trendByRun(all: GeoSnapshot[]): TrendPoint[] {
  const runs = new Map<string, GeoSnapshot[]>()
  for (const r of all) {
    const list = runs.get(r.run_date)
    if (list) list.push(r)
    else runs.set(r.run_date, [r])
  }
  const points: TrendPoint[] = []
  for (const [run_date, rows] of runs) {
    const overall = rows.length ? rows.reduce((s, r) => s + (r.sov ?? 0), 0) / rows.length : 0
    const eng = new Map<string, { s: number; n: number }>()
    for (const r of rows) {
      const e = eng.get(r.engine) ?? { s: 0, n: 0 }
      e.s += r.sov ?? 0
      e.n++
      eng.set(r.engine, e)
    }
    const byEngine: Record<string, number> = {}
    for (const [k, v] of eng) byEngine[k] = v.n ? v.s / v.n : 0
    points.push({ run_date, overall, byEngine })
  }
  return points.sort((a, b) => a.run_date.localeCompare(b.run_date))
}

// --- Render -----------------------------------------------------------------

const pct = (x: number) => `${Math.round(x * 100)}%`
const shortDate = (iso: string) =>
  new Intl.DateTimeFormat('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short',
    day: 'numeric'
  }).format(new Date(iso))

function tile(label: string, value: string, delta: number | null): string {
  let deltaHtml = ''
  if (delta !== null && Math.abs(delta) >= 0.005) {
    const up = delta > 0
    const cls = up ? 'good' : 'bad'
    const glyph = up ? '▲' : '▼'
    deltaHtml = `<span class="delta ${cls}">${glyph} ${Math.abs(Math.round(delta * 100))} pts</span>`
  }
  return `<div class="tile"><div class="tile-label">${esc(label)}</div><div class="tile-value">${esc(value)}${deltaHtml}</div></div>`
}

function svgTrend(points: TrendPoint[], engineIds: string[]): string {
  if (points.length < 2) {
    return `<p class="muted">Collecting — the trend chart needs at least two runs. This is run ${points.length || 0}.</p>`
  }
  const W = 720
  const H = 260
  const m = { top: 16, right: 96, bottom: 28, left: 34 }
  const pw = W - m.left - m.right
  const ph = H - m.top - m.bottom
  const x = (i: number) => m.left + (points.length === 1 ? pw / 2 : (i / (points.length - 1)) * pw)
  const y = (v: number) => m.top + (1 - v) * ph

  const grid = [0, 0.25, 0.5, 0.75, 1]
    .map(
      (g) =>
        `<line x1="${m.left}" y1="${y(g).toFixed(1)}" x2="${m.left + pw}" y2="${y(g).toFixed(1)}" class="grid"/>` +
        `<text x="${m.left - 6}" y="${(y(g) + 3).toFixed(1)}" class="axis" text-anchor="end">${g * 100}%</text>`
    )
    .join('')

  const xlabels = points
    .map(
      (p, i) =>
        `<text x="${x(i).toFixed(1)}" y="${H - 8}" class="axis" text-anchor="middle">${esc(shortDate(p.run_date))}</text>`
    )
    .join('')

  const lines = engineIds
    .map((id) => {
      const pts = points
        .map((p, i) => `${x(i).toFixed(1)},${y(p.byEngine[id] ?? 0).toFixed(1)}`)
        .join(' ')
      const dots = points
        .map(
          (p, i) =>
            `<circle cx="${x(i).toFixed(1)}" cy="${y(p.byEngine[id] ?? 0).toFixed(1)}" r="3.5" class="dot s-${id}"><title>${esc(
              ENGINE_META.find((e) => e.id === id)?.label ?? id
            )} · ${esc(shortDate(p.run_date))}: ${pct(p.byEngine[id] ?? 0)}</title></circle>`
        )
        .join('')
      const last = points[points.length - 1]
      const label = `<text x="${(m.left + pw + 6).toFixed(1)}" y="${(y(last.byEngine[id] ?? 0) + 3).toFixed(1)}" class="s-label s-${id}">${esc(
        ENGINE_META.find((e) => e.id === id)?.label ?? id
      )}</text>`
      return `<polyline points="${pts}" class="line s-${id}" fill="none"/>${dots}${label}`
    })
    .join('')

  return `<svg viewBox="0 0 ${W} ${H}" class="chart" role="img" aria-label="Share of voice by engine over time">${grid}${xlabels}${lines}</svg>`
}

function promptTable(agg: RunAgg, engineIds: string[]): string {
  const head =
    `<tr><th class="l">Prompt</th>` +
    engineIds
      .map((id) => `<th>${esc(ENGINE_META.find((e) => e.id === id)?.label ?? id)}</th>`)
      .join('') +
    `</tr>`
  const rows = agg.prompts
    .map((p) => {
      const cells = engineIds
        .map((id) => {
          const c = p.cells[id]
          if (!c) return `<td class="cell none">—</td>`
          if (!c.mentioned) return `<td class="cell miss" title="not mentioned">·</td>`
          const rank = c.position ? `#${c.position}` : '✓'
          const cite = c.cited ? ' <span class="cite" title="cited">◆</span>' : ''
          return `<td class="cell hit" title="mentioned${c.cited ? ', cited' : ''}">${rank}${cite}</td>`
        })
        .join('')
      return `<tr><td class="l">${esc(p.prompt_text)}</td>${cells}</tr>`
    })
    .join('')
  return `<table class="grid-table"><thead>${head}</thead><tbody>${rows}</tbody></table>`
}

function competitorList(agg: RunAgg): string {
  if (!agg.competitors.length) return `<p class="muted">No competitors surfaced in this run.</p>`
  const max = agg.competitors[0].count || 1
  return (
    `<ul class="comp">` +
    agg.competitors
      .map(
        (c) =>
          `<li><span class="comp-name">${esc(c.name)}</span><span class="comp-bar"><span style="width:${Math.round(
            (c.count / max) * 100
          )}%"></span></span><span class="comp-n">${c.count}</span></li>`
      )
      .join('') +
    `</ul>`
  )
}

const STYLE = `
/* Light Island Mountain: navy-slate ink, copper accent spine, red reserved. */
:root{
  --plane:#f4f6f9; --surface:#ffffff; --ink:#0f172a; --ink2:#334155; --muted:#64748b;
  --grid:#e2e8f0; --line:rgba(15,23,42,.12); --slate:#94a3b8;
  --copper:#f59e0b; --copper-deep:#d97706; --red:#ef4444;
  --s-claude:#2a78d6; --s-openai:#eb6834; --s-gemini:#1baf7a; --s-perplexity:#eda100;
}
*{box-sizing:border-box}
body{margin:0;background:var(--plane);color:var(--ink);font-family:Inter,-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;font-size:14px;line-height:1.6;-webkit-font-smoothing:antialiased}
.wrap{max-width:880px;margin:0 auto;padding:36px 22px 64px}
.eyebrow{font-family:"Space Grotesk",Inter,sans-serif;font-size:.72rem;font-weight:700;letter-spacing:.22em;text-transform:uppercase;color:var(--copper);margin:0 0 8px}
h1{font-family:"Space Grotesk",Inter,system-ui,sans-serif;font-size:2rem;font-weight:800;letter-spacing:-.02em;color:var(--ink);margin:0 0 5px}
.sub{color:var(--ink2);margin:0 0 24px;font-size:.95rem}
.card{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:20px 22px;margin:16px 0;box-shadow:0 1px 3px rgba(15,23,42,.05)}
h2{font-family:"Space Grotesk",Inter,sans-serif;font-size:.8rem;text-transform:uppercase;letter-spacing:.13em;color:var(--ink2);font-weight:700;margin:0 0 14px}
.tiles{display:grid;grid-template-columns:repeat(3,1fr);gap:14px}
.tile{background:var(--surface);border:1px solid var(--line);border-top:3px solid var(--copper);border-radius:12px;padding:16px 18px;box-shadow:0 1px 3px rgba(15,23,42,.05)}
.tile-label{color:var(--muted);font-size:.72rem;text-transform:uppercase;letter-spacing:.1em;font-weight:600}
.tile-value{font-family:"Space Grotesk",Inter,sans-serif;font-size:2.1rem;font-weight:700;letter-spacing:-.02em;color:var(--ink);margin-top:6px}
.delta{font-size:.8rem;font-weight:700;margin-left:9px;vertical-align:middle}
.delta.good{color:var(--copper-deep)} .delta.bad{color:var(--red)}
.muted{color:var(--muted)}
.chart{width:100%;height:auto;overflow:visible}
.chart .grid{stroke:var(--grid);stroke-width:1}
.chart .axis{fill:var(--muted);font-size:11px}
.chart .line{stroke-width:2.5;stroke-linejoin:round;stroke-linecap:round}
.chart .dot{stroke:var(--surface);stroke-width:1.5}
.line.s-claude,.dot.s-claude{stroke:var(--s-claude)} .dot.s-claude{fill:var(--s-claude)}
.line.s-openai,.dot.s-openai{stroke:var(--s-openai)} .dot.s-openai{fill:var(--s-openai)}
.line.s-gemini,.dot.s-gemini{stroke:var(--s-gemini)} .dot.s-gemini{fill:var(--s-gemini)}
.line.s-perplexity,.dot.s-perplexity{stroke:var(--s-perplexity)} .dot.s-perplexity{fill:var(--s-perplexity)}
.s-label{font-size:11px;font-weight:700;dominant-baseline:middle}
.s-label.s-claude{fill:var(--s-claude)} .s-label.s-openai{fill:var(--s-openai)}
.s-label.s-gemini{fill:var(--s-gemini)} .s-label.s-perplexity{fill:var(--s-perplexity)}
.grid-table{width:100%;border-collapse:collapse;font-variant-numeric:tabular-nums}
.grid-table th,.grid-table td{padding:8px;border-bottom:1px solid var(--line);text-align:center}
.grid-table th{color:var(--muted);font-size:12px;font-weight:600}
.grid-table th.l,.grid-table td.l{text-align:left}
.grid-table td.l{color:var(--ink2)}
.cell.hit{color:var(--copper-deep);font-weight:700}
.cell.miss{color:var(--slate)} .cell.none{color:var(--grid)}
.cite{color:var(--copper)}
.comp{list-style:none;margin:0;padding:0}
.comp li{display:grid;grid-template-columns:140px 1fr 30px;align-items:center;gap:10px;padding:5px 0}
.comp-name{color:var(--ink2)} .comp-n{text-align:right;font-variant-numeric:tabular-nums;color:var(--ink2)}
.comp-bar{height:8px;background:var(--grid);border-radius:4px;overflow:hidden}
.comp-bar span{display:block;height:100%;background:var(--slate)}
.foot{color:var(--muted);font-size:12px;margin-top:26px;border-top:1px solid var(--line);padding-top:14px}
`

export function renderDashboard(all: GeoSnapshot[], latest: GeoSnapshot[], nowMs: number): string {
  const present = ENGINE_META.map((e) => e.id).filter((id) => latest.some((r) => r.engine === id))
  const body = latest.length ? renderBody(all, latest, present, nowMs) : renderEmpty()
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Lookout · GEO Visibility</title><link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin><link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Space+Grotesk:wght@500;700;800&display=swap" rel="stylesheet"><style>${STYLE}</style></head><body><div class="wrap">${body}</div></body></html>`
}

function renderEmpty(): string {
  return `<p class="eyebrow">Island Mountain · GEO Visibility</p><h1>Lookout</h1><p class="sub">Island Mountain in AI answers.</p>
  <div class="card"><h2>No runs yet</h2><p class="muted">Trigger the first run with <code>POST /api/geo/run</code>, or wait for the Monday 9:00 AM Pacific cron. Once at least one engine key is set, snapshots land here.</p></div>`
}

function renderBody(
  all: GeoSnapshot[],
  latest: GeoSnapshot[],
  present: string[],
  nowMs: number
): string {
  const agg = aggregateRun(latest)
  const trend = trendByRun(all)
  const prev = trend.length >= 2 ? trend[trend.length - 2] : null
  const dSov = prev ? agg.sov - prev.overall : null

  const tiles =
    `<div class="tiles">` +
    tile('Share of Voice', pct(agg.sov), dSov) +
    tile('Mention rate', pct(agg.mentionRate), null) +
    tile('Citation rate', pct(agg.citeRate), null) +
    `</div>`

  return `<p class="eyebrow">Island Mountain · GEO Visibility</p><h1>Lookout</h1>
  <p class="sub">Island Mountain in AI answers · last run ${esc(shortDate(agg.run_date))} · ${present.length} engine${
    present.length === 1 ? '' : 's'
  } · ${agg.cells} answers</p>
  ${tiles}
  <div class="card"><h2>Share of voice over time</h2>${svgTrend(trend, present)}</div>
  <div class="card"><h2>By prompt (this run)</h2><p class="muted" style="margin-top:-6px">#rank when named · ◆ cited · · not mentioned</p>${promptTable(
    agg,
    present
  )}</div>
  <div class="card"><h2>Who else shows up</h2>${competitorList(agg)}</div>
  <p class="foot">Lookout · NOOA GEO watchstander · generated ${esc(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Los_Angeles',
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(nowMs))
  )} PT · internal</p>`
}
