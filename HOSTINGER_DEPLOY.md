# Hostinger deployment guide (Node 20 friendly)

This guide explains how to deploy DMA-LMS-SYSTEM to Hostinger and how to run Prisma with Supabase. You asked to remain on Node 20 for runtime; the recommended approach when Node 20 shows compatibility issues is to build locally (or in CI) with Node 22 and upload the artifacts. Below are both workflows.

## Quick summary (recommended)
- Build the project locally (or in CI) and upload the built artifacts to Hostinger. This avoids runtime/package engine problems on Node 20.

## Environment variables (set these in Hostinger panel or in a local `.env` for builds)
- DATABASE_URL: pooled Supabase connection (pgbouncer, port 6543)
- DIRECT_URL: direct Supabase connection (for migrations, port 5432)
- SUPABASE_URL: https://<project_ref>.supabase.co
- SUPABASE_API_KEY: Supabase anon or service_role (keep service_role secret, use only server-side)
- JWT_SECRET: random string ≥ 32 chars
- COOKIE_NAME, REFRESH_COOKIE_NAME, JWT_EXPIRES_IN
- PORT (Hostinger usually overrides)
- FRONTEND_URL
- SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_SUPER_ADMIN_EMAIL, SEED_SUPER_ADMIN_PASSWORD
- SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, EMAIL_FROM_NAME

## Workflow A — Build locally / in CI and upload (recommended when Hostinger Node is 20)
1. Use a local machine or CI to build (Node 22 recommended here to avoid package engine issues):
   - nvm install 22 && nvm use 22
   - copy `.env.example` → `.env` and fill values (do NOT commit `.env`)
   - npm ci
   - npm run db:generate        # optional — prisma client
   - npm run db:push            # push schema to Supabase (use DIRECT_URL if needed)
   - npm run db:seed            # run only on first deploy (SEED_* env values required)
   - npm run build
2. Upload the following to your Hostinger file manager (or push to GitHub and let Hostinger pull):
   - dist/ (compiled server and frontend assets)
   - prisma/ (schema & migrations if you need to run changes on server)
   - package.json
   - package-lock.json
   - app.js
   - any root-level files required by runtime
3. On Hostinger > Node.js app panel:
   - Application startup file: `app.js` (recommended) or `dist/server.cjs`
   - Node version: choose the highest available (if 22 is available, use it; if only 20, the uploaded build should still run)
   - Set all the environment variables listed above
4. In Hostinger Terminal (or via SSH):
   - npm ci --omit=dev
   - (If you didn't run migrations locally) npm run db:push  # only if DIRECT_URL/DATABASE_URL are available on host
   - (First deploy only) npm run db:seed
   - App should be started automatically by Hostinger. If needed: npm start

## Workflow B — Build on Hostinger (Node 20 runtime and build)
If you must build on Hostinger and the panel provides only Node 20, do the following but expect possible package/engine issues.

1. Set the environment variables in Hostinger panel (as above).
2. In Hostinger Terminal:
   - npm ci
   - npm run db:generate
   - npm run db:push
   - npm run db:seed
   - npm run build
   - npm start

If you encounter errors during `npm ci` or `npm run build` that reference `engines` or Node API incompatibilities, consider either building locally (Workflow A) or pinning older compatible versions of offending packages (see troubleshooting below).

## Prisma + Supabase specifics
- DATABASE_URL (runtime): use the pooled connection string (port 6543). This is what Prisma should use at runtime if your pooler is configured.
- DIRECT_URL (migrations / admin ops): use the direct Postgres URL (port 5432). When running `prisma db push` or migrations, prefer DIRECT_URL.
- Typical sequence:
  - prisma generate (creates client used by server)
  - prisma db push (push schema to DB)
  - prisma db seed (create initial admin users using SEED_* env vars)

Notes:
- Keep DIRECT_URL secret — it often contains higher privileges.
- If `prisma db push` fails when using the pooled DATABASE_URL, retry with DIRECT_URL.

## Troubleshooting common errors on Node 20
- Engine warnings: if `npm ci` warns about engines but succeeds, test `npm run build` — runtime failures are possible.
- If specific packages (e.g., `@supabase/*`) require Node >=22, you can:
  - Option 1: Build locally with Node 22 and upload artifacts (recommended).
  - Option 2: Pin package versions that support Node 20 (requires testing). Example approach:
    - Identify package and version from error output.
    - Set an explicit compatible version in `package.json`.
    - rm -rf node_modules package-lock.json
    - npm ci
  - Option 3: Use a container or VM with Node 22 for build and deploy the built artifact to Hostinger.

## Security notes
- Rotate any keys that were committed to the repository (you previously had a Supabase key in git). Replace with new keys and only store them in Hostinger environment variables.
- Do not commit `.env` or real secrets to git.

## Useful Hostinger panel settings
- Startup file: app.js
- Install command (Terminal): npm ci --omit=dev
- Start command: npm start (Hostinger will manage process lifecycle)
- Node version: choose the highest available; if only 20 is present, use Workflow A to upload built artifacts.

---

If you want, I can commit the following helper files to the repo now:
- `.env.production.example` (placeholders only)
- `.nvmrc` (set to 20 as you requested)
- `HOSTINGER_DEPLOY.md` (this file)

Say yes and I will commit them now.
