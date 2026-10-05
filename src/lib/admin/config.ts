// Public settings for the /admin panel. None of these are secrets: the
// GitHub App's client ID is shown in every login URL, and the Worker only
// accepts requests from the site's own origins. Fill both in once the
// GitHub App and the Cloudflare Worker exist (see workers/github-auth/).
export const ADMIN_CONFIG = {
  owner: 'intimar-life',
  repo: 'intimar',
  baseBranch: 'main',
  // cspell:disable-next-line -- an opaque ID, not words
  githubAppClientId: 'Iv23li095qb1jsrkNand',
  authWorkerUrl: 'https://intimar-github-auth.intimar.workers.dev',
};

// Every change the panel opens lives on a branch with this prefix, which is
// also how "Mis cambios" finds them again.
export const BRANCH_PREFIX = 'edicion/';

export const EVENTS_DIR = 'src/data/events';
export const EVENT_IMAGES_DIR = 'src/data/images/events';

export function isAdminConfigured(): boolean {
  return Boolean(ADMIN_CONFIG.githubAppClientId && ADMIN_CONFIG.authWorkerUrl);
}
