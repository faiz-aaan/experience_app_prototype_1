// Home hero: a kolam drawn through five chosen dots. Draws in on load, then breathes at rest.
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../engine/env';

export function mountHero(svg: SVGSVGElement) {
  const path = svg.querySelector<SVGPathElement>('[data-line]')!;
  const dots = [...svg.querySelectorAll<SVGCircleElement>('circle')];
  const len = path.getTotalLength();
  if (prefersReducedMotion()) return;
  gsap.set(path, { strokeDasharray: len, strokeDashoffset: len });
  const picks = dots.filter((d) => d.dataset.pick !== undefined);
  gsap.set(picks, { scale: 0, transformOrigin: '50% 50%' });
  const tl = gsap.timeline({ delay: 0.3 });
  tl.to(path, { strokeDashoffset: 0, duration: 2.4, ease: 'expo.inOut' })
    .to(picks, { scale: 1, duration: 0.8, ease: 'expo.out', stagger: 0.18 }, 0.5);
  // idle: dots breathe on the one clock while the page is visible
  const base = dots.map((d) => +d.getAttribute('r')!);
  const tick = (time: number) => { dots.forEach((d, i) => d.setAttribute('r', String(base[i] * (1 + Math.sin(time * 1.3 + i * 0.7) * 0.07)))); };
  gsap.ticker.add(tick);
  return () => { tl.kill(); gsap.ticker.remove(tick); };
}
