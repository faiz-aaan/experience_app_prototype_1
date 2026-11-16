// Mount the explainer videos, the kolam and the hero on each page load (reverted on navigation through onPage cleanups).
import { onPage } from '../engine';
import { mountVideo } from './video';
import { mountKolam } from './kolam';
import { mountHero } from './hero';

onPage(() => {
  const offs: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>('[data-vid]').forEach((el) => offs.push(mountVideo(el)));
  document.querySelectorAll<HTMLElement>('[data-kolam]').forEach((el) => offs.push(mountKolam(el)));
  document.querySelectorAll<SVGSVGElement>('[data-hero-route]').forEach((el) => { const o = mountHero(el); if (o) offs.push(o); });
  return () => offs.forEach((o) => o());
});
