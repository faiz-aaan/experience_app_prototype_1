// Films for memory, saying no, wild cards, facts, outside services, all-together, models, habit and moat.
import { F, rr, rng, seg, easeOut, easeInOut, lerp, clamp, type FilmOpts } from './engine';

const label = (c: CanvasRenderingContext2D, txt: string, x: number, y: number, col: string, size = 12, align: CanvasTextAlign = 'left', w = 600) => {
  c.font = F.m(size, w); c.fillStyle = col; c.textAlign = align; c.fillText(txt, x, y); c.textAlign = 'left';
};
const wrap = (c: CanvasRenderingContext2D, txt: string, x: number, y: number, maxW: number, lh: number) => {
  const words = txt.split(' '); let line = '', yy = y;
  words.forEach((w) => { const t = line ? line + ' ' + w : w; if (c.measureText(t).width > maxW && line) { c.fillText(line, x, yy); line = w; yy += lh; } else line = t; });
  c.fillText(line, x, yy); return yy;
};

/* ---------- Memory: a taste changes ---------- */
export const memoryFilm: FilmOpts = {
  dur: 22, still: 21.9, ratio: 0.5, tall: 1.12,
  caps: [
    [0, 'Four weeks in, the notebook is right: this person loves late nights, and their outings prove it.'],
    [3.6, 'Then life changes. They start early gym. Nobody tells the app.'],
    [5.2, 'The notebook barely moves. Fading is slow on purpose, so one bad night can’t erase a real taste.'],
    [9, 'Way 1: they mention it in passing (“joined a gym, up at 5 now”). Listening replaces the line at once.'],
    [12.5, 'Way 2: a 20-second catch-up each month asks “still into late nights?”. In the test it caught 95% of changes.'],
    [16, 'Way 3: a surprise meter counts passed-on ideas. Alone it was slow: 31% caught, about five weeks late.'],
    [19.5, 'So: listen first, catch up monthly, and let the meter only bring the catch-up forward.'],
  ],
  draw(c, t, W, H, nar, P, idle) {
    const L = nar ? 60 : 80, R = W - (nar ? 24 : 290), T = 48, B = H - (nar ? 190 : 110);
    const X = (w: number) => L + (w / 12) * (R - L), Y = (v: number) => B - v * (B - T);
    const wk = 12 * seg(t, 0.4, 9);
    c.strokeStyle = P.line; c.lineWidth = 1;
    for (let w = 0; w <= 12; w += 2) { c.beginPath(); c.moveTo(X(w), T); c.lineTo(X(w), B); c.stroke(); label(c, 'wk ' + w, X(w), B + 18, P.muted, 10, 'center', 400); }
    label(c, 'LIKES LATE NIGHTS', L, T - 18, P.muted, 10);
    const truth = (w: number) => (w < 4 ? 0.9 : w < 4.4 ? lerp(0.9, 0.05, (w - 4) / 0.4) : 0.05);
    const nb = (w: number) => (w < 4 ? 0.86 : Math.max(0.55, 0.86 - 0.035 * (w - 4)));
    c.setLineDash([7, 6]); c.strokeStyle = P.rice; c.lineWidth = 2.5; c.beginPath(); for (let w = 0; w <= wk; w += 0.05) { const y = Y(truth(w)); w ? c.lineTo(X(w), y) : c.moveTo(X(w), y); } c.stroke(); c.setLineDash([]);
    c.strokeStyle = P.muted; c.lineWidth = 3; c.beginPath(); for (let w = 0; w <= wk; w += 0.05) { const y = Y(nb(w)); w ? c.lineTo(X(w), y) : c.moveTo(X(w), y); } c.stroke();
    if (wk > 1.5) { c.font = F.b(13, 700); c.fillStyle = P.rice; c.fillText('real taste', X(0.3), Y(0.9) - 10); }
    if (wk > 6) { c.font = F.b(13, 650); c.fillStyle = P.muted; c.fillText('notebook, fading only', X(6.4), Y(nb(6.4)) - 12); }
    const ways: [number, string, string, number][] = [[5.6, 'They mention it', P.turmeric, 9], [6.4, 'Monthly catch-up', P.code, 12.5], [9.1, 'Meter alone', P.kumkum, 16]];
    ways.forEach(([w, n, col, at], k) => {
      const a = seg(t, at, at + 0.6); if (a <= 0) return; c.globalAlpha = a;
      c.strokeStyle = col; c.lineWidth = 3; c.beginPath(); c.moveTo(X(w), Y(nb(w))); c.lineTo(X(w), Y(0.05)); c.lineTo(X(12), Y(0.05) + (k - 1) * 4); c.stroke();
      c.fillStyle = col; c.beginPath(); c.arc(X(w), Y(nb(w)), 6, 0, 7); c.fill();
      const lx = nar ? L : R + 30, ly = nar ? B + 50 + k * 26 : T + 40 + k * 56;
      c.beginPath(); c.arc(lx + 6, ly - 5, 6, 0, 7); c.fill(); c.font = F.b(nar ? 13 : 15, 700); c.fillStyle = P.rice; c.fillText(`${n} · week ${Math.round(w)}`, lx + 20, ly);
      c.globalAlpha = 1;
    });
  },
};

