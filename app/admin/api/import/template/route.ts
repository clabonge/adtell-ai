import { NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { authorizeRequest } from "@/lib/crm/http";

export async function GET(request: Request) {
  const access = await authorizeRequest(request);
  if (!access.ok) return access.response;
  const csv = readFileSync(join(process.cwd(), "content", "crm-import-template.csv"), "utf8");
  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=\"adtell-crm-import-template.csv\"",
      "Cache-Control": "private, no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
