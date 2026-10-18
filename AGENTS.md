<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Adtell.ai content

Service copy, pricing, FAQs, and posts live under `content/`. Read `README.md` before editing marketing copy. The site speaks as Adtell.ai ("we"). Businesses on the helped list are implementations, not companies Chris owns or runs. Do not add Adtell Integration to that list. Do not invent testimonials, statistics, results, client logos, or street addresses. The public email is `clabonge@adtell.ai` and the public phone is `215-499-8959`. Do not use em dashes in marketing copy. Audit requests are saved in Postgres before the site confirms receipt. Email (`RESEND_API_KEY`) and webhook (`AUDIT_WEBHOOK_URL`) are queued independently and sent by `npm run crm:worker`. Do not commit keys or log form bodies. See `docs/crm.md`.
