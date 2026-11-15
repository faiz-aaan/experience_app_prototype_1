// Film: fences and magnets, on the running example (veg dinner for 4, under ₹500 each, home by 10).
// Each dot stands for a few real places. All names and numbers are invented for illustration.
import { F, rr, rng, seg, easeOut, easeInOut, lerp, type FilmOpts } from './engine';

const PRE = ['Annam', 'Kaveri', 'Malli', 'Nila', 'Thendral', 'Mullai', 'Vaigai', 'Kurinji', 'Mayil', 'Olai', 'Kadal', 'Sangam'];
// Names follow the facts: veg South Indian, other veg, or non-veg.
const K_SI = ['tiffin house', 'thali place', 'meals hall', 'dosa corner', 'Udupi café'];
const K_VEG = ['millet café', 'Gujarati thali', 'salad bar', 'pizza place'];
const K_NV = ['biryani point', 'grill house', 'seafood shack', 'Chettinad kitchen'];
type Dot = { x: number; y: number; name: string; veg: boolean; cost: number; seats: number; open: boolean; mins: number; si: number; calm: number; lively: number; score: number; fail: number; rank: number };

const FENCES = [
  { key: 'veg', label: 'Vegetarian', test: (d: Dot) => d.veg },
  { key: 'cost', label: 'Under ₹500 each', test: (d: Dot) => d.cost <= 500 },
  { key: 'seats', label: 'Seats 4', test: (d: Dot) => d.seats >= 4 },
  { key: 'open', label: 'Open at 7:30 pm', test: (d: Dot) => d.open },
  { key: 'mins', label: 'Home by 10 (25 min max)', test: (d: Dot) => d.mins <= 25 },
];
const SCALE = 2.5; // each dot ≈ 2.5 places, so 60 dots ≈ 150 places

const dots: Dot[] = (() => {
  const r = rng(11); const out: Dot[] = [];
  for (let i = 0; i < 60; i++) {
    const col = i % 10, row = Math.floor(i / 10);
    const d: Dot = {
      x: col / 9, y: row / 5, name: '',
      veg: r() < 0.62, cost: Math.round((200 + r() * 600) / 10) * 10, seats: r() < 0.88 ? 6 : 2, open: r() < 0.9, mins: Math.round(8 + r() * 30),
      si: r() < 0.55 ? 1 : 0, calm: r(), lively: r(), score: 0, fail: -1, rank: -1,
    };
    const kinds = !d.veg ? K_NV : d.si ? K_SI : K_VEG;
    d.name = `${PRE[(i * 7) % PRE.length]} ${kinds[(i * 3 + row) % kinds.length]}`;
    d.score = 0.5 * d.si + 0.25 * d.calm + 0.25 * d.lively;
    d.fail = FENCES.findIndex((f) => !f.test(d));
    out.push(d);
  }
  const alive = out.filter((d) => d.fail === -1).sort((a, b) => b.score - a.score);
  alive.forEach((d, k) => (d.rank = k));
  return out;
})();
const ALIVE = dots.filter((d) => d.fail === -1).length;
const counts = FENCES.map((_, k) => dots.filter((d) => d.fail === -1 || d.fail > k).length);

const T0 = 2.5, TF = 2.2, TM = T0 + FENCES.length * TF; // fences start, per-fence time, magnets start

