// Films for the algorithm pages. Every one is drawn live from simple, stated rules; names and numbers are illustrative.
import { F, rr, rng, seg, easeOut, easeInOut, lerp, clamp, type FilmOpts, type Pal } from './engine';

const label = (c: CanvasRenderingContext2D, txt: string, x: number, y: number, col: string, size = 12, align: CanvasTextAlign = 'left') => {
  c.font = F.m(size, 600); c.fillStyle = col; c.textAlign = align; c.fillText(txt, x, y); c.textAlign = 'left';
};
const chip = (c: CanvasRenderingContext2D, x: number, y: number, txt: string, fg: string, bg: string, size = 13) => {
  c.font = F.b(size, 700); const w = c.measureText(txt).width + 22; rr(c, x, y - 15, w, 28, 14); c.fillStyle = bg; c.fill(); c.fillStyle = fg; c.fillText(txt, x + 11, y + 4); return w;
};

/* ---------- Mix and variety (safe, stretch, wild + MMR) ---------- */
const MIX = (() => {
  const r = rng(21);
  const groups: [string, number, number, number[], number][] = [['dosa and thali', .26, .34, [.92, .9, .89, .87, .85], .1], ['by the sea', .72, .3, [.86, .8, .74], .3], ['hands-on', .3, .74, [.78, .7, .66], .8], ['with friends', .74, .74, [.72, .64, .6], .5], ['culture', .52, .52, [.6, .55], .7]];
  const it: { g: number; x: number; y: number; rel: number; nov: number }[] = [];
  groups.forEach(([, cx, cy, rels, nov], gi) => rels.forEach((rel) => { const a = r() * 6.28, d = .015 + r() * .05; it.push({ g: gi, x: cx + Math.cos(a) * d * 1.3, y: cy + Math.sin(a) * d, rel, nov: clamp(nov + (r() - .5) * .2) }); }));
  const sim = (a: typeof it[0], b: typeof it[0]) => Math.exp(-((a.x - b.x) ** 2 + (a.y - b.y) ** 2) / (2 * .08 * .08));
  const picks: number[] = []; const eff: number[][] = [it.map((d) => d.rel)];
  const pickBy = (f: (d: typeof it[0], i: number) => number) => { let b = -1, bv = -9; it.forEach((d, i) => { if (picks.includes(i)) return; const v = f(d, i); if (v > bv) { bv = v; b = i; } }); picks.push(b); };
  const ms = (d: typeof it[0]) => (picks.length ? Math.max(...picks.map((p) => sim(d, it[p]))) : 0);
  pickBy((d) => d.rel);
  eff.push(it.map((d) => clamp((.55 * d.rel - .45 * ms(d)) / .55)));
  pickBy((d) => .6 * d.rel + .4 * d.nov - .5 * ms(d));
  eff.push(it.map((d) => clamp((.55 * d.rel - .45 * ms(d)) / .55)));
  pickBy((d) => (d.rel >= .55 ? .3 * d.rel + .7 * d.nov - .5 * ms(d) : -9));
  eff.push(it.map((d) => clamp((.55 * d.rel - .45 * ms(d)) / .55)));
  const top3 = it.map((_, i) => i).sort((a, b) => it[b].rel - it[a].rel).slice(0, 3);
  return { it, groups, picks, eff, top3 };
})();
export const mixFilm: FilmOpts = {
  dur: 15, still: 14.8, ratio: 0.52, tall: 0.95,
  caps: [
    [0, 'Every allowed idea, placed by its feel. Bigger means a better match for this person tonight.'],
    [3, 'Plain ranking takes the three biggest. They are all dosa and thali places: good, but the same evening three times.'],
    [7, 'The mix picks a safe bet first: the best match.'],
    [8.6, 'Anything too similar to it shrinks. Being like something already picked makes it less useful now.'],
    [10, 'A stretch next: still a strong match, a little newer for this person.'],
    [12.2, 'Then a wild card: new to them, but only from ideas that still fit their taste. Random picks are never allowed.'],
  ],
  draw(c, t, W, H, nar, P) {
    const pad = 40, X = (x: number) => pad + x * (W - 2 * pad), Y = (y: number) => 26 + y * (H - 120);
    MIX.groups.forEach(([g, cx, cy]) => label(c, g.toUpperCase(), X(cx), Y(cy) - (nar ? 44 : 52), P.muted, nar ? 11 : 12, 'center'));
    const pickT = [7, 10, 12.2], roles = ['SAFE', 'STRETCH', 'WILD'], cols = [P.code, P.turmeric, '#FFFFFF'];
    const plain = seg(t, 3, 3.4) * (1 - seg(t, 6.6, 7));
    const stage = t >= 12.2 ? 3 : t >= 10 ? 2 : t >= 7 ? 1 : 0;
    MIX.it.forEach((d, i) => {
      let v = d.rel;
      if (stage > 0) { const k = easeOut(seg(t, pickT[stage - 1] + .3, pickT[stage - 1] + 1.2)); v = lerp(MIX.eff[stage - 1][i], MIX.eff[stage][i], k); if (stage === 1) v = lerp(d.rel, MIX.eff[1][i], k); }
      const r = (nar ? 5 : 6) + (nar ? 18 : 22) * Math.max(.03, v) ** 1.4;
      c.globalAlpha = seg(t, i * .07, i * .07 + .6) * .85; c.fillStyle = P.rice; c.beginPath(); c.arc(X(d.x), Y(d.y), r, 0, 7); c.fill();
      const tp = MIX.top3.indexOf(i);
      if (tp > -1 && plain > 0) { c.globalAlpha = plain; c.strokeStyle = P.kumkum; c.lineWidth = 3; c.beginPath(); c.arc(X(d.x), Y(d.y), r + 6, 0, 7); c.stroke(); }
      const pk = MIX.picks.indexOf(i);
      if (pk > -1 && t >= pickT[pk]) { const k = seg(t, pickT[pk], pickT[pk] + .4); c.globalAlpha = k; c.strokeStyle = cols[pk]; c.lineWidth = 3; c.beginPath(); c.arc(X(d.x), Y(d.y), r + 6, 0, 7); c.stroke(); label(c, roles[pk], X(d.x), Y(d.y) - r - 12, cols[pk], 11, 'center'); }
    });
    c.globalAlpha = 1;
    const yb = H - 40;
    if (plain > 0) { c.globalAlpha = plain; label(c, 'PLAIN RANKING', pad, yb + 5, P.muted, nar ? 11 : 12); let x = pad + (nar ? 120 : 150); ['dosa', 'thali', 'dosa'].forEach((s) => { x += chip(c, x, yb, s, P.door, P.kumkum, nar ? 12 : 13) + 8; }); c.globalAlpha = 1; }
    if (t >= 7) { label(c, 'THE MIX', pad, yb + 5, P.muted, nar ? 11 : 12); let x = pad + (nar ? 120 : 150); ['dosa place', 'sea-view café', 'pottery night'].forEach((s, k) => { if (t < pickT[k]) return; c.globalAlpha = seg(t, pickT[k], pickT[k] + .4); x += chip(c, x, yb, s, P.door, cols[k], nar ? 12 : 13) + 8; }); c.globalAlpha = 1; }
  },
};

