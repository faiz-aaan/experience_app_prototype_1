// Films for the bigger-picture pages: all together, models, habit loop, moat, a day at launch.
import { F, rr, seg, easeOut, lerp, clamp, type FilmOpts } from './engine';

const label = (c: CanvasRenderingContext2D, txt: string, x: number, y: number, col: string, size = 12, align: CanvasTextAlign = 'left', w = 600) => {
  c.font = F.m(size, w); c.fillStyle = col; c.textAlign = align; c.fillText(txt, x, y); c.textAlign = 'left';
};

/* ---------- All together: one conversation, follow-ups re-run only what they need ---------- */
const STAGES = ['Understand', 'Ask?', 'Narrow', 'Rank', 'Combine', 'Check', 'Explain'];
const TURNS: { say: string; kind: string; from: number; card: [string, string, boolean][] }[] = [
  { say: 'Veg dinner for 4 tonight, under ₹500 each. Something sweet on the way home. Back by 10.', kind: 'NEW PLAN', from: 2, card: [['who', '4 people', true], ['find', 'dinner + dessert on the way', true], ['must', 'veg · ₹500 each · home by 10', true], ['likes', 'South Indian, calm (notebook)', true]] },
  { say: 'Make it somewhere livelier.', kind: 'CHANGE OF TASTE', from: 3, card: [['who', '4 people', false], ['find', 'dinner + dessert on the way', false], ['must', 'veg · ₹500 each · home by 10', false], ['likes', 'lively, South Indian', true]] },
  { say: 'Is the thali place open late?', kind: 'QUESTION', from: 7, card: [['who', '4 people', false], ['find', 'dinner + dessert on the way', false], ['must', 'veg · ₹500 each · home by 10', false], ['likes', 'lively, South Indian', false]] },
  { say: 'Scrap it. We’re 10 now, dinner only, near Besant Nagar.', kind: 'SCRAP AND RESTART', from: 1, card: [['who', '10 people', true], ['find', 'dinner only', true], ['must', 'veg · home by 10 (carried over, said aloud)', true], ['likes', 'lively, South Indian', false]] },
  { say: 'Let’s do the second one.', kind: 'CHOOSE', from: 7, card: [['who', '10 people', false], ['find', 'dinner: chosen', true], ['must', 'veg · home by 10', false], ['likes', 'lively, South Indian', false]] },
];
const TS = 4.2;
export const togetherFilm: FilmOpts = {
  dur: TURNS.length * TS + 2.4, still: 3 * TS + 3.9, ratio: 0.55, tall: 1.25,
  caps: [
    [0, 'A new plan: there’s no card yet, so the AI writes one and every stage runs.'],
    [TS, '“Livelier” changes one taste. The search and the rules are reused; only ranking and what follows run again.'],
    [2 * TS, 'A question changes nothing. The answer is a fact already fetched, so no planning runs.'],
    [3 * TS, 'A scrap with a new group size and area: one question first (budget for 10 changes the picks), then a fresh search. Today’s deadline carries over and is said out loud.'],
    [4 * TS, 'Choosing ends planning. The plan goes to the map, and the learner asks tomorrow how it went.'],
    [5 * TS, 'The chat can go anywhere. The card keeps the machine steady and each follow-up cheap.'],
  ],
  draw(c, t, W, H, nar, P) {
    const i = Math.min(TURNS.length - 1, Math.floor(t / TS)), lt = t - i * TS, m = TURNS[i], outro = t >= TURNS.length * TS;
    const pad = nar ? 22 : 36;
    const bw = nar ? W - 2 * pad : W * 0.44; c.globalAlpha = outro ? 1 : seg(lt, 0, 0.35);
    c.font = F.b(nar ? 16 : 18, 500); const words = m.say.split(' '); const lines: string[] = []; let cur = '';
    words.forEach((w) => { const tr = cur ? cur + ' ' + w : w; if (c.measureText(tr).width > bw - 40 && cur) { lines.push(cur); cur = w; } else cur = tr; }); lines.push(cur);
    const bh = 30 + lines.length * 24; rr(c, pad, 20, bw, bh, 14); c.fillStyle = P.rice; c.fill(); c.fillStyle = P.door; lines.forEach((l, k) => c.fillText(l, pad + 20, 48 + k * 24));
    c.globalAlpha = outro ? 1 : seg(lt, 0.4, 0.8); label(c, m.kind, pad, 20 + bh + 28, P.turmeric, 12, 'left', 700); label(c, `MESSAGE ${i + 1} OF ${TURNS.length}`, pad + 190, 20 + bh + 28, P.muted, 10, 'left', 400); c.globalAlpha = 1;
    const cx = nar ? pad : W * 0.52, cy = nar ? 20 + bh + 52 : 20, cw = nar ? W - 2 * pad : W * 0.48 - pad, rh = 36;
    rr(c, cx, cy, cw, 40 + m.card.length * rh, 12); c.strokeStyle = P.line; c.lineWidth = 1.5; c.stroke(); label(c, 'THE CARD', cx + 16, cy + 24, P.muted, 10);
    m.card.forEach(([k, v, ch], r) => { const y = cy + 36 + r * rh; if (ch && lt > 0.9 && !outro) { c.globalAlpha = 0.18 * (1 - seg(lt, 1, 2.6) * 0.5); c.fillStyle = P.turmeric; rr(c, cx + 8, y + 2, cw - 16, rh - 4, 6); c.fill(); c.globalAlpha = 1; } label(c, k, cx + 16, y + 23, P.muted, 11, 'left', 400); c.font = F.b(nar ? 13 : 14, ch && lt > 0.9 ? 700 : 500); c.fillStyle = P.rice; c.fillText(v, cx + (nar ? 76 : 90), y + 23); });
    const sy = H - 62, sx = pad, sw = W - 2 * pad, gw = 6, segw = (sw - gw * 6) / 7;
    STAGES.forEach((n, k) => {
      const runs = k === 0 || k === 6 || (m.from <= 5 && (k >= m.from || (k === 1 && m.from <= 2) || (k === 1 && m.kind === 'SCRAP AND RESTART')));
      const reused = !runs && m.from <= 5 && k > 1 && k < m.from;
      const x = sx + k * (segw + gw), on = outro ? 0 : seg(lt, 1.3 + k * 0.14, 1.5 + k * 0.14);
      rr(c, x, sy, segw, 10, 5); c.fillStyle = P.line; c.fill();
      if (runs && on > 0) { c.globalAlpha = on; rr(c, x, sy, segw * on, 10, 5); c.fillStyle = k === 0 || k === 6 ? P.turmeric : P.code; c.fill(); c.globalAlpha = 1; }
      if (reused && on > 0) { c.globalAlpha = on; c.fillStyle = P.muted; for (let q = 0; q < segw - 4; q += 10) c.fillRect(x + q, sy + 3, 5, 4); c.globalAlpha = 1; }
      c.textAlign = 'center'; c.font = F.b(nar ? 11 : 13, runs && on > 0 ? 700 : 500); c.fillStyle = runs && on > 0 ? P.rice : P.muted; c.fillText(n, x + segw / 2, sy + 30);
      if (on > 0) label(c, runs ? (k === 0 || k === 6 ? 'AI' : 'RUNS') : reused ? 'REUSED' : 'SKIPPED', x + segw / 2, sy + 46, P.muted, 9, 'center');
      c.textAlign = 'left';
    });
    if (outro) { const a = seg(t, TURNS.length * TS + 0.2, TURNS.length * TS + 0.8); c.globalAlpha = a * 0.92; c.fillStyle = P.door; c.fillRect(0, 0, W, H); c.globalAlpha = a; c.textAlign = 'center'; c.font = F.d(nar ? 26 : 40, 800); c.fillStyle = P.rice; c.fillText('Five messages. Two full searches.', W / 2, H / 2 - 8); c.font = F.d(nar ? 18 : 24, 500); c.fillStyle = P.turmeric; c.fillText('The rest reused what was already done.', W / 2, H / 2 + 30); c.textAlign = 'left'; c.globalAlpha = 1; }
  },
};

