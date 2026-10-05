// Cloudflare Worker that completes the GitHub login for /admin.
//
// GitHub's OAuth flow ends by swapping a one-time `code` for an access
// token, and that request needs the GitHub App's client secret — which
// can't live in a static site. This Worker does only that swap: it never
// stores anything, and every other GitHub call is made by the browser
// with the editor's own token.
//
// It also gates the panel to the GitHub organization: a token is only
// handed back to active members of GITHUB_ORG; anyone else gets 403 and the
// token GitHub just issued is revoked on the spot.
//
// Secrets (set with `npx wrangler secret put <NAME>`):
//   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET — from the GitHub App.
// Vars (wrangler.toml): ALLOWED_ORIGINS — comma-separated site origins;
//   GITHUB_ORG — the organization whose members may use the panel.

const GITHUB_API = 'https://api.github.com';

// GitHub's API rejects requests without a User-Agent, and Workers don't
// send one by default.
function githubHeaders(token) {
  return {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'User-Agent': 'intimar-github-auth',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

// Needs the GitHub App's "Members: read" organization permission. Pending
// invitations don't count — only accepted ("active") memberships do.
async function isActiveOrgMember(token, org) {
  const res = await fetch(`${GITHUB_API}/user/memberships/orgs/${org}`, {
    headers: githubHeaders(token),
  });
  if (!res.ok) return false;
  const membership = await res.json();
  return membership.state === 'active';
}

async function revokeToken(token, env) {
  await fetch(`${GITHUB_API}/applications/${env.GITHUB_CLIENT_ID}/token`, {
    method: 'DELETE',
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Basic ${btoa(`${env.GITHUB_CLIENT_ID}:${env.GITHUB_CLIENT_SECRET}`)}`,
      'User-Agent': 'intimar-github-auth',
    },
    body: JSON.stringify({ access_token: token }),
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin') ?? '';
    const allowed = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());
    const cors = allowed.includes(origin)
      ? {
          'Access-Control-Allow-Origin': origin,
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
          Vary: 'Origin',
        }
      : null;

    if (!cors) return new Response('Forbidden', { status: 403 });
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: cors });
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405, headers: cors });
    }

    const { code } = await request.json().catch(() => ({}));
    if (typeof code !== 'string' || !code) {
      return Response.json(
        { error: 'missing_code' },
        { status: 400, headers: cors },
      );
    }

    const res = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });
    const data = await res.json();

    // Only the token goes back to the browser — never the refresh token,
    // so a leaked page session can't be extended past its 8-hour expiry.
    if (!data.access_token) {
      return Response.json(
        { error: data.error ?? 'exchange_failed' },
        { status: 400, headers: cors },
      );
    }
    if (!(await isActiveOrgMember(data.access_token, env.GITHUB_ORG))) {
      await revokeToken(data.access_token, env).catch(() => {});
      return Response.json(
        { error: 'not_member' },
        { status: 403, headers: cors },
      );
    }
    return Response.json(
      { access_token: data.access_token },
      { headers: cors },
    );
  },
};