/* ---------- Saying no: one request, separate verdicts ---------- */
const LANES: [string, string][] = [['SERVE', 'code'], ['SUBSTITUTE', 'rice'], ['ASK', 'rice'], ['CAN’T', 'kumkum'], ['WON’T', 'kumkum'], ['NOT OURS', 'kumkum']];
const PIECES = [
  { t: 'biryani at someone’s wedding', lane: 5, at: 4, checks: ['Safe? yes', 'In scope? no: private event'] },
  { t: 'a bike race late at night', lane: 4, at: 8.5, checks: ['Safe? no: street race'] },
  { t: 'back by 5 am', lane: 0, at: 12.5, checks: ['Safe? yes', 'In scope? yes', 'Fits? yes'] },
];
export const noFilm: FilmOpts = {
  dur: 23.5, still: 23.4, ratio: 0.56, tall: 1.25,
  caps: [
    [0, 'One message, three different asks. One combined score would blur them together.'],
    [1.4, 'First the request is split into pieces. Each piece gets its own checks.'],
    [4, 'Biryani at someone’s wedding: safe, but a private event. Not ours. Its intent, wedding-style biryani, is kept.'],
    [8.5, 'A bike race late at night fails the safety check. Won’t. The safe version is a karting track.'],
    [12.5, 'Back by 5 am is an ordinary deadline. It passes, and the plan is built around it.'],
    [17, 'The reply answers piece by piece: a clear no where needed, and something real to do instead.'],
    [21, 'Verdicts come from typed checks. Scores only rank what is allowed.'],
  ],
  draw(c, t, W, H, nar, P) {
    const pad = nar ? 20 : 36; const col = (k: string) => (P as any)[k];
    c.globalAlpha = seg(t, 0, 0.5); c.font = F.b(nar ? 16 : 20, 500);
    const msg = '“Biryani at someone’s wedding, then a bike race late at night, back by 5 am”';
    rr(c, pad, 16, W - 2 * pad, nar ? 74 : 56, 14); c.fillStyle = P.rice; c.fill(); c.fillStyle = P.door; const last = wrap(c, msg, pad + 20, nar ? 44 : 50, W - 2 * pad - 40, 22); c.globalAlpha = 1;
    const ly = nar ? H - 210 : H - 150, lw = (W - 2 * pad) / 6;
    LANES.forEach(([n, k], i) => { const x = pad + i * lw; c.strokeStyle = col(k); c.lineWidth = 2; c.beginPath(); c.moveTo(x + 6, ly); c.lineTo(x + lw - 6, ly); c.stroke(); label(c, n, x + lw / 2, ly - 8, col(k), nar ? 9 : 11, 'center', 700); });
    const sy = (nar ? 100 : 86) + 16;
    PIECES.forEach((p, k) => {
      const split = seg(t, 1.4 + k * 0.4, 2.2 + k * 0.4); if (split <= 0) return;
      const x0 = W / 2, cx0 = pad + (k + 0.5) * (W - 2 * pad) / 3, lx = pad + (p.lane + 0.5) * lw, tl = t - p.at;
      const drop = tl > 0 ? easeOut(seg(tl, 2.4, 3.6)) : 0;
      const x = lerp(lerp(x0, cx0, easeOut(split)), lx, drop), y = lerp(sy, ly + 14, drop);
      c.font = F.b(nar ? 11.5 : 14, 650); const w = Math.min(lerp(nar ? (W - 2 * pad) / 3 - 8 : 240, lw - 6, drop), c.measureText(p.t).width + 24);
      rr(c, x - w / 2, y, w, 30, 8); c.fillStyle = P.door; c.fill(); c.strokeStyle = tl > 2.4 ? col(LANES[p.lane][1]) : P.rice; c.lineWidth = 2; c.stroke();
      let tt = p.t; while (c.measureText(tt).width > w - 14 && tt.length > 4) tt = tt.slice(0, -2); if (tt !== p.t) tt += '…';
      c.fillStyle = P.rice; c.textAlign = 'center'; c.fillText(tt, x, y + 20); c.textAlign = 'left';
      if (tl > 0 && tl < 3.6) p.checks.forEach((ch, j) => { const a = seg(tl, 0.3 + j * 0.6, 0.6 + j * 0.6) * (1 - seg(tl, 2.4, 2.8)); if (a <= 0) return; c.globalAlpha = a; const bad = /no:/.test(ch); label(c, (bad ? '✕ ' : '✓ ') + ch, cx0, sy + 52 + j * (nar ? 16 : 20), bad ? P.kumkum : P.code, nar ? 10 : 12, 'center'); c.globalAlpha = 1; });
    });
    const ra = seg(t, 17, 17.6); if (ra > 0) {
      const rx = pad, ry = sy + (nar ? 50 : 56), rw = W - 2 * pad, rh = Math.min(ly - ry - 40, nar ? 190 : 136);
      c.globalAlpha = ra; rr(c, rx, ry, rw, rh, 14); c.fillStyle = P.door; c.fill(); c.strokeStyle = P.turmeric; c.lineWidth = 2; c.stroke();
      const L: [string, string, string, number][] = [['NOT OURS', 'A stranger’s wedding isn’t something I can arrange. For wedding-style biryani: Wedding Biryani House, open till 12.', 'kumkum', 17.4], ['WON’T', 'Racing on public roads is something I won’t plan. Karting is the legal way: a track open till 10.', 'kumkum', 18.4], ['SERVE', 'Back by 5 am is easy with that plan.', 'code', 19.4]];
      L.forEach(([v, txt, k, at], i) => { const a = seg(t, at, at + 0.5); if (a <= 0) return; c.globalAlpha = ra * a; const yy = ry + (nar ? 24 : 30) + i * (nar ? (rh - 20) / 3 : 34); label(c, v, rx + 16, yy, col(k), nar ? 9 : 11, 'left', 700); c.font = F.b(nar ? 12 : 15, 500); c.fillStyle = P.rice; wrap(c, txt, rx + (nar ? 16 : 110), yy + (nar ? 14 : 0), rw - (nar ? 32 : 130), nar ? 15 : 18); });
      c.globalAlpha = 1;
    }
  },
};