/* ---------- Route puzzle and evening arc ---------- */
const RT = (() => {
  const home = { x: .2, y: .78 };
  const D = [{ x: .55, y: .22, n: 'Kaveri thali', close: 23, s: 9 }, { x: .82, y: .3, n: 'Annam meals', close: 21, s: 8 }, { x: .4, y: .4, n: 'Malli dosa', close: 22.5, s: 7 }];
  const S = [{ x: .44, y: .7, n: 'Malli sweets', s: 8 }, { x: .88, y: .72, n: 'Kulfi cart', s: 9 }, { x: .3, y: .25, n: 'Nila ice cream', s: 6 }];
  const tries = [
    { d: 1, s: 1, ok: false, why: 'home 10:20, late' },
    { d: 0, s: 2, ok: false, why: 'dessert out of the way' },
    { d: 2, s: 0, ok: false, why: 'lower score' },
    { d: 0, s: 0, ok: true, why: 'home 9:40, best score' },
  ];
  return { home, D, S, tries };
})();
export const routeFilm: FilmOpts = {
  dur: 18, still: 17.8, ratio: 0.56, tall: 1.2,
  caps: [
    [0, 'Home, the best dinner places and the best dessert stops from the ranking stage. Each has a score for this person.'],
    [3, 'One request to Google returns the travel time between every pair. Google can’t choose stops; it only measures.'],
    [6, 'The solver tries each dinner with each dessert, in order. A plan that gets home late is out.'],
    [8.5, 'Dessert must be on the way home: a big detour is out.'],
    [11, 'Among the plans that fit, the best total score wins. Dessert after dinner is the evening arc: a sweet start would be penalised.'],
    [14, 'The timeline: dinner 7:30, dessert 9:05, home 9:40, with a traffic buffer before 10.'],
  ],
  draw(c, t, W, H, nar, P) {
    const mT = 20, mB = H - (nar ? 150 : 110), X = (x: number) => 40 + x * (W - 80), Y = (y: number) => mT + y * (mB - mT);
    const all = [RT.home, ...RT.D, ...RT.S];
    // matrix
    const mx = seg(t, 3, 4) * (1 - seg(t, 5.6, 6.2));
    if (mx > 0) { c.globalAlpha = mx * .25; c.strokeStyle = P.rice; c.lineWidth = 1; all.forEach((a, i) => all.forEach((b, j) => { if (j <= i) return; c.beginPath(); c.moveTo(X(a.x), Y(a.y)); c.lineTo(X(b.x), Y(b.y)); c.stroke(); })); c.globalAlpha = mx; label(c, '7 POINTS · 21 TRAVEL TIMES · 1 REQUEST', 40, mB + 28, P.turmeric, nar ? 11 : 12); c.globalAlpha = 1; }
    // tries
    const path = (d: number, s: number) => { const pts = [RT.home, RT.D[d], RT.S[s], RT.home]; c.beginPath(); c.moveTo(X(pts[0].x), Y(pts[0].y)); for (let i = 1; i < 4; i++) c.lineTo(X(pts[i].x), Y(pts[i].y)); };
    const tt = [6, 8.5, 10, 11.5];
    RT.tries.forEach((tr, k) => {
      const on = seg(t, tt[k], tt[k] + .4), off = tr.ok ? 0 : seg(t, tt[k] + 1.6, tt[k] + 2.2);
      if (on <= 0 || off >= 1) return;
      c.globalAlpha = on * (1 - off); c.strokeStyle = tr.ok ? P.turmeric : P.kumkum; c.lineWidth = tr.ok ? 3.5 : 2; c.setLineDash(tr.ok ? [] : [6, 6]); path(tr.d, tr.s); c.stroke(); c.setLineDash([]);
      const m = RT.D[tr.d]; label(c, (tr.ok ? '✓ ' : '✕ ') + tr.why, X(m.x), Y(m.y) - 34, tr.ok ? P.turmeric : P.kumkum, nar ? 11 : 12, m.x > .7 ? 'right' : 'left');
      c.globalAlpha = 1;
    });
    // points
    const pt = (p: { x: number; y: number; n: string; s?: number }, col: string, k: number) => {
      const a = seg(t, k * .25, k * .25 + .5); if (a <= 0) return; c.globalAlpha = a;
      c.fillStyle = col; c.beginPath(); c.arc(X(p.x), Y(p.y), 8, 0, 7); c.fill();
      c.font = F.b(nar ? 12 : 13, 600); c.fillStyle = P.rice; c.textAlign = 'center'; c.fillText(p.n, X(p.x), Y(p.y) + 24); if (p.s) { c.font = F.m(10); c.fillStyle = P.muted; c.fillText('score ' + p.s, X(p.x), Y(p.y) + 38); } c.textAlign = 'left'; c.globalAlpha = 1;
    };
    pt({ ...RT.home, n: 'Home' }, P.rice, 0); RT.D.forEach((d, i) => pt(d, P.code, i + 1)); RT.S.forEach((s, i) => pt(s, '#FFFFFF', i + 4));
    // timeline
    const ta = seg(t, 14, 14.6); if (ta > 0) {
      c.globalAlpha = ta; const tl = 40, tr = W - 40, ty = H - (nar ? 70 : 46), x = (h: number) => tl + (h - 19) / 3 * (tr - tl);
      c.fillStyle = P.line; rr(c, tl, ty - 4, tr - tl, 8, 4); c.fill();
      const segs: [number, number, string, string][] = [[19.25, 19.5, P.muted, ''], [19.5, 20.75, P.code, 'Dinner'], [20.75, 21.08, P.muted, ''], [21.08, 21.42, '#FFFFFF', 'Dessert'], [21.42, 21.67, P.muted, '']];
      segs.forEach(([a, b, col, n]) => { c.fillStyle = col; rr(c, x(a), ty - (n ? 9 : 2), x(b) - x(a), n ? 18 : 4, 4); c.fill(); if (n) { c.font = F.b(11, 700); c.fillStyle = P.door; c.fillText(n, x(a) + 6, ty + 4); } });
      label(c, '7 PM', tl, ty + 26, P.muted, 10); label(c, 'HOME 9:40', x(21.67), ty - 16, P.turmeric, 10, 'center'); label(c, 'DEADLINE 10', tr, ty + 26, P.kumkum, 10, 'right');
      c.strokeStyle = P.kumkum; c.lineWidth = 2; c.beginPath(); c.moveTo(tr, ty - 12); c.lineTo(tr, ty + 12); c.stroke(); c.globalAlpha = 1;
    }
  },
};

