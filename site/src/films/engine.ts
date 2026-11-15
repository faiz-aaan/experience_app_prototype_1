// Film player: canvas + play/pause + scrub + captions, driven by the GSAP ticker (the site's one clock).
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../engine/env';

export type Pal = Record<'door' | 'rice' | 'muted' | 'line' | 'turmeric' | 'kumkum' | 'code' | 'ink', string>;
export function palette(): Pal {
  const cs = getComputedStyle(document.documentElement);
  const v = (n: string) => cs.getPropertyValue(n).trim();
  return { door: v('--c-door'), rice: v('--c-rice'), muted: v('--c-door-muted'), line: v('--c-door-line'), turmeric: v('--c-turmeric'), kumkum: '#D9907F', code: '#8CC2A8', ink: v('--c-fg') };
}
export const F = {
  d: (s: number, w = 800) => `${w} ${s}px Host, ui-sans-serif, system-ui, sans-serif`,
  b: (s: number, w = 500) => `${w} ${s}px Host, ui-sans-serif, system-ui, sans-serif`,
  m: (s: number, w = 400) => `${w} ${s}px Martian, ui-monospace, monospace`,
};
export const clamp = (x: number, a = 0, b = 1) => Math.max(a, Math.min(b, x));
export const seg = (t: number, a: number, b: number) => clamp((t - a) / (b - a));
export const easeOut = (x: number) => 1 - Math.pow(1 - x, 4);
export const easeInOut = (x: number) => (x < 0.5 ? 8 * x ** 4 : 1 - Math.pow(-2 * x + 2, 4) / 2);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
export function rng(seed: number) {
  return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
export function rr(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath(); if ((c as any).roundRect) (c as any).roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
}

export type FilmOpts = {
  dur: number; still: number; ratio?: number; tall?: number;
  caps: [number, string][];
  draw: (c: CanvasRenderingContext2D, t: number, W: number, H: number, narrow: boolean, P: Pal, idle: number) => void;
};

/** Mount a film inside `root` (expects canvas, .play, input[type=range], .cap, .time, .ticks). Returns cleanup. */
export function mountFilm(root: HTMLElement, o: FilmOpts) {
  const cv = root.querySelector('canvas')!, ctx = cv.getContext('2d')!;
  const btn = root.querySelector<HTMLButtonElement>('.play')!, sc = root.querySelector<HTMLInputElement>('input[type=range]')!;
  const cap = root.querySelector<HTMLElement>('.cap')!, tm = root.querySelector<HTMLElement>('.time')!, ticks = root.querySelector<HTMLElement>('.ticks')!;
  const reduced = prefersReducedMotion();
  const S = { t: o.still, playing: false, W: 1000, H: 520, k: 1, narrow: false, played: false, idle: 0 };
  let P = palette();
  sc.max = String(o.dur); sc.step = '0.01';
  ticks.innerHTML = '';
  o.caps.forEach(([ct]) => { const i = document.createElement('i'); i.style.left = `calc(${(ct / o.dur) * 100}% - 1px)`; ticks.appendChild(i); });
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`;
  let lastW = 0;
  const size = () => {
    const cw = cv.parentElement!.clientWidth || 600; if (cw === lastW) return; lastW = cw;
    S.narrow = cw < 620; S.W = S.narrow ? 620 : 1000; S.H = Math.round(S.W * (S.narrow ? o.tall ?? 1 : o.ratio ?? 0.52));
    const ch = (cw * S.H) / S.W; cv.style.height = `${ch}px`;
    const d = Math.min(2, devicePixelRatio || 1); cv.width = Math.round(cw * d); cv.height = Math.round(ch * d); S.k = cv.width / S.W; render();
  };
  const render = () => {
    ctx.setTransform(S.k, 0, 0, S.k, 0, 0); ctx.clearRect(0, 0, S.W, S.H); ctx.globalAlpha = 1; ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
    o.draw(ctx, S.t, S.W, S.H, S.narrow, P, S.idle); ctx.globalAlpha = 1;
    let c = o.caps[0][1]; for (const [ct, txt] of o.caps) if (S.t >= ct - 0.001) c = txt;
    if (cap.textContent !== c) cap.textContent = c;
    sc.value = String(S.t); tm.textContent = `${fmt(S.t)} / ${fmt(o.dur)}`;
  };
  const setBtn = () => { btn.textContent = S.playing ? 'Pause' : S.t >= o.dur - 0.01 ? 'Replay' : 'Play'; };
  let visible = false;
  const tick = (_t: number, dt: number) => {
    if (!visible) return;
    if (!reduced) S.idle += dt / 1000;
    if (S.playing) { S.t = Math.min(o.dur, S.t + dt / 1000); if (S.t >= o.dur) { S.playing = false; setBtn(); } }
    if (S.playing || !reduced) render();
  };
  gsap.ticker.add(tick);
  const play = () => { if (S.t >= o.dur - 0.01) S.t = 0; S.playing = true; setBtn(); };
  const pause = () => { S.playing = false; setBtn(); };
  const onBtn = () => { S.played = true; S.playing ? pause() : play(); };
  const onScrub = () => { S.played = true; pause(); S.t = +sc.value; render(); };
  btn.addEventListener('click', onBtn); sc.addEventListener('input', onScrub);
  const ro = new ResizeObserver(size); ro.observe(cv.parentElement!);
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    visible = e.isIntersecting;
    if (e.isIntersecting && e.intersectionRatio > 0.5 && !S.played && !reduced) { S.played = true; S.t = 0; play(); }
    else if (!e.isIntersecting && S.playing) pause();
  }), { threshold: [0, 0.5, 0.8] });
  io.observe(cv);
  const onTheme = () => { P = palette(); render(); };
  document.fonts?.ready.then(onTheme);
  size(); setBtn();
  return () => { gsap.ticker.remove(tick); ro.disconnect(); io.disconnect(); btn.removeEventListener('click', onBtn); sc.removeEventListener('input', onScrub); };
}
