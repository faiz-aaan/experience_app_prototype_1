// Mount every film, kolam and hero on each page load (reverted on navigation through onPage cleanups).
import { onPage } from '../engine';
import { mountFilm } from './engine';
import { fencesFilm } from './fences';
import { mixFilm, routeFilm, restFilm, askFilm } from './algos';
import { memoryFilm, noFilm, wildFilm, factsFilm, outsideFilm } from './more';
import { togetherFilm, modelsFilm, habitFilm, moatFilm, launchFilm } from './story';
import { mountKolam } from './kolam';
import { mountHero } from './hero';

const FILMS = {
  fences: fencesFilm, mix: mixFilm, route: routeFilm, rest: restFilm, ask: askFilm,
  memory: memoryFilm, no: noFilm, wild: wildFilm, facts: factsFilm, outside: outsideFilm,
  together: togetherFilm, models: modelsFilm, habit: habitFilm, moat: moatFilm, launch: launchFilm,
} as const;

onPage(() => {
  const offs: (() => void)[] = [];
  document.querySelectorAll<HTMLElement>('[data-film]').forEach((el) => {
    const f = FILMS[el.dataset.film as keyof typeof FILMS]; if (f) offs.push(mountFilm(el, f));
  });
  document.querySelectorAll<HTMLElement>('[data-kolam]').forEach((el) => offs.push(mountKolam(el)));
  document.querySelectorAll<SVGSVGElement>('[data-hero-kolam]').forEach((el) => { const o = mountHero(el); if (o) offs.push(o); });
  return () => offs.forEach((o) => o());
});
