import { connection } from "next/server";
import { previewHealth } from "@/lib/audit-preview";

export async function GET() {
  await connection();
  return Response.json(previewHealth(), {
    headers: { "Cache-Control": "no-store" },
  });
}