/* ---------- Rest period ---------- */
export const restFilm: FilmOpts = {
  dur: 14, still: 13.8, ratio: 0.5, tall: 0.95,
  caps: [
    [0, 'You loved Kaveri thali place last Friday. Without a rest, its high score makes it the safe bet again next week.'],
    [3, 'So every visited place gets a rest penalty that fades. Loved: back in rotation after about a month.'],
    [6.5, 'Liked but not loved: it rests longer, about two months. Disliked: never suggested again.'],
    [9.5, 'Clubs are the opposite. Going back is the goal, so a club you liked gets a small bonus instead.'],
    [12, 'You can always override it: “take me back to Kaveri” is a pin, and pins beat the rest.'],
  ],
  draw(c, t, W, H, nar, P) {
    const L = nar ? 54 : 70, R = W - (nar ? 24 : 200), T = 40, B = H - 60; const X = (d: number) => L + d / 90 * (R - L), Y = (v: number) => lerp(B, T, (v + .2) / .95);
    c.strokeStyle = P.line; c.lineWidth = 1; for (let d = 0; d <= 90; d += 15) { c.beginPath(); c.moveTo(X(d), T); c.lineTo(X(d), B); c.stroke(); label(c, d + 'd', X(d), B + 20, P.muted, 10, 'center'); }
    c.beginPath(); c.moveTo(L, Y(0)); c.lineTo(R, Y(0)); c.strokeStyle = P.muted; c.stroke(); label(c, 'NO EFFECT', L + 4, Y(0) - 6, P.muted, 10);
    label(c, 'RESTING', L - 8, Y(.6), P.muted, 10, 'right'); label(c, 'BONUS', L - 8, Y(-.12), P.muted, 10, 'right');
    const curve = (fn: (d: number) => number, col: string, a0: number, a1: number, name: string) => {
      const k = seg(t, a0, a1); if (k <= 0) return; c.strokeStyle = col; c.lineWidth = 3; c.beginPath();
      for (let d = 0; d <= 90 * k; d += 1) { const y = Y(fn(d)); d === 0 ? c.moveTo(X(d), y) : c.lineTo(X(d), y); } c.stroke();
      if (!nar) { c.font = F.b(13, 700); c.fillStyle = col; c.fillText(name, R + 14, Y(fn(90 * k)) + 4); }
    };
    curve((d) => .7 * Math.exp(-d / 30), P.turmeric, 3, 6, 'Loved: ~1 month');
    curve((d) => .7 * Math.exp(-d / 60), P.code, 6.5, 9.5, 'Liked: ~2 months');
    curve(() => -.15, '#FFFFFF', 9.5, 11.5, 'Club: bonus');
    if (nar) { [['Loved', P.turmeric, 3], ['Liked', P.code, 6.5], ['Club', '#FFFFFF', 9.5]].forEach(([n, col, at], i) => { if (t > (at as number)) { c.fillStyle = col as string; c.font = F.b(12, 700); c.fillText(n as string, L + i * 90, H - 18); } }); }
    if (t > 12) { const a = seg(t, 12, 12.6); c.globalAlpha = a; chip(c, nar ? L : X(50), T + 14, 'Pinned by you: rest ignored', P.door, P.rice, nar ? 12 : 13); c.globalAlpha = 1; }
  },
};

