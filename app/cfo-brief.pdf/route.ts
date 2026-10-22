import { cfoBriefPdf } from "@/lib/cfo-brief-pdf";

export function GET() {
  const body = cfoBriefPdf();
  return new Response(Buffer.from(body), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="adtell-cfo-brief.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
