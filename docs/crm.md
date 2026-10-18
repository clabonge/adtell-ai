# Adtell.ai private CRM

The public site stays a marketing site. `/admin/crm` is a private pipeline for the owner. Inquiries are stored in Postgres before the visitor is told the request was received. Email and webhook delivery are separate jobs and are sent by a worker, not by the web request.

This phase does not add automated outreach, billing, or a client portal.

## Local setup

1. Install dependencies with `npm ci`.
2. Start Postgres on your own machine. A local Docker example, which you run yourself:

```bash
docker run --name adtell-pg -e POSTGRES_PASSWORD=adtell -e POSTGRES_DB=adtell -p 5432:5432 -d postgres:16
```

3. Copy `.env.example` to `.env.local` and set `DATABASE_URL`. Do not commit `.env.local`.
4. Apply migrations:

```bash
npm run db:migrate
```

Migrations do not run when the website starts. Run `npm run db:migrate` only against the database you mean to change.

5. Create an owner password hash. The command reads the password from stdin and prints the hash. It does not store either one.

```bash
npm run crm:hash-password
```

Put the hash in `CRM_OWNER_PASSWORD_HASH`. Set `CRM_OWNER_EMAIL` to your email and `CRM_SESSION_SECRET` to a random string of at least 32 characters. There is no default password. If these are missing, `/admin/crm` says the CRM is not configured.

6. Start the site with `npm run dev` and open `/admin/crm/login`.
7. In another terminal, start the worker when you want notifications delivered:

```bash
npm run crm:worker
```

Stop it with Ctrl+C. It finishes the job it is on, or the lease expires and another worker can pick the job up.

`npm run crm:seed-demo` inserts one labeled synthetic company only when `NODE_ENV=development`, `CRM_SEED_DEMO=1`, and the database host is localhost. It refuses remote databases. Do not treat that row as a prospect.

## What the visitor sees

The form keeps the `company_website` honeypot. That field is not a company website.

A saved request returns `{ "ok": true, "received": true }`. The page says “Your request has been received.” It does not say an email was sent. The same submission key and the same answers return that success again and do not create a second inquiry. The same key with different answers is rejected. A later, separate request from the same person is stored as its own inquiry.

If the database is down, the response is `503` with “We could not save your request. Please try again.” The page also shows the public email and phone.

Rate limits are stored in Postgres, so they apply across more than one web instance. The defaults are 3 requests a minute and 10 an hour for an address. `CRM_RATE_PER_MINUTE` and `CRM_RATE_PER_HOUR` can change those limits.

## Notifications

A job is queued only for a channel that is configured when the inquiry is saved.

- `RESEND_API_KEY` queues an email to `clabonge@adtell.ai`.
- `AUDIT_WEBHOOK_URL` queues a webhook. The URL must be https, except `http://127.0.0.1` and `http://localhost` for local checks. The form cannot choose this URL.

One channel succeeding does not cancel the other. The worker claims jobs with `FOR UPDATE SKIP LOCKED`, holds a 60 second lease, and uses bounded backoff: 30 seconds, then double, capped at one hour, for up to 5 attempts. Failed jobs are listed at `/admin/crm/notifications` and can be retried there.

Delivery is at-least-once. If the worker sends a message and then crashes before it records success, another worker can send it again after the lease expires. Resend receives a stable `Idempotency-Key`. Resend’s own deduplication window is limited, so a retry after that window can send a second email. Webhooks include the same id in `X-Adtell-Event-Id` and in the JSON `eventId`. Receivers should ignore a repeated id. A lost lease is not marked successful.

The default sender remains `Adtell.ai <onboarding@resend.dev>` until `RESEND_FROM` is set. That default can deliver only to the Resend account address.

## Owner guide

Sign in at `/admin/crm/login`. The session cookie is httpOnly, `SameSite=Lax`, and limited to `/admin`. It lasts 12 hours. Production cookies are also `Secure`. Changing pages and saving forms requires that session. Saves also check the origin and a CSRF token. Pages send `Cache-Control: private, no-store` and are omitted from the sitemap. `robots.txt` disallows `/admin`.

Stages are: researched, contacted, qualified, audit booked, proposal sent, won, lost, and nurture.

An inbound audit starts at contacted. It is not marked audit booked. The next action is “Review the audit request.” Research imports start at researched. Owner-added contacts start at the stage you choose, usually researched.