/* ---------- Wild cards: Thompson sampling ---------- */
const ARMS: [string, number][] = [['New cuisine', 0.72], ['Craft class', 0.55], ['Dawn nature trip', 0.18], ['Community meetup', 0.62], ['Live music', 0.33]];
function gamma(k: number, r: () => number): number {
  if (k < 1) return gamma(k + 1, r) * Math.pow(r(), 1 / k);
  const d = k - 1 / 3, cc = 1 / Math.sqrt(9 * d);
  for (;;) { let x: number, v: number; do { let u = 0; while (!u) u = r(); x = Math.sqrt(-2 * Math.log(u)) * Math.cos(6.283185 * r()); v = 1 + cc * x; } while (v <= 0); v = v * v * v; const u = r(); if (u < 1 - 0.0331 * x ** 4) return d * v; if (Math.log(u) < 0.5 * x * x + d * (1 - v + Math.log(v))) return d * v; }
}
const BAND = (() => { const r = rng(5); const a = ARMS.map(() => 1), b = ARMS.map(() => 1), pk = ARMS.map(() => 0); const R: { smp: number[]; ch: number; ok: boolean; a: number[]; b: number[]; pk: number[] }[] = [];
  for (let i = 0; i < 40; i++) { const smp = ARMS.map((_, k) => { const x = gamma(a[k], r), y = gamma(b[k], r); return x / (x + y); }); let ch = 0; smp.forEach((v, k) => { if (v > smp[ch]) ch = k; }); const ok = r() < ARMS[ch][1]; ok ? a[ch]++ : b[ch]++; pk[ch]++; R.push({ smp, ch, ok, a: a.slice(), b: b.slice(), pk: pk.slice() }); }
  return R; })();
