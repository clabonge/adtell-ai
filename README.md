# Adtell.ai

Marketing site for Adtell.ai, the AI consulting practice led by Chris LaBonge, Founder & President of Adtell Inc. The site is a Next.js app (App Router, TypeScript, Tailwind). Production is [https://adtell.ai](https://adtell.ai).

## Scripts

```bash
npm install
npm run dev
npm run lint
npm run build
npm start
```

`npm run dev` serves the site locally. `npm start` runs the production Node server. It listens on `0.0.0.0` and on `PORT` (3000 when `PORT` is unset). Render sets `PORT` for the service. Content changes ship when the site is rebuilt and deployed.

## Content structure

Edit these files. You should not need to change layout components for ordinary copy updates.

| Path | What it controls |
| --- | --- |
| `content/site.ts` | Name, contact email, founder, and the businesses Adtell.ai has helped, each with a goal and how the automation works. The public URL is `NEXT_PUBLIC_SITE_URL` (default `https://adtell.ai`) |
| `content/services.ts` | Service names, prices, summaries, and what each engagement includes |
| `content/faqs.ts` | Questions and answers shown on the homepage |
| `content/process.ts` | The “how it works” steps, plus what we need and what we will not do |
| `content/about.ts` | About-page story and operating principles |
| `content/home.ts` | Homepage cost-pattern cards |
| `content/audit.ts` | Company-size options and the “what to expect” list on the contact page |
| `content/blog/*.md` | Blog posts |
| `content/case-studies/*.md` | Case studies |

Prices on the homepage, the services page, and the hero ledger all come from `content/services.ts`. If you change a price, search `content/blog` and `content/case-studies` in case a post mentions the old figure.

Company names on the public site are listed only in `content/site.ts`. The site speaks as Adtell.ai ("we") and describes those businesses as implementations we helped. Do not write that Chris owns, runs, or operates them. Do not add Adtell Integration to that list. Do not write that they are not clients, and do not use the phrases "operator, not a theorist" or "companies we run".

Do not add testimonials, performance statistics, client logos, or street addresses unless they are real and approved. The public email is `clabonge@adtell.ai` and the public phone is `215-499-8959`, both in `content/site.ts`. Do not invent other contact details. Describe a goal and how the automation works. Do not invent results or figures. Do not use em dashes in marketing copy.

## How to add a blog post

1. Create a file in `content/blog/`. The filename is the URL slug. Use lowercase kebab-case, for example `content/blog/name-the-workflow-first.md` becomes `/blog/name-the-workflow-first`.
2. Start the file with front matter. Quote the title and description if they contain a colon.

```md
---
title: "Name the workflow first"
description: "One sentence used as the summary and the meta description."
date: "2026-10-15"
---

The page title is the front matter title. Do not add an h1 in the body.

## A section

Write normal Markdown. Internal links use site paths, such as [the audit](/contact).
```

3. Required fields are `title`, `description`, and `date` (`YYYY-MM-DD`).
4. Save the file. The blog index, the post page, and `sitemap.xml` pick it up on the next build. No layout or route code needs to change.

## How to add a case study

Same as a post, in `content/case-studies/`, with one extra field:

```md
---
title: "A title that does not invent a result"
description: "Summary used on the index and in meta tags."
date: "2026-10-15"
kind: implementation
---
```

`kind: implementation` labels a business we helped. Keep it qualitative: the goal and how the automation works. Do not add results or figures.

## Pages

- `/` Home
- `/services` Services and published prices
- `/how-it-works` Engagement sequence
- `/about` Adtell.ai, the firm, and Chris LaBonge as founder
- `/case-studies` and `/case-studies/[slug]`
- `/blog` and `/blog/[slug]`
- `/contact` Audit intake form
- `/api/audit` Audit form intake
- `/admin/crm` Private owner CRM. See `docs/crm.md`.
- `/sitemap.xml` and `/robots.txt`

## Deploy on Render

Production hosting is Render, from the Blueprint in `render.yaml`. That file defines:

- The Node web service `adtell-ai`. Build: `npm ci && npm run build`, then `npm run db:migrate` when `DATABASE_URL` is set. Start: `npm start` (Next.js production server on `0.0.0.0` and Render's `PORT`). The instance type is not in the Blueprint, so sync leaves the current web plan alone.
- Postgres `adtell-crm` on plan `0.1c-256mb` in Oregon, reachable on the private network only. `DATABASE_URL` is wired from that database and is not committed.
- A background worker `adtell-crm-worker` on plan `0.5c-512mb`. Pre-deploy runs `npm run db:migrate`. Start runs `npm run crm:worker`.

Shared settings:

- Node.js `22.14.0`, also pinned in `.node-version` and `package.json` `engines`
- `NEXT_PUBLIC_SITE_URL=https://adtell.ai`
- Branch `main`, with a deploy on every push to that branch
- Custom domain `adtell.ai`. Render also adds `www.adtell.ai` and redirects it to the apex

The app is a standard Node server. It does not use Vercel-only runtime features. `/api/audit` is a Node route handler.

The canonical origin is a single value, `site.url` in `content/site.ts`. It reads `NEXT_PUBLIC_SITE_URL` and defaults to `https://adtell.ai`. That value is what `metadataBase`, canonical links, Open Graph URLs, `sitemap.xml`, `robots.txt`, and JSON-LD use. The Blueprint sets the variable so canonicals stay on `https://adtell.ai` rather than the `onrender.com` hostname. Change it only if the public origin changes, then redeploy.

### Create the service

1. In the Render dashboard, choose **New → Blueprint**.
2. Connect the GitHub repository and select this repo. Render reads `render.yaml`.
3. Apply the Blueprint. It creates the `adtell-ai` web service from `main`.
4. Open the service, then **Settings → Custom Domains**. `adtell.ai` is declared in the Blueprint. Render pairs `www.adtell.ai` and redirects it to `https://adtell.ai`. Add a name only if it is missing. Do not flip the redirect so the apex points at `www`.
5. Copy the service's `onrender.com` hostname from the top of the service page. That hostname is the `www` CNAME target below.

### GoDaddy DNS

The domain is registered at GoDaddy. Leave the nameservers at GoDaddy so existing mail and verification records stay put.

These records are the ones in Render's current custom-domain guide for a DNS host that has no `ANAME` or `ALIAS` record (GoDaddy does not). Source: [Configuring DNS Providers](https://render.com/docs/configure-other-dns).

In GoDaddy: **My Products → adtell.ai → DNS → DNS Records**.

Delete conflicting A and CNAME records for `@` and `www`. Delete every AAAA record for this domain. Render is IPv4 only, and an AAAA record can block certificate issuance. Turn off GoDaddy domain forwarding. Leave MX and other TXT records alone.

Then add:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | `@` | `216.24.57.1` | 1 Hour |
| CNAME | `www` | The service hostname, `adtell-ai.onrender.com` unless Render shows a different `onrender.com` host | 1 Hour |

`216.24.57.1` is Render's load-balancer address for an apex `A` record. GoDaddy labels the apex as `@`. Do not put a CNAME on `@`. GoDaddy rejects that, and an apex already has NS and SOA records.

The `www` CNAME always points at this service's `onrender.com` hostname, not a shared Render hostname. With the Blueprint service name `adtell-ai`, that host is `adtell-ai.onrender.com` when the name is free. If Render had to add a suffix, use the hostname shown on the service page instead. A trailing dot added by GoDaddy is fine.

After the records propagate, use **Verify** on the custom domain in Render. Render requests the certificate. Then check `https://adtell.ai`, view source for `rel="canonical"` pointing at `https://adtell.ai`, and open `https://adtell.ai/sitemap.xml`, `https://adtell.ai/robots.txt`, and a POST to `https://adtell.ai/api/audit`.

## Audit form and private CRM

The contact form posts JSON to `/api/audit`. A successful response is `{ "ok": true, "received": true }` only after the inquiry, related CRM records, and notification jobs are committed. The visitor then sees “Your request has been received.” That sentence does not mean an email was sent.

Email and webhook are separate jobs. The worker command is `npm run crm:worker`. If the database is down, the route returns `503` and does not claim the request was received. Setup, the owner CRM, import, backup, and the Render Blueprint are in `docs/crm.md`.

| Env var | Required | What it does |
| --- | --- | --- |
| `DATABASE_URL` | For saving inquiries | Postgres connection string. Do not commit it. |
| `RESEND_API_KEY` | For the email job | When set, the worker emails `clabonge@adtell.ai`. |
| `RESEND_FROM` | No | Sender address. Default is `Adtell.ai <onboarding@resend.dev>`. |
| `AUDIT_WEBHOOK_URL` | No | Trusted server URL for the webhook job. It is not taken from the form. |
| `CRM_SESSION_SECRET` | For owner sign-in | At least 32 characters. |
| `CRM_OWNER_EMAIL` | For owner sign-in | The only account. There is no signup. |
| `CRM_OWNER_PASSWORD_HASH` | For owner sign-in | scrypt hash from `npm run crm:hash-password`. |

`render.yaml` creates the database and the worker. It does not contain `DATABASE_URL`, `CRM_SESSION_SECRET`, or `CRM_OWNER_PASSWORD_HASH`. Set the password hash on the web service in the Render dashboard. See `docs/crm.md`.