/* ---------- Models: what changes as the city grows ---------- */
const GST: [string, string][] = [['50 people', 'day one'], ['1,000 people', 'a few months'], ['5,000 people', 'a year in'], ['50,000 people', 'many cities']];
const GROWS: [string, string, string, string, string, string][] = [
  ['Understand + explain', 'AI model', 'AI model', 'AI model', 'smaller tuned AI', 'ai'],
  ['Fences + facts', 'code', 'code', 'code', 'code', 'fix'],
  ['Route solver', 'exact search', 'exact search', 'exact search', 'OR-Tools', 'fix'],
  ['Matching by feel', 'tags', 'embeddings', 'embeddings', 'embeddings', 'ai'],
  ['Ranking', 'rules', 'rules + stats', 'trees*', 'deep model*', 'ml'],
  ['Wild cards', 'fixed mix', 'bandit', 'bandit', 'bandit', 'ml'],
  ['Change of taste', 'listen + catch-up', '+ meter', '+ meter', '+ sequence model*', 'ml'],
];
export const modelsFilm: FilmOpts = {
  dur: 21.5, still: 21.4, ratio: 0.56, tall: 1.2,
  caps: [
    [0, 'Day one, 50 people: the AI model listens and explains. Everything else is code and rules.'],
    [5, 'Around 1,000 people: embeddings match by feel, and a small statistics model starts sharpening the ranking.'],
    [10, 'Around 5,000 people: gradient-boosted trees may take over ranking, only if they win a live test.'],
    [15, 'Many cities: maybe deeper models for ranking and taste change. Still only where they win.'],
    [18.5, 'What never changes: fences, facts and the route solver. They have right answers, so they stay code.'],
  ],
  draw(c, t, W, H, nar, P) {
    const st = Math.min(3, Math.floor(t / 5)), lt = t - st * 5, top = nar ? 92 : 84, lw = nar ? 140 : 220, colX = nar ? lw + 12 : lw + 30, rh = (H - top - 34) / GROWS.length, sw = (W - colX - 16) / 4;
    GST.forEach(([n, s], k) => { const x = colX + k * sw; c.globalAlpha = k <= st ? 1 : 0.35; c.font = F.d(nar ? 13 : 19, 800); c.fillStyle = k === st ? P.rice : P.muted; c.fillText(n, x, nar ? 34 : 36); label(c, s, x, nar ? 52 : 56, P.muted, nar ? 9 : 11, 'left', 400); c.globalAlpha = 1; });
    c.fillStyle = P.line; rr(c, colX, nar ? 64 : 68, W - colX - 20, 5, 3); c.fill(); c.fillStyle = P.turmeric; rr(c, colX, nar ? 64 : 68, Math.min(W - colX - 20, (st + Math.min(1, lt / 4.4)) * sw), 5, 3); c.fill();
    GROWS.forEach(([name, a, b, cc, d, kind], r) => {
      const y = top + r * rh, vals = [a, b, cc, d];
      c.font = F.b(nar ? 12 : 15, 700); c.fillStyle = P.rice; c.fillText(name, nar ? 10 : 22, y + rh * 0.55);
      if (kind === 'fix') label(c, 'NEVER LEARNED', nar ? 10 : 22, y + rh * 0.55 + (nar ? 13 : 16), P.turmeric, nar ? 8 : 9.5, 'left', 700);
      for (let k = 0; k <= st; k++) {
        const v = vals[k], changed = k > 0 && v !== vals[k - 1], ap = k < st ? 1 : seg(lt, 0.3, 1); if (ap <= 0) continue;
        const isML = /stats|trees|deep|bandit|meter|sequence/.test(v), isAI = /AI|embed/.test(v);
        c.font = F.m(nar ? 9.5 : 11.5, 600); const tw = Math.min(sw - 8, c.measureText(v).width + (nar ? 12 : 18));
        c.globalAlpha = ap * (changed ? 1 : 0.32); rr(c, colX + k * sw, y + rh * 0.2, tw, rh * 0.58, 6); c.fillStyle = isML ? P.code : isAI ? P.turmeric : '#5C5C5C'; c.fill();
        c.globalAlpha = ap; c.fillStyle = changed ? '#0B0B0B' : P.rice; if (changed && isML) c.fillStyle = '#FFFFFF'; c.fillText(v, colX + k * sw + (nar ? 6 : 9), y + rh * 0.58); c.globalAlpha = 1;
      }
    });
    label(c, '* only if it beats the step before it in a live test', nar ? 10 : 22, H - 12, P.muted, nar ? 9 : 11, 'left', 400);
  },
};