const curve = (a: number, b: number) => { const ys: number[] = []; for (let i = 0; i <= 100; i++) { const x = clamp(i / 100, 0.001, 0.999); ys.push((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x)); } const m = Math.max(...ys); const e = ys.map((v) => Math.exp(v - m)); const s = e.reduce((q, v) => q + v, 0) / 100; return e.map((v) => v / s); };
export const wildFilm: FilmOpts = {
  dur: 22, still: 21.9, ratio: 0.54, tall: 1.2,
  caps: [
    [0, 'Five kinds of surprise. At first nothing is known, so every belief curve is flat.'],
    [2, 'Each round, it draws a guess from every curve (the triangles) and tries the kind with the highest guess.'],
    [6, 'A “loved it” pushes that curve right; “not for me” pushes it left. Curves narrow as evidence piles up.'],
    [12, 'Dawn trips keep missing, so they get tried less, but uncertainty still earns them an occasional chance.'],
    [20, 'The dashed lines show the hidden truth. It found what works for this person without being told.'],
  ],
  draw(c, t, W, H, nar, P) {
    const T0 = 2, per = 0.45; let ri = Math.floor((t - T0) / per); const f = ((t - T0) % per) / per; if (t < T0) ri = -1; if (ri > 39) ri = 39; const done = t >= T0 + 40 * per;
    const post = (k: number) => { const idx = done ? 39 : f > 0.55 ? ri : ri - 1; return idx < 0 ? [1, 1] : [BAND[idx].a[k], BAND[idx].b[k]]; };
    const L = nar ? 30 : 40, cw = nar ? W - 60 : W * 0.56, rowH = nar ? (H * 0.62) / 5 : (H - 70) / 5, T = 24;
    ARMS.forEach(([n, p], k) => {
      const y0 = T + k * rowH, base = y0 + rowH - 18, [a, b] = post(k), ys = curve(a, b), cur = ri >= 0 && !done ? BAND[ri] : null, chosen = cur && cur.ch === k;
      c.font = F.b(nar ? 13 : 14, chosen ? 700 : 500); c.fillStyle = chosen ? P.rice : P.muted; c.fillText(n, L, y0 + 16);
      c.strokeStyle = P.line; c.lineWidth = 1; c.beginPath(); c.moveTo(L, base); c.lineTo(L + cw, base); c.stroke();
      const hm = rowH - 34; c.beginPath(); ys.forEach((v, i) => { const xx = L + (i / 100) * cw, yy = base - Math.min(1, v / 4.5) * hm; i ? c.lineTo(xx, yy) : c.moveTo(xx, yy); }); c.lineTo(L + cw, base); c.lineTo(L, base); c.closePath();
      c.globalAlpha = chosen ? 0.3 : 0.14; c.fillStyle = P.turmeric; c.fill(); c.globalAlpha = 1; c.strokeStyle = P.turmeric; c.lineWidth = 2; c.stroke();
      if (cur) { const sx = L + cur.smp[k] * cw; c.fillStyle = chosen ? P.rice : P.muted; c.beginPath(); c.moveTo(sx, base + 2); c.lineTo(sx - 6, base + 12); c.lineTo(sx + 6, base + 12); c.closePath(); c.fill(); if (chosen && f > 0.55) label(c, cur.ok ? '✓ loved it' : '✕ not for me', Math.min(sx + 10, L + cw - 100), base - hm + 6, cur.ok ? P.code : P.kumkum, 12); }
      const tr = seg(t, T0 + 40 * per, T0 + 40 * per + 0.6); if (tr > 0) { c.globalAlpha = tr; c.setLineDash([4, 4]); c.strokeStyle = P.rice; c.beginPath(); c.moveTo(L + p * cw, base); c.lineTo(L + p * cw, base - hm); c.stroke(); c.setLineDash([]); label(c, 'truth ' + p.toFixed(2), L + p * cw + 4, base - hm + 8, P.rice, 10, 'left', 600); c.globalAlpha = 1; }
    });
    const rx = nar ? L : W * 0.66, ry = nar ? T + 5 * rowH + 24 : T + 4, rw = nar ? W - 60 : W * 0.3;
    const st = ri >= 0 ? BAND[Math.min(39, f > 0.55 || done ? ri : ri - 1)] || null : null;
    label(c, `TRIED · ROUND ${ri < 0 ? 0 : Math.min(40, ri + 1)} OF 40`, rx, ry + 10, P.muted, 11);
    const pkk = st ? st.pk : ARMS.map(() => 0);
    ARMS.forEach(([n], k) => { const yy = ry + 28 + k * (nar ? 18 : 24); c.fillStyle = P.line; rr(c, rx, yy, rw - 40, 10, 5); c.fill(); c.fillStyle = P.turmeric; rr(c, rx, yy, Math.max(2, (rw - 40) * pkk[k] / 20), 10, 5); c.fill(); c.font = F.m(11); c.fillStyle = P.rice; c.fillText(String(pkk[k]), rx + rw - 30, yy + 10); });
  },
};