The pipeline filters by company, origin, stage, and follow-up date. Follow-up dates use the America/New_York calendar. Overdue follow-ups are listed above the table.

The report shows lead source, opportunities that reached audit booked, proposal sent, and won, plus estimated value. Those dollar figures are estimates. They are not revenue. Blank estimates stay blank.

Open a company to see the contact, inquiries, notes, and activity. You can change stage, priority, the estimate, the next action, and owner notes. Marketing consent stays off until you record separate evidence. An inquiry or a public email is not consent.

Unknown fields stay blank. The CRM does not invent prospects.

## CSV import and export

Download the template while signed in: `/admin/api/import/template`. The same headers are in `content/crm-import-template.csv`.

Columns: company, website, industry, location, contact_name, contact_title, email, source_url, research_date, fit_notes, verification_status, origin, next_action.

`verification_status` is `unknown`, `unverified`, `verified`, or blank. `origin` is `research`, `owner`, or blank (research). `research_date` is `YYYY-MM-DD` or blank. Do not put inbound inquiries in this file.

Preview the file before anything is saved. The preview shows per-row errors and duplicate suggestions. Confirming saves only ready rows. Confirming the same file again does not create duplicates. A row that matches a verified contact and would change filled-in details is rejected. Ambiguous companies or contacts are not merged. Research imports do not send email and do not grant marketing consent.

Export from the pipeline page. Cells that start with `=`, `+`, `-`, `@`, a tab, or a carriage return are prefixed so a spreadsheet does not treat them as formulas. The value column is named `estimated_value_usd_not_revenue`.

## Backup and restore

Take a backup before a production migration or restore. Prefer the Postgres provider’s backup tool when you have one. From a trusted machine:

```bash
pg_dump --format=custom --no-owner --file adtell-crm.dump "$DATABASE_URL"
pg_restore --clean --if-exists --no-owner --dbname "$DATABASE_URL" adtell-crm.dump
```

Restore into a copy first and read it in `/admin/crm` before you point the live service at it. Do not run either command against production until you intend to.

## Render rollout

`render.yaml` is the production Blueprint. A sync of `main` is what creates the database and the worker. The web service plan is not set in that file, so a sync leaves the current web instance type alone.

The Blueprint adds:

- Postgres named `adtell-crm`, plan `0.1c-256mb`, region `oregon`, private network only (`ipAllowList: []`). This is the smallest plan that keeps data. A free Render Postgres database expires after 30 days and has no backups, so it is not used.
- `DATABASE_URL` on the web service and the worker, taken from the database internal connection string. The URL is not in git.
- `CRM_SESSION_SECRET`, generated by Render the first time the variable is missing. It is not in git.
- `CRM_OWNER_EMAIL` set to `clabonge@adtell.ai`.
- A background worker named `adtell-crm-worker`, plan `0.5c-512mb` (the smallest worker; there is no free worker), region `oregon`. Its pre-deploy command is `npm run db:migrate`. Its start command is `npm run crm:worker`. It copies `RESEND_API_KEY`, `RESEND_FROM`, and `AUDIT_WEBHOOK_URL` from the web service.

The web build runs `npm run db:migrate` only when `DATABASE_URL` is set. The site start command does not migrate. Both migrate paths are idempotent and take a session lock so they can overlap.

`CRM_OWNER_PASSWORD_HASH` is not in the Blueprint. Render does not apply new `sync: false` secrets to an existing Blueprint, and the hash must not be committed. Until that variable is set on the `adtell-ai` web service, `/admin/crm` says the CRM is not configured. Inquiries can still be saved. Create the hash with `npm run crm:hash-password`, paste it into the web service environment, and redeploy. Do not set `CRM_SEED_DEMO` on Render.

After a sync, send one labeled audit from `/contact` and confirm `{ "ok": true, "received": true }` before relying on email. A queued notification is not proof the message was delivered. Confirm `/` and `/contact` still render when you are signed out.

If a push to `main` redeploys the website but does not create `adtell-crm`, Blueprint auto-sync is off. In the Render dashboard, open the Blueprint and apply `render.yaml` from `main`. Do not create a second web service.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run db:migrate` | Apply versioned SQL in `db/migrations` |
| `npm run crm:worker` | Deliver queued email and webhook jobs |
| `npm run crm:hash-password` | Print a password hash |
| `npm run crm:seed-demo` | Local synthetic row only |
| `npm test` | CRM tests on embedded Postgres |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |
| `npm run build` | Production build |