/* ---------- Habit: the weekly loop ---------- */
const LOOP: [string, string][] = [['Thursday nudge', '“free this weekend?”'], ['One-line ask', '“something new, 3 of us”'], ['Plan with friends', '2 friends say yes'], ['Go', 'out in the city'], ['Recap', '“best part: the food”'], ['Notebook grows', 'next plan is better']];
export const habitFilm: FilmOpts = {
  dur: 14, still: 13.9, ratio: 0.5, tall: 1.05,
  caps: [
    [0, 'Thursday evening, a nudge arrives at the moment people actually plan their weekend.'],
    [2, 'One line is enough to get a plan. Almost no effort.'],
    [4, 'Friends vote and commit. A plan with a time and people who said yes is far more likely to happen.'],
    [6, 'The reward happens out in the city, not on the screen.'],
    [8, 'Next day, a recap card. People remember the best moment and the ending.'],
    [10, 'The notebook grows. The next plan is a little better, and the app is a little harder to leave.'],
  ],
  draw(c, t, W, H, nar, P) {
    const cx = W / 2, cy = H / 2 + 4, R = nar ? Math.min(W * 0.3, H * 0.3) : Math.min(W * 0.2, H * 0.34), n = LOOP.length, cyc = Math.min(1, t / 12);
    c.strokeStyle = P.line; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, R, 0, 7); c.stroke();
    c.strokeStyle = P.turmeric; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + cyc * Math.PI * 2); c.stroke();
    label(c, 'ONE WEEK', cx, cy + 4, P.muted, 11, 'center');
    LOOP.forEach(([a, b], k) => {
      const an = -Math.PI / 2 + (k / n) * Math.PI * 2, x = cx + Math.cos(an) * R, y = cy + Math.sin(an) * R, on = t >= k * 2;
      c.globalAlpha = on ? 1 : 0.3; c.beginPath(); c.arc(x, y, 9, 0, 7); c.fillStyle = on ? (k === 3 ? P.code : P.turmeric) : P.door; c.fill(); c.strokeStyle = on ? P.rice : P.line; c.lineWidth = 2; c.stroke();
      const lx = x + Math.cos(an) * (nar ? 18 : 28), ly = y + Math.sin(an) * (nar ? 22 : 26), align: CanvasTextAlign = Math.cos(an) > 0.3 ? 'left' : Math.cos(an) < -0.3 ? 'right' : 'center', up = Math.sin(an) < -0.5;
      c.textAlign = align; c.font = F.b(nar ? 12 : 14, 700); c.fillStyle = P.rice; c.fillText(a, lx, ly + (up ? -10 : 4)); c.font = F.b(nar ? 10.5 : 12, 400); c.fillStyle = P.muted; c.fillText(b, lx, ly + (up ? 6 : 20)); c.textAlign = 'left'; c.globalAlpha = 1;
    });
  },
};

