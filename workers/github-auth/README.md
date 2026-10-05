# /admin login (GitHub App + Cloudflare Worker)

The `/admin` panel runs entirely in the browser against GitHub's API. The
only server piece is this Worker, which finishes the GitHub login (that step
needs the app's client secret, which can't live in a static site).

## 1. Create the GitHub App

Create it under the **intimar-life** organization (so it belongs to the project, not a personal account): <https://github.com/organizations/intimar-life/settings/apps/new>

- **Name:** `Intimar Panel` (any unique name)
- **Homepage URL:** `https://intimar.life`
- **Callback URLs:** `https://intimar.life/admin/` and `http://localhost:4321/admin/`
- **Expire user authorization tokens:** on
- **Webhook:** off (uncheck "Active")
- **Repository permissions:** Contents: **Read and write** · Pull requests: **Read and write**
- **Organization permissions:** Members: **Read-only** (the Worker only lets active members of `intimar-life` log in)
- **Where can this app be installed:** Only on this account (intimar-life)

Then:

1. Copy the **Client ID**, and generate a **client secret**.
2. **Install App** → the intimar-life organization → only the `intimar` repository.

Each editor must be an **active member** of `intimar-life` (invitation accepted) **and** have write access to the repo, e.g. through an `editores` team with **Write** on `intimar`. Anyone else is turned away at login.

## 2. Deploy the Worker

```sh
cd workers/github-auth
npx wrangler login
npx wrangler secret put GITHUB_CLIENT_ID      # paste the Client ID
npx wrangler secret put GITHUB_CLIENT_SECRET  # paste the client secret
npx wrangler deploy
```

`wrangler deploy` prints the Worker URL (`https://intimar-github-auth.<you>.workers.dev`).

## 3. Point the site at them

Fill in `githubAppClientId` and `authWorkerUrl` in
[`src/lib/admin/config.ts`](../../src/lib/admin/config.ts) and push. Both
values are public, not secrets.
