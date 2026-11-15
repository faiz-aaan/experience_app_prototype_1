// Every internal link goes through here so the GitHub Pages sub-folder is always included.
export const url = (slug = '') => `${import.meta.env.BASE_URL.replace(/\/$/, '')}/${slug}`;
