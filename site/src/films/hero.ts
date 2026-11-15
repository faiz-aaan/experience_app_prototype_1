// Home hero: three ideas leave home, two fail a fence, one becomes the route. Then a dot travels the evening at rest.
import { gsap } from 'gsap';
import { prefersReducedMotion } from '../engine/env';

export function mountHero(svg: SVGSVGElement) {
  const route = svg.querySelector<SVGPathElement>('[data-route]')!;
  const you = svg.querySelector<SVGCircleElement>('[data-you]')!;
  if (prefersReducedMotion()) return;
  const q = <T extends Element>(s: string) => [...svg.querySelectorAll<T>(s)];
  const cands = q<SVGPathElement>('[data-cand-line]');
  const xs = q<SVGGElement>('[data-x]'), whys = q<SVGTextElement>('[data-why]');
  const candText = q<SVGTextElement>('[data-cand] text.name');
  const stops = q<SVGGElement>('[data-stop]');
  const labels = svg.querySelector('[data-labels]')!;
  const len = route.getTotalLength();

  gsap.set(q('[data-map]'), { opacity: 0 });
  gsap.set(cands, { opacity: 0 });
  gsap.set([...xs, ...stops], { scale: 0, transformOrigin: '50% 50%' });
  gsap.set([...whys, ...candText, labels], { opacity: 0 });
  gsap.set(route, { strokeDasharray: len, strokeDashoffset: len });

  const tl = gsap.timeline({ delay: 0.35 });
  tl.to(q('[data-map]'), { opacity: 1, duration: 1, ease: 'power2.out' })
    .to(cands, { opacity: 1, duration: 0.6, stagger: 0.15 }, 0.3)
    .to(candText, { opacity: 1, duration: 0.5, stagger: 0.15 }, 0.5)
    .to(xs, { scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.2 }, 1.2)
    .to(whys, { opacity: 1, duration: 0.4, stagger: 0.2 }, 1.3)
    .to(cands, { opacity: 0.45, duration: 0.6 }, 1.8)
    .to(route, { strokeDashoffset: 0, duration: 2, ease: 'expo.inOut' }, 1.7)
    .to(stops, { scale: 1, duration: 0.6, ease: 'expo.out', stagger: 0.45 }, 2.1)
    .to(labels, { opacity: 1, duration: 0.6 }, 2.5)
    .to(you, { opacity: 1, duration: 0.4 }, 3.6);

  // idle: one dot rides the evening loop on the one clock
  let t0 = -1;
  const tick = (time: number) => {
    if (tl.progress() < 1) return;
    if (t0 < 0) t0 = time;
    const p = (((time - t0) / 9) % 1);
    const pt = route.getPointAtLength(p * len);
    you.setAttribute('cx', String(pt.x)); you.setAttribute('cy', String(pt.y));
  };
  gsap.ticker.add(tick);
  return () => { tl.kill(); gsap.ticker.remove(tick); };
}
