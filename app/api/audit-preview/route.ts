import { connection } from "next/server";
import { auditPreviewConfigured, handleAuditPreview } from "@/lib/audit-preview";

export async function GET() {
  await connection();
  return Response.json(
    { enabled: auditPreviewConfigured() },
    { headers: { "Cache-Control": "no-store" } },
  );
}

export async function POST(request: Request) {
  await connection();
  return handleAuditPreview(request);
}
