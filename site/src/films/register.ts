// Mount every film, kolam and hero on each page load (reverted on navigation through onPage cleanups).
import { onPage } from '../engine';
import { mountFilm } from './engine';
import { fencesFilm } from './fences';
import { mountKolam } from './kolam';
import { mountHero } from './hero';

const FILMS = { fences: fencesFilm } as const;

onPage(() => {
  const offs: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>('[data-film]').forEach((el) => {
    const f = FILMS[el.dataset.film as keyof typeof FILMS]; if (f) offs.push(mountFilm(el, f));
  });
  document.querySelectorAll<HTMLElement>('[data-kolam]').forEach((el) => offs.push(mountKolam(el)));
  document.querySelectorAll<SVGSVGElement>('[data-hero-kolam]').forEach((el) => { const o = mountHero(el); if (o) offs.push(o); });
  return () => offs.forEach((o) => o());
});
