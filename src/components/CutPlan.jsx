import { useMemo, useState } from 'react'

/*
  Plan de coupe (calepinage) configurable des 2 caissons subwoofer.
  Pièces issues de la liste de coupe du rapport (CP bouleau 15 mm) + renforts,
  ×2 subs, nestées sur des plaques de taille réglable par un algorithme en
  bandes (shelf first-fit decreasing). Rotation autorisée (grain non
  contraignant). Tout se recalcule à la volée (plaques, chute…).
*/

const M = 8 // marge de rive
const SUBS = 2 // nombre de caissons
const S = 0.46 // px par mm pour l'affichage
const PAD_L = 80 // marge gauche (règle verticale)
const PAD_T = 52 // marge haute (règle horizontale)

const PRESETS = [
  { label: 'Standard 2440×1220', w: 2440, h: 1220 },
  { label: 'Grand 2500×1250', w: 2500, h: 1250 },
  { label: 'Format 3050×1530', w: 3050, h: 1530 },
]

// Pièces CP 15 mm par caisson (liste de coupe §3 + renforts)
const PIECES = [
  { name: 'Dessus / dessous', w: 425, h: 600, qty: 2, color: '#d9c08a' },
  { name: 'Flanc G/D', w: 600, h: 529, qty: 2, color: '#cdb079', notch: true },
  { name: 'Arrière', w: 395, h: 529, qty: 1, color: '#e0cfa6' },
  { name: 'Façade (cadre)', w: 395, h: 529, qty: 1, color: '#d2bd92', vent: 115 },
  { name: "Tablette d'évent", w: 395, h: 250, qty: 1, color: '#c9a368' },
  { name: 'Baffle HP', w: 395, h: 414, qty: 1, color: '#dcc89c', hole: 349.5 },
  { name: 'Renfort central', short: 'Renfort', w: 215, h: 100, qty: 1, color: '#c2a062' },
  { name: 'Goussets ×2', short: 'Gousset', w: 82, h: 82, qty: 2, color: '#b9975f', tri: true },
]

// Tasseaux d'angle (baguettes 18 × 18) par caisson — débit linéaire séparé
const BATTENS = [
  { name: 'Tasseaux verticaux arrière', len: 529, qty: 2 },
  { name: 'Renforts arrière haut/bas', len: 351, qty: 2 },
  { name: 'Tasseaux flanc haut/bas', len: 525, qty: 4 },
]

function expand() {
  const items = []
  for (const p of PIECES) {
    for (let s = 0; s < SUBS; s++) {
      for (let q = 0; q < p.qty; q++) {
        items.push({ ...p, key: `${p.name}-${s}-${q}` })
      }
    }
  }
  return items
}

function place(sheet, it, W, H, gap) {
  for (const sh of sheet.shelves) {
    if (it.h <= sh.h && sh.cursorX + it.w <= W - M) {
      it.x = sh.cursorX
      it.y = sh.y
      sh.cursorX += it.w + gap
      sheet.items.push(it)
      return true
    }
  }
  const y = sheet.cursorY
  if (y + it.h <= H - M) {
    const sh = { y, cursorX: M, h: it.h }
    it.x = M
    it.y = y
    sh.cursorX = M + it.w + gap
    sheet.shelves.push(sh)
    sheet.cursorY = y + it.h + gap
    sheet.items.push(it)
    return true
  }
  return false
}

function nest(W, H, gap) {
  const usableW = W - 2 * M
  const usableH = H - 2 * M
  const oriented = expand()
    .map((p) => {
      let w = Math.max(p.w, p.h)
      let h = Math.min(p.w, p.h)
      // si trop large à plat mais tient debout en tournant la pièce
      if (w > usableW && w <= usableH && h <= usableW) {
        const t = w
        w = h
        h = t
      }
      return { ...p, w, h, fits: w <= usableW && h <= usableH }
    })
    .sort((a, b) => b.fits - a.fits || b.h - a.h || b.w - a.w)

  const sheets = []
  const unplaceable = []
  for (const it of oriented) {
    if (!it.fits) {
      unplaceable.push(it)
      continue
    }
    let placed = false
    for (const s of sheets) {
      if (place(s, it, W, H, gap)) {
        placed = true
        break
      }
    }
    if (!placed) {
      const s = { shelves: [], cursorY: M, items: [] }
      sheets.push(s)
      place(s, it, W, H, gap)
    }
  }
  return { sheets, unplaceable }
}