/* ---------- Facts by code ---------- */
export const factsFilm: FilmOpts = {
  dur: 15, still: 14.9, ratio: 0.52, tall: 1.2,
  caps: [
    [0, 'The AI doesn’t type facts. It returns which places it picked, by ID, and why.'],
    [3.5, 'Code looks each ID up in the fact store and prints the name, price, distance and hours itself.'],
    [7, 'Only the reason line comes from the AI. A wrong opening time can’t come from it, because it never writes one.'],
    [10, 'A checker still scans the reason for stray numbers or names. Here it catches “open till 11” and removes it.'],
    [13, 'What you see: checked facts from data, plus a human reason.'],
  ],
  draw(c, t, W, H, nar, P) {
    const pad = nar ? 22 : 36, colW = nar ? W - 2 * pad : (W - 3 * pad) / 2, lx = pad, rx = nar ? pad : pad * 2 + colW, ly = 40, ry = nar ? H * 0.5 : 40;
    label(c, 'WHAT THE AI RETURNS', lx, ly, P.turmeric, 11); label(c, 'WHAT YOU SEE (PRINTED BY CODE)', rx, ry, P.code, 11);
    const json = ['{ "item": "place_ChIJ…kaveri",', '  "role": "safe",', '  "why": "You love South Indian, and', '          it’s calm enough to talk.', '          Open till 11."  }'];
    c.font = F.m(nar ? 12 : 13.5); json.forEach((l, i) => { const a = seg(t, 0.3 + i * 0.3, 0.6 + i * 0.3); if (a <= 0) return; c.globalAlpha = a; c.fillStyle = i === 4 && t > 10 ? P.kumkum : P.rice; c.fillText(l, lx, ly + 30 + i * 22); c.globalAlpha = 1; });
    if (t > 10.3) { const a = seg(t, 10.3, 10.8); c.globalAlpha = a; c.strokeStyle = P.kumkum; c.lineWidth = 2; c.beginPath(); c.moveTo(lx + 70, ly + 30 + 4 * 22 - 5); c.lineTo(lx + 230, ly + 30 + 4 * 22 - 5); c.stroke(); label(c, '✕ number not in the facts: removed', lx, ly + 30 + 5 * 22 + 6, P.kumkum, 11); c.globalAlpha = 1; }
    const a1 = seg(t, 3.5, 4.2); if (a1 > 0) {
      c.globalAlpha = a1; const cy = ry + 20, ch = nar ? 150 : 170; rr(c, rx, cy, colW, ch, 12); c.strokeStyle = P.line; c.lineWidth = 1.5; c.stroke();
      c.font = F.b(nar ? 17 : 20, 800); c.fillStyle = P.rice; c.fillText('Kaveri thali place', rx + 16, cy + 34);
      const facts = ['about ₹420 each', '12 min away', 'veg, confirmed', 'open till 10:30 pm']; let x = rx + 16;
      facts.forEach((f, i) => { const a = seg(t, 4 + i * 0.35, 4.4 + i * 0.35); if (a <= 0) return; c.globalAlpha = a1 * a; c.font = F.m(11, 600); const w = c.measureText(f).width + 16; if (x + w > rx + colW - 10) { x = rx + 16; } rr(c, x, cy + 50 + (x === rx + 16 && i > 1 ? 30 : 0), w, 24, 6); c.fillStyle = 'rgba(124,155,255,.18)'; c.fill(); c.fillStyle = P.code; c.fillText(f, x + 8, cy + 66 + (x === rx + 16 && i > 1 ? 30 : 0)); x += w + 8; });
      const a2 = seg(t, 7, 7.6); if (a2 > 0) { c.globalAlpha = a1 * a2; c.font = F.b(nar ? 13 : 15, 500); c.fillStyle = P.rice; wrap(c, t > 11 ? 'You love South Indian, and it’s calm enough to talk.' : 'You love South Indian, and it’s calm enough to talk. Open till 11.', rx + 16, cy + 130, colW - 32, 20); }
      c.globalAlpha = 1;
    }
  },
};

