import { cfoBrief } from "@/content/cfo-brief";
import { site } from "@/content/site";
import { type PdfBlock, renderPdf } from "@/lib/simple-pdf";

export function cfoBriefBlocks(): PdfBlock[] {
  const blocks: PdfBlock[] = [
    { kind: "title", text: cfoBrief.title },
    { kind: "body", text: `${site.name}. ${site.email}. ${site.phone}.` },
    { kind: "gap" },
    { kind: "body", text: cfoBrief.lede },
    { kind: "gap" },
    { kind: "heading", text: "Published prices" },
  ];
  for (const price of cfoBrief.prices) {
    blocks.push({
      kind: "bullet",
      text: price.aside ? `${price.name}: ${price.price}. ${price.aside}.` : `${price.name}: ${price.price}`,
    });
  }
  for (const section of cfoBrief.sections) {
    blocks.push({ kind: "gap" }, { kind: "heading", text: section.title });
    for (const point of section.points) {
      blocks.push({ kind: "bullet", text: point });
    }
  }
  blocks.push(
    { kind: "gap" },
    { kind: "body", text: "The final terms are set in each client's written agreement." },
  );
  return blocks;
}

export function cfoBriefPdf(): Uint8Array {
  return renderPdf(cfoBriefBlocks());
}
