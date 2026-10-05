import { afterEach, describe, expect, it, vi } from 'vitest';
import worker from './index.js';

const env = {
  ALLOWED_ORIGINS: 'https://intimar.life,http://localhost:4321',
  GITHUB_ORG: 'intimar-life',
  GITHUB_CLIENT_ID: 'client-id',
  GITHUB_CLIENT_SECRET: 'client-secret',
};

function login(origin = 'https://intimar.life') {
  return worker.fetch(
    new Request('https://auth.example/', {
      method: 'POST',
      headers: { Origin: origin, 'Content-Type': 'application/json' },
      body: JSON.stringify({ code: 'abc' }),
    }),
    env,
  );
}

// Stubs GitHub: the code exchange, the membership lookup and revocation.
function stubGitHub({ membership }) {
  const calls = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url, init = {}) => {
      calls.push({ url: String(url), method: init.method ?? 'GET' });
      if (String(url).endsWith('/login/oauth/access_token')) {
        return Response.json({ access_token: 'tok' });
      }
      if (String(url).endsWith('/user/memberships/orgs/intimar-life')) {
        return membership === null
          ? new Response('Not Found', { status: 404 })
          : Response.json({ state: membership });
      }
      if (String(url).endsWith('/applications/client-id/token')) {
        return new Response(null, { status: 204 });
      }
      throw new Error(`unexpected fetch ${url}`);
    }),
  );
  return calls;
}

afterEach(() => vi.unstubAllGlobals());

describe('github-auth worker', () => {
  it('returns the token to active members of the organization', async () => {
    stubGitHub({ membership: 'active' });
    const res = await login();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ access_token: 'tok' });
  });

  it('refuses non-members and revokes the token GitHub issued', async () => {
    const calls = stubGitHub({ membership: null });
    const res = await login();
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: 'not_member' });
    expect(calls).toContainEqual({
      url: 'https://api.github.com/applications/client-id/token',
      method: 'DELETE',
    });
  });

  it('treats a pending invitation as not a member yet', async () => {
    stubGitHub({ membership: 'pending' });
    const res = await login();
    expect(res.status).toBe(403);
  });

  it('rejects requests from other origins without calling GitHub', async () => {
    const calls = stubGitHub({ membership: 'active' });
    const res = await login('https://evil.example');
    expect(res.status).toBe(403);
    expect(calls).toHaveLength(0);
  });
});