export const fencesFilm: FilmOpts = {
  dur: TM + 9, still: TM + 8.8, ratio: 0.56, tall: 1.12,
  caps: [
    [0, 'Tonight’s ask: veg dinner for 4, under ₹500 each, home by 10. About 150 places nearby could serve dinner. Each dot is a few of them.'],
    [T0, 'Fences first. A fence is a yes-or-no rule. Fail one and the place is out, however good it is.'],
    [T0 + TF * 1, 'Under ₹500 each. Price comes from our own cost bands, not from Google.'],
    [T0 + TF * 3, 'Open when you arrive, and close enough to be home by 10.'],
    [TM, `Magnets next. What’s left is scored for this person tonight: their taste, plus what today changes.`],
    [TM + 4.5, 'The best few go on to the next stage. Nothing that broke a fence can ever come back through scoring.'],
  ],
  draw(c, t, W, H, nar, P, idle) {
    const fieldW = nar ? W - 48 : W * 0.56, fx = nar ? 24 : 36, fy = nar ? 150 : 70, fh = nar ? H * 0.42 : H - 120;
    const px = (d: Dot) => fx + 20 + d.x * (fieldW - 40), py = (d: Dot) => fy + 20 + d.y * (fh - 40);
    const fenceIdx = Math.floor((t - T0) / TF);
    const mk = seg(t, TM, TM + 1.6); // move into ranking
    // side panel: fence list with live counts
    const sx = nar ? 24 : fx + fieldW + 36, sy = nar ? 24 : 70;
    c.font = F.m(12, 600); c.fillStyle = P.muted; c.fillText(t < TM ? 'FENCES' : 'MAGNETS', sx, sy);
    if (t < TM + 0.6) {
      const a = 1 - seg(t, TM, TM + 0.6);
      c.globalAlpha = a;
      const n0 = Math.round(60 * SCALE);
      const shown = t < T0 ? n0 : Math.round(counts[Math.min(FENCES.length - 1, Math.max(0, fenceIdx))] * SCALE);
      c.font = F.d(nar ? 40 : 54, 800); c.fillStyle = P.rice; c.fillText(String(shown), sx, sy + (nar ? 46 : 60));
      c.font = F.b(nar ? 13 : 15, 500); c.fillStyle = P.muted; c.fillText('places still in', sx + (nar ? 82 : 108), sy + (nar ? 44 : 58));
      FENCES.forEach((f, k) => {
        const on = t >= T0 + k * TF, y = sy + (nar ? 74 : 104) + k * (nar ? 22 : 34);
        c.globalAlpha = a * (on ? 1 : 0.32);
        c.fillStyle = on ? P.kumkum : P.muted; c.beginPath(); c.arc(sx + 6, y - 5, 5, 0, 7); c.fill();
        c.font = F.b(nar ? 13 : 16, on ? 700 : 500); c.fillStyle = P.rice; c.fillText(f.label, sx + 20, y);
        if (on) { c.font = F.m(nar ? 10 : 12); c.fillStyle = P.muted; c.textAlign = 'right'; c.fillText(String(Math.round(counts[k] * SCALE)), sx + (nar ? W - 48 : W - sx - 36), y); c.textAlign = 'left'; }
      });
      c.globalAlpha = 1;
    }
    if (t >= TM) {
      const a = seg(t, TM + 0.4, TM + 1.2); c.globalAlpha = a;
      const mags = [['South Indian', 'your taste'], ['Calm', 'your taste'], ['Lively', '4 friends tonight']];
      mags.forEach(([m, why], k) => {
        const y = sy + (nar ? 30 : 46) + k * (nar ? 26 : 36);
        c.fillStyle = P.code; c.beginPath(); c.arc(sx + 6, y - 5, 5, 0, 7); c.fill();
        c.font = F.b(nar ? 14 : 17, 700); c.fillStyle = P.rice; c.fillText(m, sx + 20, y);
        c.font = F.m(nar ? 10 : 11); c.fillStyle = P.muted; c.fillText(why, sx + (nar ? 150 : 170), y);
      });
      c.globalAlpha = 1;
    }
    // the dots
    const rowH = Math.min(nar ? 22 : 26, (fh - 10) / ALIVE);
    dots.forEach((d) => {
      let x = px(d), y = py(d), r = 5.2 + Math.sin(idle * 1.4 + d.x * 6 + d.y * 4) * 0.35, col = P.rice, alpha = seg(t, 0, 0.8 + d.x * 0.6);
      if (d.fail >= 0) {
        const k = easeOut(seg(t, T0 + d.fail * TF + 0.4, T0 + d.fail * TF + 1.3));
        if (k > 0) { col = P.kumkum; alpha *= 1 - 0.82 * k; y += k * 10; }
      } else if (mk > 0) {
        const k = easeInOut(mk); const ty = fy + 8 + d.rank * rowH + rowH / 2, tx = fx + 14;
        x = lerp(x, tx, k); y = lerp(y, ty, k);
        // score bar
        const g = easeOut(seg(t, TM + 1.4 + d.rank * 0.06, TM + 2.8 + d.rank * 0.06));
        if (g > 0) {
          const bw = (fieldW - 210) * d.score * g, top = d.rank < 6, keep = seg(t, TM + 4.5, TM + 5.2);
          c.globalAlpha = 0.9 * (top ? 1 : 1 - 0.55 * keep);
          c.fillStyle = top && keep > 0 ? P.turmeric : P.code; rr(c, tx + 190, y - rowH * 0.28, Math.max(2, bw), rowH * 0.56, 3); c.fill();
          c.font = F.b(nar ? 11.5 : 13, top && keep > 0 ? 700 : 500); c.fillStyle = P.rice; c.fillText(d.name, tx + 14, y + 4);
          c.globalAlpha = 1;
        }
        if (d.rank < 6 && t > TM + 4.5) col = P.turmeric;
      }
      c.globalAlpha = alpha; c.fillStyle = col; c.beginPath(); c.arc(x, y, r, 0, 7); c.fill(); c.globalAlpha = 1;
    });
    // fence sweep line
    if (t >= T0 && t < TM) {
      const k = (t - T0) % TF / TF; const sweepX = fx + lerp(0, fieldW, easeInOut(seg(k, 0, 0.55)));
      c.globalAlpha = 1 - seg(k, 0.55, 0.8); c.strokeStyle = P.kumkum; c.lineWidth = 2;
      c.beginPath(); c.moveTo(sweepX, fy); c.lineTo(sweepX, fy + fh); c.stroke(); c.globalAlpha = 1;
    }
    if (t > TM + 4.5) {
      const a = seg(t, TM + 4.5, TM + 5.2); c.globalAlpha = a; c.font = F.m(nar ? 11 : 12, 600); c.fillStyle = P.turmeric;
      c.fillText('TOP 6 GO ON TO THE ROUTE STAGE', fx + 14, fy + 8 + ALIVE * rowH + (nar ? 22 : 26)); c.globalAlpha = 1;
    }
  },
};