/* ---------- Moat: the flywheel ---------- */
const FLY = ['More outings', 'More outcome data', 'Better picks', 'More trust'];
export const moatFilm: FilmOpts = {
  dur: 12, still: 11.9, ratio: 0.48, tall: 0.95,
  caps: [
    [0, 'Every outing tells us something Google doesn’t know: who went, with whom, and whether they loved it.'],
    [3, 'That outcome data makes the next picks better for this person and people like them.'],
    [6, 'Better picks earn more trust, and trust brings more outings.'],
    [9, 'A competitor can copy features. It can’t copy years of outcomes, confirmed facts and clubs.'],
  ],
  draw(c, t, W, H, nar, P) {
    const cx = W / 2, cy = H / 2, r = nar ? Math.min(W * 0.26, H * 0.28) : Math.min(W * 0.16, H * 0.32), spin = t * (0.35 + 0.25 * seg(t, 3, 11));
    c.strokeStyle = P.turmeric; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, r, 0, 7); c.stroke();
    for (let k = 0; k < 4; k++) { const an = spin + (k * Math.PI) / 2; c.fillStyle = P.turmeric; c.beginPath(); c.arc(cx + Math.cos(an) * r, cy + Math.sin(an) * r, 7, 0, 7); c.fill(); }
    label(c, 'THE MOAT', cx, cy - 4, P.turmeric, 12, 'center', 700); c.font = F.b(nar ? 11 : 13, 500); c.fillStyle = P.muted; c.textAlign = 'center'; c.fillText('grows only through use', cx, cy + 16); c.textAlign = 'left';
    FLY.forEach((s, k) => { const an = -Math.PI / 2 + (k * Math.PI) / 2, a = seg(t, k * 2.2, k * 2.2 + 0.6); if (a <= 0) return; c.globalAlpha = a; const side = Math.round(Math.cos(an)); const x = cx + Math.cos(an) * (r + 14), y = cy + Math.sin(an) * (r + (nar ? 20 : 26)); c.textAlign = side > 0 ? 'left' : side < 0 ? 'right' : 'center'; c.font = F.b(nar ? 13 : 16, 700); c.fillStyle = P.rice; c.fillText(s, x, y + 5); c.textAlign = 'left'; c.globalAlpha = 1; });
  },
};

