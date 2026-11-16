// Explainer videos: the start overlay, chapter seeking, and pausing on page change.
export function mountVideo(root: HTMLElement) {
  const v = root.querySelector('video')!;
  const start = root.querySelector<HTMLButtonElement>('[data-vid-start]');
  const chapters = [...root.querySelectorAll<HTMLButtonElement>('[data-seek]')];
  const go = (t?: number) => {
    if (t !== undefined) { if (v.readyState < 1) v.preload = 'metadata'; v.currentTime = t; }
    v.play().catch(() => {});
  };
  const onStart = () => go();
  v.controls = false; root.classList.add('is-ready'); // without JS: native controls, no overlay
  const onPlay = () => { root.classList.add('is-started'); v.controls = true; };
  const onTime = () => {
    let on = -1; chapters.forEach((c, i) => { if (v.currentTime >= parseFloat(c.dataset.seek!) - 0.05) on = i; });
    chapters.forEach((c, i) => c.toggleAttribute('aria-current', i === on));
  };
  const seekers = chapters.map((c) => { const f = () => go(parseFloat(c.dataset.seek!)); c.addEventListener('click', f); return [c, f] as const; });
  start?.addEventListener('click', onStart);
  v.addEventListener('play', onPlay);
  v.addEventListener('timeupdate', onTime);
  return () => {
    v.pause();
    start?.removeEventListener('click', onStart);
    v.removeEventListener('play', onPlay);
    v.removeEventListener('timeupdate', onTime);
    seekers.forEach(([c, f]) => c.removeEventListener('click', f));
  };
}
