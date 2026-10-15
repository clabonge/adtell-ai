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

`npm run dev` serves the site locally. `npm run build` is what Vercel runs. Content changes ship when the site is rebuilt and deployed.

## Content structure

Edit these files. You should not need to change layout components for ordinary copy updates.

| Path | What it controls |
| --- | --- |
| `content/site.ts` | Name, contact email, founder, holding company, divisions, operating companies. The public URL is `NEXT_PUBLIC_SITE_URL` (default `https://adtell.ai`) |
| `content/services.ts` | Service names, prices, summaries, and what each engagement includes |
| `content/faqs.ts` | Questions and answers shown on the homepage |
| `content/process.ts` | The “how it works” steps, plus what we need and what we will not do |
| `content/about.ts` | About-page story and operating principles |
| `content/home.ts` | Homepage cost-pattern cards |
| `content/audit.ts` | Company-size options and the “what to expect” list on the contact page |
| `content/blog/*.md` | Blog posts |
| `content/case-studies/*.md` | Case studies |

Prices on the homepage, the services page, and the hero ledger all come from `content/services.ts`. If you change a price, search `content/blog` and `content/case-studies` in case a post mentions the old figure.

Company names are listed only in `content/site.ts`. Write **Adtell Integration** as two words.

Do not add testimonials, performance statistics, client logos, phone numbers, or street addresses unless they are real and approved. The case study starter is about companies we operate. It is not a client result.

### Contact email

`hello@adtell.ai` in `content/site.ts` is a placeholder.

TODO: confirm the production inbox and update `email`. Form delivery is a separate TODO in `app/api/audit/route.ts`.

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
kind: internal-practice
---
```

`kind: internal-practice` labels the piece as our own operating companies, not a client engagement. Keep these qualitative. Do not add client names or figures that were not measured and approved.

## Pages

- `/` Home
- `/services` Services and published prices
- `/how-it-works` Engagement sequence
- `/about` Chris LaBonge and the operating companies
- `/case-studies` and `/case-studies/[slug]`
- `/blog` and `/blog/[slug]`
- `/contact` Audit intake form
- `/api/audit` Placeholder POST handler
- `/sitemap.xml` and `/robots.txt`

## Production domain

The canonical origin is a single value, `site.url` in `content/site.ts`. It reads `NEXT_PUBLIC_SITE_URL` and defaults to `https://adtell.ai`. That value is what `metadataBase`, canonical links, Open Graph URLs, `sitemap.xml`, `robots.txt`, and JSON-LD use. Canonical and Open Graph URLs are absolute and are built from it.

Set the variable in Vercel only if the public origin changes, then redeploy. Leave it unset to keep the default. Do not point it at a `*.vercel.app` preview URL. Canonicals should stay on `https://adtell.ai`.

### Attach the domain in Vercel

1. Import this repository as a Vercel project and deploy it.
2. Open the project, then **Settings → Domains**.
3. Add `adtell.ai`. Add `www.adtell.ai` as well.
4. Set `adtell.ai` as the primary domain so `www.adtell.ai` redirects to it. Vercel issues the certificate after DNS matches the records it shows on the domain card.
5. If the domain was used on another Vercel account, complete the TXT verification Vercel displays. That record is in addition to the records below.

Use the A and CNAME values on that domain card if they differ from the table. Vercel shows a project-specific CNAME target.

### GoDaddy DNS

The domain is registered at GoDaddy. Leave the nameservers at GoDaddy so existing mail and verification records stay put. Changing nameservers is a different migration and is not required to serve the site.

In GoDaddy: **My Products → adtell.ai → DNS → DNS Records**.

Delete conflicting A, AAAA, and CNAME records for `@` and `www`, and turn off GoDaddy domain forwarding for this domain. Leave MX and other TXT records alone.

Then add:

| Type | Name | Value | TTL |
| --- | --- | --- | --- |
| A | `@` | `76.76.21.21` | 1 Hour |
| CNAME | `www` | The CNAME target from the Vercel domain card | 1 Hour |

`76.76.21.21` is the A record Vercel documents for an apex domain. GoDaddy labels the apex as `@`. Do not put a CNAME on `@`. An apex already has NS and SOA records, and GoDaddy will reject that CNAME or it will conflict with the A record.

The `www` target is not the same for every project. Copy it from **Settings → Domains** after you add the domain. It looks like `cname.vercel-dns.com` or a host such as `<id>.vercel-dns-017.com`. If GoDaddy adds a trailing dot, that is fine.

After the records propagate, the Vercel domain card should report a valid configuration. Check `https://adtell.ai`, view source for `rel="canonical"` pointing at `https://adtell.ai`, and open `https://adtell.ai/sitemap.xml` and `https://adtell.ai/robots.txt`.

## Audit form

The contact form posts JSON to `/api/audit`. The route validates the payload and returns `delivered: false`.

TODO: connect that route to email (or a CRM) so submissions reach the inbox in `content/site.ts`. Do not commit API keys. Do not log the request body. Until that exists, the contact page asks the visitor to email the same details directly.
