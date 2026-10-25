import { sampleBaseline } from "@/content/sample-baseline";
import { site } from "@/content/site";
import { type PdfBlock, renderPdf } from "@/lib/simple-pdf";

export function sampleBaselineBlocks(): PdfBlock[] {
  const blocks: PdfBlock[] = [
    { kind: "title", text: sampleBaseline.title },
    { kind: "body", text: `${site.name}. ${site.email}. ${site.phone}.` },
    { kind: "gap" },
    { kind: "body", text: `${sampleBaseline.label}. ${sampleBaseline.lede}` },
    { kind: "gap" },
    { kind: "body", text: `Made-up business: ${sampleBaseline.business}.` },
    { kind: "body", text: `Example task: ${sampleBaseline.task}.` },
  ];
  for (const section of sampleBaseline.sections) {
    blocks.push({ kind: "gap" }, { kind: "heading", text: section.title });
    for (const paragraph of section.paragraphs) {
      blocks.push({ kind: "body", text: paragraph });
    }
  }
  blocks.push({ kind: "gap" }, { kind: "heading", text: "Example calculation" });
  for (const row of sampleBaseline.rows) {
    blocks.push({ kind: "bullet", text: `${row.label}: ${row.amount}. ${row.note}` });
  }
  blocks.push({ kind: "gap" }, { kind: "body", text: sampleBaseline.close });
  return blocks;
}

export function sampleBaselinePdf(): Uint8Array {
  return renderPdf(sampleBaselineBlocks());
}
