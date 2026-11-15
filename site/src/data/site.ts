// All site content and structure in one place.
export const site = {
  name: 'The Cousin',
  role: 'Product requirements',
  description:
    'Product requirements for The Cousin: an app that knows you and knows Chennai, plans an outing from one sentence, and checks every fact before it shows you.',
  url: 'https://faiz-aaan.github.io/experience_app_prototype_1/',
  updated: '15 November 2026',
};

export type Status = 'tested' | 'designed' | 'open';
export const statusLabel: Record<Status, string> = {
  tested: 'Tested in simulation',
  designed: 'Designed, not yet tested',
  open: 'Open decision',
};

export type Section = { slug: string; n: string; title: string; short: string; group?: string; built: boolean };

// The 13 sections (plus the outside-services page) in reading order. `built: true` shows in the menu as "next".
export const sections: Section[] = [
  { slug: '', n: '01', title: 'The product in one minute', short: 'The product', built: true },
  { slug: 'goals/', n: '02', title: 'Goals, non-goals and success', short: 'Goals', built: true },
  { slug: 'how-it-works/', n: '03', title: 'How it works: five stages', short: 'How it works', built: true },
  { slug: 'outside/', n: '03', title: 'What we rely on outside', short: 'Outside services', built: true },
  { slug: 'algorithms/fences-and-magnets/', n: '04', title: 'Fences and magnets', short: 'Fences and magnets', group: 'The algorithms', built: true },
  { slug: 'algorithms/mix-and-variety/', n: '04', title: 'Safe, stretch, wild and variety', short: 'Mix and variety', group: 'The algorithms', built: true },
  { slug: 'algorithms/route-and-arc/', n: '04', title: 'Route puzzle and evening arc', short: 'Route and arc', group: 'The algorithms', built: true },
  { slug: 'algorithms/rest-period/', n: '04', title: 'Rest period', short: 'Rest period', group: 'The algorithms', built: true },
  { slug: 'algorithms/memory/', n: '04', title: 'Memory and changing taste', short: 'Memory', group: 'The algorithms', built: true },
  { slug: 'algorithms/asking/', n: '04', title: 'When to ask a question', short: 'Asking', group: 'The algorithms', built: true },
  { slug: 'algorithms/saying-no/', n: '04', title: 'Saying no', short: 'Saying no', group: 'The algorithms', built: true },
  { slug: 'algorithms/wild-cards/', n: '04', title: 'Wild cards that learn', short: 'Wild cards', group: 'The algorithms', built: true },
  { slug: 'algorithms/facts/', n: '04', title: 'Facts by code', short: 'Facts', group: 'The algorithms', built: true },
  { slug: 'all-together/', n: '05', title: 'All together: one evening', short: 'All together', built: true },
  { slug: 'habit/', n: '06', title: 'A habit, not an addiction', short: 'Psychology', built: true },
  { slug: 'borrowed/', n: '07', title: 'What we take from others', short: 'Borrowed ideas', built: true },
  { slug: 'moat/', n: '08', title: 'The moat, communities and events', short: 'Moat', built: true },
  { slug: 'models/', n: '09', title: 'When data grows: the models', short: 'Models', built: true },
  { slug: 'tests/', n: '10', title: 'Test runs: rules and models', short: 'Test runs', built: true },
  { slug: 'launch/', n: '11', title: 'A day at launch', short: 'At launch', built: true },
  { slug: 'risks/', n: '12', title: 'Risks and how we tackle them', short: 'Risks', built: true },
  { slug: 'decisions/', n: '13', title: 'Open decisions and glossary', short: 'Decisions', built: true },
];

// The one example threaded through every page.
export const example = {
  said: 'Veg dinner for 4 tonight, under ₹500 each. Something sweet on the way home. Back by 10.',
  pieces: [
    { kind: 'find', text: 'a dinner place' },
    { kind: 'find', text: 'a dessert stop on the way home' },
    { kind: 'fence', text: 'vegetarian' },
    { kind: 'fence', text: '4 people' },
    { kind: 'fence', text: 'under ₹500 each' },
    { kind: 'fence', text: 'home by 10 pm' },
    { kind: 'magnet', text: 'your taste: South Indian, calm' },
  ],
};