/* ---------- A day at launch ---------- */
const DAY: [string, string, string, number][] = [
  ['Thu 6:40 pm', 'Nudge', '“Free this weekend? Three ideas near you.”', 0],
  ['Sat 5:10 pm', 'Ask', '“Veg dinner for 4, sweet on the way, back by 10.”', 2.6],
  ['Sat 5:10 pm', 'Plan', 'Kaveri thali 7:30 · Malli sweets 9:05 · home 9:40', 5.2],
  ['Sat 5:14 pm', 'Friends', '3 of 3 friends said yes. Pinned on everyone’s map.', 7.8],
  ['Sat 7:05 pm', 'Re-check', 'Still open, traffic normal, leave by 7:15.', 10.4],
  ['Sun 10:00 am', 'Recap', '“How was it?” “The sweets were the best part.”', 13],
  ['Sun 10:01 am', 'Notebook', '+ loves dessert stops with friends (tentative)', 15.6],
];
export const launchFilm: FilmOpts = {
  dur: 19, still: 18.9, ratio: 0.56, tall: 1.3,
  caps: [
    [0, 'Thursday evening: one well-timed nudge, not a feed to scroll.'],
    [2.6, 'Saturday: one sentence is the whole input.'],
    [5.2, 'A checked plan comes back in about a second, with facts printed from data.'],
    [7.8, 'Friends join the plan. Commitment makes it far more likely to happen.'],
    [10.4, 'Before leaving, hours and traffic are checked again.'],
    [13, 'Next morning, one question. The answer becomes a tentative note in the notebook.'],
  ],
  draw(c, t, W, H, nar, P) {
    const pad = nar ? 20 : 40, x0 = pad + (nar ? 96 : 150), top = 34, rh = (H - top - 20) / DAY.length;
    c.strokeStyle = P.line; c.lineWidth = 2; c.beginPath(); c.moveTo(x0, top); c.lineTo(x0, H - 20); c.stroke();
    DAY.forEach(([time, k, txt, at], i) => {
      const a = seg(t, at, at + 0.7); if (a <= 0) return; const y = top + i * rh + rh * 0.45; c.globalAlpha = a;
      label(c, time, x0 - 16, y + 4, P.muted, nar ? 9.5 : 11, 'right', 400);
      c.fillStyle = i === 2 ? P.turmeric : i === 4 ? P.code : P.rice; c.beginPath(); c.arc(x0, y, 7, 0, 7); c.fill();
      label(c, k.toUpperCase(), x0 + 22, y - 8, i === 2 ? P.turmeric : P.muted, nar ? 9.5 : 11, 'left', 700);
      c.font = F.b(nar ? 12.5 : 16, 500); c.fillStyle = P.rice; c.fillText(txt, x0 + 22, y + 13 + (1 - easeOut(a)) * 6);
      c.globalAlpha = 1;
    });
  },
};
