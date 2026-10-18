import { NextResponse } from "next/server";
import { toCsv } from "@/lib/crm/csv";
import { dollarsFromCents } from "@/lib/crm/text";
import { authorizeRequest } from "@/lib/crm/http";
import { csrfMatches } from "@/lib/crm/auth";
import { exportRows } from "@/lib/crm/queries";
import { logSafe } from "@/lib/crm/text";

export async function GET(request: Request) {
  const access = await authorizeRequest(request);
  if (!access.ok) return access.response;
  const csrf = new URL(request.url).searchParams.get("csrf");
  if (!csrfMatches(csrf, access.session.csrfToken)) {
    return NextResponse.json({ ok: false, error: "The request was rejected." }, { status: 403 });
  }
  try {
    const rows = await exportRows(access.db);
    const csv = toCsv([
      [
        "company",
        "website",
        "industry",
        "location",
        "contact_name",
        "contact_title",
        "email",
        "origin",
        "stage",
        "priority",
        "estimated_value_usd_not_revenue",
        "next_action",
        "next_action_on",
        "verification_status",
        "marketing_consent",
        "source_url",
        "researched_on",
      ],
      ...rows.map((row) => [
        row.company,
        row.website,
        row.industry,
        row.location,
        row.contactName,
        row.contactTitle,
        row.email,
        row.origin,
        row.stage,
        row.priority,
        row.estimatedValueCents === null ? "" : dollarsFromCents(row.estimatedValueCents),
        row.nextAction,
        row.nextActionOn,
        row.verificationStatus,
        row.marketingConsent ? "true" : "false",
        row.sourceUrl,
        row.researchedOn,
      ]),
    ]);
    return new NextResponse(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": "attachment; filename=\"adtell-crm.csv\"",
        "Cache-Control": "private, no-store",
        "Referrer-Policy": "no-referrer",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (err) {
    logSafe("crm export", err);
    return NextResponse.json({ ok: false, error: "The CRM database is unavailable." }, { status: 503 });
  }
}
