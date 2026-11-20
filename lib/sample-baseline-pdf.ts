import { sampleBaseline, savingsMeasurement } from "@/content/sample-baseline";
import { publicContactLine } from "@/lib/booking";
import { type PdfBlock, renderPdf } from "@/lib/simple-pdf";

export function sampleBaselineBlocks(): PdfBlock[] {
  const blocks: PdfBlock[] = [
    { kind: "title", text: sampleBaseline.title },
    { kind: "body", text: publicContactLine() },
    { kind: "gap" },
    { kind: "body", text: `${sampleBaseline.label}. ${sampleBaseline.lede}` },
    { kind: "gap" },
    { kind: "body", text: sampleBaseline.fictionalLabel },
    { kind: "body", text: `Example task: ${sampleBaseline.task}.` },
  ];
  for (const section of sampleBaseline.sections) {
    blocks.push({ kind: "gap" }, { kind: "heading", text: section.title });
    for (const paragraph of section.paragraphs) {
      blocks.push({ kind: "body", text: paragraph });
    }
  }
  const measurement = savingsMeasurement.body.trim();
  if (measurement) {
    blocks.push({ kind: "gap" }, { kind: "heading", text: savingsMeasurement.title });
    blocks.push({ kind: "body", text: measurement });
  }
  blocks.push({ kind: "gap" }, { kind: "heading", text: "Example calculation" });
  for (const row of sampleBaseline.rows) {
    const note = row.note.trim();
    blocks.push({
      kind: "bullet",
      text: note ? `${row.label}: ${row.amount}. ${note}` : `${row.label}: ${row.amount}.`,
    });
  }
  blocks.push({ kind: "gap" }, { kind: "body", text: sampleBaseline.close });
  return blocks;
}

export function sampleBaselinePdf(): Uint8Array {
  return renderPdf(sampleBaselineBlocks());
}