function Ruler({ W, H }) {
  const ticks = (max) => {
    const t = []
    for (let v = 0; v <= max; v += 100) t.push(v)
    if (t[t.length - 1] !== max) t.push(max)
    return t
  }
  return (
    <g stroke="#15366B" strokeWidth={1} vectorEffect="non-scaling-stroke">
      {ticks(W).map((x) => {
        const major = x % 200 === 0 || x === W
        return (
          <g key={`x${x}`}>
            <line x1={x} y1={major ? -26 : -16} x2={x} y2={0} />
            {major && (
              <text x={x} y={-32} textAnchor="middle" fontSize="22" fill="#15366B" fontFamily="monospace" stroke="none">
                {x}
              </text>
            )}
          </g>
        )
      })}
      {ticks(H).map((y) => {
        const major = y % 200 === 0 || y === H
        return (
          <g key={`y${y}`}>
            <line x1={major ? -26 : -16} y1={y} x2={0} y2={y} />
            {major && (
              <text x={-32} y={y + 7} textAnchor="end" fontSize="22" fill="#15366B" fontFamily="monospace" stroke="none">
                {y}
              </text>
            )}
          </g>
        )
      })}
    </g>
  )
}

function Piece({ it }) {
  const cx = it.x + it.w / 2
  const cy = it.y + it.h / 2
  const long = Math.max(it.w, it.h)
  const short = Math.min(it.w, it.h)
  const label = it.short || it.name
  const dimStr = `${long} × ${short}`
  const fit = (len, max) => Math.max(11, Math.min(max, Math.floor((it.w - 16) / (len * 0.6))))
  const nameFont = fit(label.length, 26)
  const dimFont = fit(dimStr.length, 23)
  const gap = Math.min(nameFont, 16)
  return (
    <g>
      <rect x={it.x} y={it.y} width={it.w} height={it.h} fill={it.color} stroke="#1C1A16" strokeWidth={1.4} vectorEffect="non-scaling-stroke" />
      {it.tri && (
        <line x1={it.x} y1={it.y + it.h} x2={it.x + it.w} y2={it.y} stroke="#1C1A16" strokeWidth={1.2} vectorEffect="non-scaling-stroke" />
      )}
      {it.notch && (
        <rect x={it.x + it.w - 20} y={it.y + 50} width={20} height={it.h - 100} fill="none" stroke="#A85F18" strokeWidth={1.2} strokeDasharray="10 7" vectorEffect="non-scaling-stroke" />
      )}
      {it.vent && (
        <line x1={it.x + it.w - it.vent} y1={it.y} x2={it.x + it.w - it.vent} y2={it.y + it.h} stroke="#A85F18" strokeWidth={1.2} strokeDasharray="10 7" vectorEffect="non-scaling-stroke" />
      )}
      {it.hole && (
        <circle cx={cx} cy={cy} r={it.hole / 2} fill="none" stroke="#15366B" strokeWidth={1.4} strokeDasharray="12 8" vectorEffect="non-scaling-stroke" />
      )}
      <text x={cx} y={cy - gap / 2} textAnchor="middle" fontSize={nameFont} fontWeight="700" fill="#1C1A16">
        {label}
      </text>
      <text x={cx} y={cy + gap} textAnchor="middle" fontSize={dimFont} fill="#15366B" fontFamily="monospace">
        {dimStr}
      </text>
      {it.hole && (
        <text x={cx} y={cy + 48} textAnchor="middle" fontSize="20" fill="#15366B" fontFamily="monospace">
          Ø{String(it.hole).replace('.', ',')}
        </text>
      )}
    </g>
  )
}

