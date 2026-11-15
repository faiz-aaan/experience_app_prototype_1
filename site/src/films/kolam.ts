// Signature: the five stages as one kolam. Scroll progress through the section drives everything.
// 0.0 understand · 0.2 narrow · 0.4 rank · 0.6 combine · 0.8 check
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { prefersReducedMotion } from '../engine/env';
import { F, palette, rng, seg, easeOut, easeInOut, lerp, rr } from './engine';

gsap.registerPlugin(ScrollTrigger);

const PIECES: [string, string][] = [
  ['find', 'dinner'], ['find', 'dessert on the way home'], ['fence', 'veg'], ['fence', '4 people'],
  ['fence', 'under ₹500 each'], ['fence', 'home by 10'], ['magnet', 'South Indian, calm'],
];

export function mountKolam(section: HTMLElement) {
  const cv = section.querySelector('canvas')!, c = cv.getContext('2d')!;
  const chapters = [...section.querySelectorAll<HTMLElement>('[data-chapter]')];
  const reduced = prefersReducedMotion();
  let P = palette(), W = 600, H = 600, k = 1, narrow = false, target = 0, p = 0, idle = 0, visible = false;
  // dot field
  const cols = 30, rows = 30, dots: { x: number; y: number; d: number; s: number; role: number }[] = [];
  const r = rng(7);
  const home = { x: 0.32, y: 0.7 };
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const x = (i + 0.5) / cols, y = (j + 0.5) / rows;
    dots.push({ x, y, d: Math.hypot(x - home.x, y - home.y), s: r(), role: 0 });
  }
  // 40 survivors near home; 12 shortlisted (6 dinner, 6 dessert); 2 final picks
  const near = dots.filter((d) => d.d < 0.3 && d.d > 0.04).sort((a, b) => a.s - b.s).slice(0, 40);
  near.forEach((d) => (d.role = 1));
  near.slice(0, 12).forEach((d, i) => (d.role = i < 6 ? 2 : 3));
  // final picks: dinner up and to the right, dessert lower right, so the loop reads clearly
  const closest = (tx: number, ty: number) => dots.filter((d) => d.d > 0.05).sort((a, b) => Math.hypot(a.x - tx, a.y - ty) - Math.hypot(b.x - tx, b.y - ty))[0];
  const dinner = closest(home.x + 0.22, home.y - 0.2), dessert = closest(home.x + 0.2, home.y + 0.1);
  if (dinner.role < 2) { near[0].role = 1; } if (dessert.role < 2) { near[6].role = 1; }
  dinner.role = 4; dessert.role = 5;

  const size = () => {
    const box = cv.parentElement!.getBoundingClientRect();
    narrow = box.width < 620; W = 600; H = Math.round(W * (box.height / box.width || 1));
    const d = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(box.width * d); cv.height = Math.round(box.height * d); k = cv.width / W;
    draw();
  };

  function draw() {
    c.setTransform(k, 0, 0, k, 0, 0); c.clearRect(0, 0, W, H);
    const top = narrow ? 30 : 104, pad = 34, side = Math.min(W - pad * 2, H - top - 60);
    const ox = (W - side) / 2, oy = top + 10;
    const X = (x: number) => ox + x * side, Y = (y: number) => oy + y * side;
    const s1 = seg(p, 0, 0.16), s2 = seg(p, 0.2, 0.36), s3 = seg(p, 0.4, 0.56), s4 = seg(p, 0.6, 0.76), s5 = seg(p, 0.8, 0.94);
    // header: the sentence as pieces (stage 1)
    if (!narrow) {
      let x = 34, y = 30;
      PIECES.forEach(([kind, txt], i) => {
        const a = seg(s1, i / PIECES.length, i / PIECES.length + 0.25);
        c.font = F.b(12.5, 600); const w = c.measureText(txt).width + 22;
        if (x + w > W - 20) { x = 34; y += 32; }
        if (a <= 0) { x += w + 8; return; }
        c.globalAlpha = a * (p > 0.2 ? 0.55 : 1);
        rr(c, x, y - 15 + (1 - a) * 8, w, 26, 13); c.strokeStyle = kind === 'find' ? P.turmeric : kind === 'fence' ? P.kumkum : P.code; c.lineWidth = 1.5; c.stroke();
        c.fillStyle = P.rice; c.fillText(txt, x + 11, y + 3 + (1 - a) * 8); x += w + 8;
      });
      c.globalAlpha = 1;
    }
    // 30-minute circle (stage 2)
    if (s2 > 0) {
      c.globalAlpha = 0.9 * (1 - s4 * 0.6); c.strokeStyle = P.kumkum; c.setLineDash([4, 6]); c.lineWidth = 1.5;
      c.beginPath(); c.arc(X(home.x), Y(home.y), side * 0.3 * easeOut(s2), 0, Math.PI * 2); c.stroke(); c.setLineDash([]); c.globalAlpha = 1;
    }
    // dots
    for (const d of dots) {
      let a = 0.55 + 0.45 * s1, rad = 1.9 + Math.sin(idle * 1.2 + d.x * 9 + d.y * 7) * 0.18, col = P.rice;
      if (d.role === 0) a *= 1 - 0.85 * s2;
      if (d.role === 1) a *= 1 - 0.6 * s3;
      if (d.role >= 2) { rad = lerp(rad, 4.2, easeOut(s3)); if (s3 > 0) col = d.role === 3 || d.role === 5 ? P.rice : P.turmeric; }
      if (d.role >= 4) rad = lerp(rad, 7, easeOut(s4));
      if (d.role >= 2 && s4 > 0 && d.role < 4) a *= 1 - 0.55 * s4;
      c.globalAlpha = a; c.fillStyle = col; c.beginPath(); c.arc(X(d.x), Y(d.y), rad, 0, 7); c.fill();
      if (d.role === 3 || d.role === 5) { if (s3 > 0) { c.globalAlpha = a * s3; c.strokeStyle = P.turmeric; c.lineWidth = 1.5; c.beginPath(); c.arc(X(d.x), Y(d.y), rad + 3, 0, 7); c.stroke(); } }
    }
    c.globalAlpha = 1;
    // home
    const hx = X(home.x), hy = Y(home.y);
    c.fillStyle = P.rice; c.beginPath(); c.moveTo(hx, hy - 11); c.lineTo(hx + 10, hy - 2); c.lineTo(hx + 7, hy - 2); c.lineTo(hx + 7, hy + 8); c.lineTo(hx - 7, hy + 8); c.lineTo(hx - 7, hy - 2); c.lineTo(hx - 10, hy - 2); c.closePath(); c.fill();
    c.font = F.m(11, 600); c.fillStyle = P.muted; c.textAlign = 'center'; c.fillText('HOME', hx, hy + 24); c.textAlign = 'left';
    // the line (stage 4): home → dinner → dessert → home, drawn as one stroke
    if (s4 > 0) {
      const pts = [[home.x, home.y], [dinner.x, dinner.y], [dessert.x, dessert.y], [home.x, home.y]].map(([x, y]) => [X(x), Y(y)]);
      const path = new Path2D(); path.moveTo(pts[0][0], pts[0][1]);
      for (let i = 0; i < 3; i++) {
        const [ax, ay] = pts[i], [bx, by] = pts[i + 1]; const mx = (ax + bx) / 2, my = (ay + by) / 2; const nx = -(by - ay), ny = bx - ax;
        path.quadraticCurveTo(mx + nx * 0.16, my + ny * 0.16, bx, by);
      }
      c.save(); c.strokeStyle = P.turmeric; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round';
      c.setLineDash([2400]); c.lineDashOffset = 2400 * (1 - easeInOut(s4)); c.stroke(path); c.restore();
      const lab = (x: number, y: number, t1: string, t2: string, a: number, right = false) => {
        c.globalAlpha = a; c.textAlign = right ? 'right' : 'left'; const dx = right ? -14 : 14;
        c.font = F.b(narrow ? 13 : 14, 700); c.fillStyle = P.rice; c.fillText(t1, x + dx, y - 4);
        c.font = F.m(narrow ? 10 : 11); c.fillStyle = P.muted; c.fillText(t2, x + dx, y + 13); c.textAlign = 'left'; c.globalAlpha = 1;
      };
      lab(X(dinner.x), Y(dinner.y), 'Dinner, 7:30 pm', 'thali place · ₹420 each', seg(s4, 0.35, 0.6), dinner.x > 0.6);
      lab(X(dessert.x), Y(dessert.y), 'Dessert, 9:05 pm', 'on the way · ₹90 each', seg(s4, 0.65, 0.9), dessert.x > 0.6);
    }
    // checks (stage 5)
    if (s5 > 0) {
      const items = ['Open when you arrive', 'Under ₹500 each', 'Seats 4, veg menu confirmed', 'Home 9:40 pm, before 10'];
      const bx = narrow ? 24 : 34, by = H - (narrow ? 28 : 34) - (items.length - 1) * 22;
      items.forEach((txt, i) => {
        const a = seg(s5, i * 0.2, i * 0.2 + 0.3); if (a <= 0) return;
        c.globalAlpha = a; c.fillStyle = P.code; c.font = F.b(14, 700); c.fillText('✓', bx, by + i * 22);
        c.fillStyle = P.rice; c.font = F.b(narrow ? 13 : 14, 500); c.fillText(txt, bx + 20, by + i * 22);
      });
      c.globalAlpha = 1;
    }
    // counter
    const n = p < 0.2 ? '3,000 places' : p < 0.4 ? `${Math.round(lerp(3000, 40, easeOut(s2))).toLocaleString('en-IN')} places` : p < 0.6 ? `${Math.round(lerp(40, 12, easeOut(s3)))} shortlisted` : p < 0.8 ? '1 plan, 2 stops' : 'checked';
    c.font = F.m(12, 600); c.fillStyle = P.turmeric; c.textAlign = 'right'; c.fillText(n.toUpperCase(), W - 34, narrow ? 22 : 100); c.textAlign = 'left';
  }

  const st = ScrollTrigger.create({
    trigger: section, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true,
    onUpdate: (self) => {
      target = self.progress;
      const idx = Math.min(chapters.length - 1, Math.floor(self.progress * chapters.length));
      chapters.forEach((ch, i) => ch.classList.toggle('is-on', i === idx));
    },
  });
  const tick = (_t: number, dt: number) => {
    if (!visible) return;
    p = reduced ? target : p + (target - p) * Math.min(1, dt / 120);
    if (!reduced) idle += dt / 1000;
    draw();
  };
  gsap.ticker.add(tick);
  const io = new IntersectionObserver((es) => es.forEach((e) => { visible = e.isIntersecting; if (visible) draw(); }));
  io.observe(cv);
  const ro = new ResizeObserver(size); ro.observe(cv.parentElement!);
  document.fonts?.ready.then(() => { P = palette(); draw(); });
  chapters[0]?.classList.add('is-on');
  size();
  return () => { st.kill(); gsap.ticker.remove(tick); io.disconnect(); ro.disconnect(); };
}