/* ---------- Outside services: who talks to whom ---------- */
const LN = ['You', 'Our app', 'Claude', 'Google', 'Our data'];
const STEPS: [number, number, string, number][] = [
  [0, 1, 'veg dinner for 4, sweet on the way, home by 10', 0.5],
  [1, 4, 'read notebook: likes South Indian, calm', 2.2],
  [1, 2, 'split the sentence into pieces', 3.6],
  [2, 1, '2 to find · 4 rules · 1 taste', 5],
  [1, 3, 'Places: dinner + dessert near you, open now', 6.6],
  [1, 4, 'our facts: veg confirmed, prices, clubs', 8.2],
  [1, 1, 'fences and magnets: 3,000 → 12', 9.8],
  [1, 3, 'Routes: travel times, 13 × 13 in one call', 11.4],
  [1, 1, 'route solver + checks → 1 plan', 13],
  [1, 2, 'write the reasons around these IDs', 14.6],
  [1, 3, 'Routes: road path · Maps: pins and line', 16.2],
  [1, 0, 'plan on the map: 7:30 · 9:05 · home 9:40', 17.8],
];
export const outsideFilm: FilmOpts = {
  dur: 21, still: 20.9, ratio: 0.6, tall: 1.5,
  caps: [
    [0, 'One reply, step by step. The columns are the people and services involved.'],
    [2.2, 'Our database: your notebook (what you like) and our own lists (facts Google doesn’t have).'],
    [3.6, 'Claude, the AI, is used twice: to understand the sentence, and at the end to write the reasons.'],
    [6.6, 'Google Places finds candidate places. We may store their IDs, not copies of their details.'],
    [9.8, 'Our own code does the deciding: fences, magnets, the mix. No service is asked to choose.'],
    [11.4, 'Google Routes measures travel times between every pair. Our solver picks the stops and order.'],
    [16.2, 'Google draws the road path; the app shows pins, line and timeline on a Google map.'],
    [18.8, 'About two AI calls and a handful of Google calls per reply. Everything else is our code.'],
  ],
  draw(c, t, W, H, nar, P) {
    const pad = nar ? 16 : 30, colX = (i: number) => pad + (i + 0.5) * (W - 2 * pad) / LN.length, top = 46, rowH = (H - top - 20) / STEPS.length;
    const colCol = [P.rice, P.turmeric, P.turmeric, P.code, P.code];
    LN.forEach((n, i) => { c.font = F.b(nar ? 12 : 15, 700); c.fillStyle = colCol[i]; c.textAlign = 'center'; c.fillText(n, colX(i), 26); c.textAlign = 'left'; c.strokeStyle = P.line; c.lineWidth = 1.5; c.setLineDash([3, 6]); c.beginPath(); c.moveTo(colX(i), top - 8); c.lineTo(colX(i), H - 10); c.stroke(); c.setLineDash([]); });
    STEPS.forEach(([a, b, txt, at], k) => {
      const p = seg(t, at, at + 0.9); if (p <= 0) return; const y = top + k * rowH + rowH * 0.6, x1 = colX(a), x2 = colX(b);
      c.globalAlpha = 1; c.strokeStyle = a === b ? P.muted : b === 2 || a === 2 ? P.turmeric : b === 3 ? P.code : P.rice; c.lineWidth = 2;
      if (a === b) { rr(c, x1 - (nar ? 50 : 70), y - 12, nar ? 100 : 140, 20, 6); c.fillStyle = 'rgba(242,169,0,.14)'; c.fill(); }
      else { const xe = lerp(x1, x2, easeOut(p)); c.beginPath(); c.moveTo(x1, y); c.lineTo(xe, y); c.stroke(); const dir = Math.sign(x2 - x1); c.beginPath(); c.moveTo(xe, y); c.lineTo(xe - 7 * dir, y - 4); c.lineTo(xe - 7 * dir, y + 4); c.closePath(); c.fillStyle = c.strokeStyle as string; c.fill(); }
      c.globalAlpha = seg(t, at + 0.3, at + 0.8); c.font = F.b(nar ? 9.5 : 12, 500); c.fillStyle = P.rice;
      const mid = a === b ? x1 : (x1 + x2) / 2; c.textAlign = 'center'; c.fillText(txt, clamp(mid, 90, W - 90), y - (a === b ? -3 : 6)); c.textAlign = 'left'; c.globalAlpha = 1;
    });
  },
};
