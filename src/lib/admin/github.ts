// Browser-side GitHub client for the /admin panel. Everything runs with
// the editor's own token (from a GitHub App, so it can only touch this
// repo); the Cloudflare Worker is used once, to finish the login.
import { ADMIN_CONFIG, BRANCH_PREFIX, EVENTS_DIR } from './config';
import type { EventFile } from './event-file';

const API = 'https://api.github.com';
const TOKEN_KEY = 'intimar-admin-token';
const STATE_KEY = 'intimar-admin-state';

function adminUrl(): string {
  return new URL(`${import.meta.env.BASE_URL}admin/`, window.location.origin)
    .href;
}

export function startLogin(): void {
  const state = crypto.randomUUID();
  sessionStorage.setItem(STATE_KEY, state);
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', ADMIN_CONFIG.githubAppClientId);
  url.searchParams.set('redirect_uri', adminUrl());
  url.searchParams.set('state', state);
  window.location.assign(url.href);
}

// Called on page load: if GitHub just redirected back with ?code, swap it
// for a token (via the Worker) and clean the URL. Returns the stored token.
export async function completeLogin(): Promise<string | null> {
  const params = new URLSearchParams(window.location.search);
  const code = params.get('code');
  if (code) {
    const expected = sessionStorage.getItem(STATE_KEY);
    sessionStorage.removeItem(STATE_KEY);
    window.history.replaceState(null, '', adminUrl());
    if (!expected || params.get('state') !== expected) {
      throw new Error('El inicio de sesión no coincide. Inténtalo de nuevo.');
    }
    const res = await fetch(ADMIN_CONFIG.authWorkerUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = (await res.json()) as {
      access_token?: string;
      error?: string;
    };
    // The Worker only issues tokens to active members of the organization.
    if (data.error === 'not_member') {
      throw new Error(
        `Tu cuenta de GitHub no pertenece a la organización ${ADMIN_CONFIG.owner}. Pídele al equipo que te invite (y acepta la invitación) para poder usar el panel.`,
      );
    }
    if (!data.access_token) {
      throw new Error('No se pudo iniciar sesión con GitHub.');
    }
    sessionStorage.setItem(TOKEN_KEY, data.access_token);
  }
  return sessionStorage.getItem(TOKEN_KEY);
}

export function logout(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export class SessionExpiredError extends Error {}

function decodeBase64Utf8(b64: string): string {
  const bytes = Uint8Array.from(atob(b64.replace(/\n/g, '')), (c) =>
    c.charCodeAt(0),
  );
  return new TextDecoder().decode(bytes);
}

export interface RepoEvent {
  path: string;
  data: EventFile;
}

export interface Change {
  title: string;
  url: string;
  status: 'En revisión' | 'Publicado' | 'Descartado';
  updatedAt: string;
}

export interface FileToCommit {
  path: string;
  content: string;
  encoding: 'utf-8' | 'base64';
}

export class GitHubClient {
  private repoPath = `/repos/${ADMIN_CONFIG.owner}/${ADMIN_CONFIG.repo}`;

  constructor(private token: string) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${this.token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
    if (res.status === 401) throw new SessionExpiredError();
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { message?: string };
      throw new Error(body.message ?? `GitHub respondió ${res.status}`);
    }
    return (await res.json()) as T;
  }

  // Being in the organization doesn't imply being able to edit this repo,
  // so the panel also checks for write access before showing any form.
  async canEdit(): Promise<boolean> {
    const repo = await this.request<{ permissions?: { push?: boolean } }>(
      this.repoPath,
    );
    return repo.permissions?.push === true;
  }

  getUser() {
    return this.request<{
      login: string;
      name: string | null;
      avatar_url: string;
    }>('/user');
  }

  async listEvents(): Promise<RepoEvent[]> {
    const ref = `?ref=${ADMIN_CONFIG.baseBranch}`;
    const files = await this.request<{ path: string; name: string }[]>(
      `${this.repoPath}/contents/${EVENTS_DIR}${ref}`,
    ).catch((e: unknown) => {
      // A bare "Not Found" means nothing to an editor: say what's missing.
      if (e instanceof Error && e.message === 'Not Found') {
        throw new Error(
          `No se encontró la carpeta de eventos (${EVENTS_DIR}) en GitHub. Avísale al equipo técnico.`,
        );
      }
      throw e;
    });
    const events = await Promise.all(
      files
        .filter((f) => f.name.endsWith('.json'))
        .map(async (f) => {
          const file = await this.request<{ content: string }>(
            `${this.repoPath}/contents/${f.path}${ref}`,
          );
          return {
            path: f.path,
            data: JSON.parse(decodeBase64Utf8(file.content)) as EventFile,
          };
        }),
    );
    return events.sort((a, b) =>
      b.data.startDate.localeCompare(a.data.startDate),
    );
  }

  // One branch + one commit (all files) + one PR, through the Git Data API
  // so the event JSON and its photo land together.
  async openChange(opts: {
    branchName: string;
    title: string;
    body: string;
    files: FileToCommit[];
  }): Promise<string> {
    const r = this.repoPath;
    const base = await this.request<{ object: { sha: string } }>(
      `${r}/git/ref/heads/${ADMIN_CONFIG.baseBranch}`,
    );
    const baseCommit = await this.request<{ tree: { sha: string } }>(
      `${r}/git/commits/${base.object.sha}`,
    );
    const tree = await Promise.all(
      opts.files.map(async (file) => {
        const blob = await this.request<{ sha: string }>(`${r}/git/blobs`, {
          method: 'POST',
          body: JSON.stringify({
            content: file.content,
            encoding: file.encoding,
          }),
        });
        return { path: file.path, mode: '100644', type: 'blob', sha: blob.sha };
      }),
    );
    const newTree = await this.request<{ sha: string }>(`${r}/git/trees`, {
      method: 'POST',
      body: JSON.stringify({ base_tree: baseCommit.tree.sha, tree }),
    });
    const commit = await this.request<{ sha: string }>(`${r}/git/commits`, {
      method: 'POST',
      body: JSON.stringify({
        message: opts.title,
        tree: newTree.sha,
        parents: [base.object.sha],
      }),
    });
    await this.request(`${r}/git/refs`, {
      method: 'POST',
      body: JSON.stringify({
        ref: `refs/heads/${opts.branchName}`,
        sha: commit.sha,
      }),
    });
    const pr = await this.request<{ html_url: string }>(`${r}/pulls`, {
      method: 'POST',
      body: JSON.stringify({
        title: opts.title,
        head: opts.branchName,
        base: ADMIN_CONFIG.baseBranch,
        body: opts.body,
      }),
    });
    return pr.html_url;
  }

  async listMyChanges(login: string): Promise<Change[]> {
    const prs = await this.request<
      {
        title: string;
        html_url: string;
        state: 'open' | 'closed';
        merged_at: string | null;
        updated_at: string;
        user: { login: string };
        head: { ref: string };
      }[]
    >(
      `${this.repoPath}/pulls?state=all&per_page=50&sort=updated&direction=desc`,
    );
    return prs
      .filter(
        (pr) =>
          pr.head.ref.startsWith(BRANCH_PREFIX) && pr.user.login === login,
      )
      .map((pr) => ({
        title: pr.title,
        url: pr.html_url,
        status:
          pr.state === 'open'
            ? 'En revisión'
            : pr.merged_at
              ? 'Publicado'
              : 'Descartado',
        updatedAt: pr.updated_at,
      }));
  }
}

// Resize in the browser before uploading, so the repo never receives a
// multi-megabyte phone photo. JPEG at 1600px is plenty: Astro re-encodes
// it for every size the site actually shows.
export async function resizeImageToBase64(
  file: File,
  maxSide = 1600,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob(
      (b) =>
        b ? resolve(b) : reject(new Error('No se pudo procesar la foto.')),
      'image/jpeg',
      0.85,
    ),
  );
  const dataUrl = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(blob);
  });
  return dataUrl.slice(dataUrl.indexOf(',') + 1);
}
