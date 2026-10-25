import { sampleBaselinePdf } from "@/lib/sample-baseline-pdf";

export function GET() {
  const body = sampleBaselinePdf();
  return new Response(Buffer.from(body), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="adtell-sample-savings-baseline.pdf"',
      "Cache-Control": "public, max-age=3600",
    },
  });
}