export default function CutPlan() {
  // valeurs brutes (saisie libre, on peut tout effacer)
  const [wIn, setWIn] = useState('2440')
  const [hIn, setHIn] = useState('1220')
  const [gapIn, setGapIn] = useState('4')

  // valeurs sécurisées pour le calcul uniquement
  const W = Math.max(1, parseInt(wIn, 10) || 0)
  const H = Math.max(1, parseInt(hIn, 10) || 0)
  const gap = Math.max(0, parseInt(gapIn, 10) || 0)

  const { sheets, unplaceable } = useMemo(() => nest(W, H, gap), [W, H, gap])
  const pieceArea = useMemo(() => expand().reduce((s, p) => s + p.w * p.h, 0), [])
  const sheetArea = sheets.length * W * H
  const waste = sheetArea ? Math.round((1 - pieceArea / sheetArea) * 100) : 0
  const battenTotal = BATTENS.reduce((s, b) => s + b.len * b.qty, 0) * SUBS

  const vbW = W + PAD_L + 14
  const vbH = H + PAD_T + 14

  return (
    <figure className="cutplan">
      <div className="cutplan-config">
        <div className="cutplan-presets">
          {PRESETS.map((p) => (
            <button
              key={p.label}
              type="button"
              className={W === p.w && H === p.h ? 'is-on' : ''}
              onClick={() => {
                setWIn(String(p.w))
                setHIn(String(p.h))
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <div className="cutplan-fields">
          <label>
            Largeur
            <input type="number" step={10} value={wIn} onChange={(e) => setWIn(e.target.value)} />
            mm
          </label>
          <label>
            Hauteur
            <input type="number" step={10} value={hIn} onChange={(e) => setHIn(e.target.value)} />
            mm
          </label>
          <label>
            Trait de scie
            <input type="number" step={1} value={gapIn} onChange={(e) => setGapIn(e.target.value)} />
            mm
          </label>
        </div>
      </div>

      <div className="cutplan-meta">
        {sheets.length} plaque{sheets.length > 1 ? 's' : ''} CP bouleau 15 mm · {W} × {H} mm · chute
        ~{waste}% · trait de scie {gap} mm
      </div>

      {unplaceable.length > 0 && (
        <div className="cutplan-warn">
          ⚠ {unplaceable.length} pièce{unplaceable.length > 1 ? 's' : ''} trop grande
          {unplaceable.length > 1 ? 's' : ''} pour cette plaque :{' '}
          {[...new Set(unplaceable.map((u) => u.name))].join(', ')}.
        </div>
      )}

      <div className="cutplan-scroll">
        {sheets.map((sheet, i) => (
          <div className="cutplan-sheet" key={i}>
            <div className="cutplan-sheet-head">Plaque {i + 1} / {sheets.length}</div>
            <svg width={vbW * S} height={vbH * S} viewBox={`${-PAD_L} ${-PAD_T} ${vbW} ${vbH}`} role="img" aria-label={`Plaque ${i + 1}`}>
              <Ruler W={W} H={H} />
              <rect x="0" y="0" width={W} height={H} fill="#FAF8F3" stroke="#1C1A16" strokeWidth={2} vectorEffect="non-scaling-stroke" />
              {sheet.items.map((it) => (
                <Piece it={it} key={it.key} />
              ))}
            </svg>
          </div>
        ))}
      </div>

      <div className="cutplan-battens">
        <div className="cutplan-sheet-head">
          Tasseaux d'angle — baguettes 18 × 18 (débit séparé) · total ~{(battenTotal / 1000).toFixed(1)} m
        </div>
        <ul>
          {BATTENS.map((b) => (
            <li key={b.name}>
              <span className="mono">{b.qty * SUBS} ×</span> {b.name} — <span className="mono">{b.len} mm</span>
            </li>
          ))}
        </ul>
      </div>

      <figcaption className="cutplan-note">
        Calepinage indicatif des 2 caissons (pièces orientées pour limiter les chutes — rotation
        autorisée). Règles de rive graduées en mm. Cercle bleu = perçage Ø349,5 du baffle ;
        pointillés ocre = déport avant 20 mm des flancs et bouche d'évent 115 mm de la façade ;
        diagonale = goussets (2 par carré). La liste de coupe des têtes provient du PDF Celestion (non
        incluse).
      </figcaption>
    </figure>
  )
}