/* ---------- When to ask a question: three gates ---------- */
const GATES: [string, string, number][] = [
  ['Budget', 'notebook: usually ₹600', 0],
  ['Seats for 4?', 'every option seats 4', 1],
  ['Spice level', 'cheap to fix later', 2],
  ['Indoor or out?', 'same picks either way', 1],
  ['Budget for 10', 'changes picks, costly', 3],
];
export const askFilm: FilmOpts = {
  dur: GATES.length * 2.4 + 4, still: GATES.length * 2.4 + 3.9, ratio: 0.5, tall: 0.95,
  caps: [
    [0, 'Budget wasn’t said. The notebook knows you usually spend about ₹600. Use it silently.'],
    [2.4, 'Would 4 people fit? Every place still in seats four, so the answer can’t change anything. Don’t ask.'],
    [4.8, 'Spice level matters, but a wrong guess is easy to fix. Guess, and say the guess out loud.'],
    [7.2, 'Indoor or outdoor: tonight’s picks come out the same either way. Don’t ask.'],
    [9.6, 'Now imagine “we’re 10”. A budget guess changes the picks and a wrong one spoils a group dinner. Ask.'],
    [12.4, 'At most one question per reply. The AI only words it; code decides whether to ask.'],
  ],
  draw(c, t, W, H, nar, P) {
    const GX = [.22, .44, .66, .88], yT = H * .32, yB = H * .58, x0 = W * .04, cw = nar ? 120 : 172, ch = nar ? 26 : 30;
    const Q = ['Already known?', 'Changes the picks?', 'Costly if wrong?'], BIN = ['USE SILENTLY', 'DON’T ASK', 'SAY IT ALOUD', 'ASK'], BC = [P.code, P.code, P.turmeric, P.kumkum];
    c.strokeStyle = P.line; c.lineWidth = 3; c.beginPath(); c.moveTo(x0, yT); c.lineTo(W * GX[3], yT); c.stroke();
    Q.forEach((q, i) => { const x = W * GX[i]; c.setLineDash([5, 6]); c.strokeStyle = P.muted; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x, yT - 30); c.lineTo(x, yB - 28); c.stroke(); c.setLineDash([]); label(c, 'GATE ' + (i + 1), x, yT - 58, P.muted, 10, 'center'); c.font = F.b(nar ? 12 : 15, 650); c.fillStyle = P.rice; c.textAlign = 'center'; c.fillText(q, x, yT - 40); c.textAlign = 'left'; });
    BIN.forEach((b, i) => { const x = W * GX[i]; label(c, b, x, yB - 8, BC[i], nar ? 10 : 11, 'center'); c.strokeStyle = BC[i]; c.lineWidth = 2; c.beginPath(); c.moveTo(x - cw / 2, yB); c.lineTo(x + cw / 2, yB); c.stroke(); });
    const bins: string[][] = [[], [], [], []];
    const box = (x: number, y: number, txt: string, col: string) => { rr(c, x - cw / 2, y, cw, ch, 6); c.fillStyle = P.door; c.fill(); c.strokeStyle = col; c.lineWidth = 1.5; c.stroke(); c.font = F.b(nar ? 11.5 : 13.5, 600); c.fillStyle = P.rice; c.textAlign = 'center'; c.fillText(txt, x, y + ch * .68); c.textAlign = 'left'; };
    GATES.forEach(([title, sub, out], i) => {
      const t0 = i * 2.4; if (t < t0) return; const lt = t - t0;
      if (lt >= 2.3) { bins[out].push(title); return; }
      const tx = W * GX[out], travel = 1.2 * (out + 1) / 4 + .2;
      let x, y; if (lt < travel) { x = lerp(x0 + cw / 2, tx, easeOut(lt / travel)); y = yT - ch / 2; } else { x = tx; y = lerp(yT - ch / 2, yB + 10 + bins[out].length * (ch + 6), easeOut(seg(lt, travel, travel + .5))); }
      box(x, y, title, P.rice); if (lt < travel) label(c, sub, clamp(x, cw * .7, W - cw * .7), yT + ch / 2 + 16, P.muted, nar ? 10 : 11, 'center');
    });
    bins.forEach((b, bi) => b.forEach((title, k) => box(W * GX[bi], yB + 10 + k * (ch + 6), title, BC[bi])));
  },
};
