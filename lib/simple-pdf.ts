/** A small WinAnsi PDF writer for the CFO brief. Helvetica only. */

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 54;

const WIN_ANSI: Record<number, number> = {
  0x2013: 0x96,
  0x2014: 0x97,
  0x2018: 0x91,
  0x2019: 0x92,
  0x201c: 0x93,
  0x201d: 0x94,
  0x2022: 0x95,
  0x00b7: 0xb7,
};

function pdfString(text: string): string {
  let out = "";
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0x3f;
    const byte = code <= 0x7f ? code : (WIN_ANSI[code] ?? (code >= 0xa0 && code <= 0xff ? code : 0x3f));
    if (byte === 0x5c || byte === 0x28 || byte === 0x29) {
      out += `\\${String.fromCharCode(byte)}`;
    } else if (byte < 32 || byte > 126) {
      out += `\\${byte.toString(8).padStart(3, "0")}`;
    } else {
      out += String.fromCharCode(byte);
    }
  }
  return `(${out})`;
}

function wrap(text: string, size: number): string[] {
  const width = PAGE_WIDTH - MARGIN * 2;
  const maxChars = Math.max(24, Math.floor(width / (size * 0.5)));
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const next = line ? `${line} ${word}` : word;
    if (next.length > maxChars && line) {
      lines.push(line);
      line = word;
    } else {
      line = next;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export type PdfBlock =
  | { kind: "title"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "body"; text: string }
  | { kind: "bullet"; text: string }
  | { kind: "gap" };

export function renderPdf(blocks: readonly PdfBlock[]): Uint8Array {
  const pages: string[] = [];
  let commands: string[] = [];
  let y = PAGE_HEIGHT - MARGIN;

  const ensure = (need: number) => {
    if (y - need >= MARGIN) return;
    pages.push(commands.join("\n"));
    commands = [];
    y = PAGE_HEIGHT - MARGIN;
  };

  const write = (text: string, size: number, indent = 0) => {
    const leading = size + 4;
    ensure(leading);
    commands.push(
      "BT",
      `/F1 ${size} Tf`,
      `${MARGIN + indent} ${y.toFixed(1)} Td`,
      `${pdfString(text)} Tj`,
      "ET",
    );
    y -= leading;
  };

  for (const block of blocks) {
    if (block.kind === "gap") {
      y -= 8;
      continue;
    }
    const size = block.kind === "title" ? 18 : block.kind === "heading" ? 13 : 11;
    const indent = block.kind === "bullet" ? 14 : 0;
    const prefix = block.kind === "bullet" ? "- " : "";
    const lines = wrap(`${prefix}${block.text}`, size);
    if (block.kind === "heading") y -= 6;
    for (const line of lines) write(line, size, indent);
  }
  pages.push(commands.join("\n"));

  const objects: string[] = [];
  const pageIds: number[] = [];
  const fontId = 3 + pages.length * 2;
  objects[1] = "<< /Type /Catalog /Pages 2 0 R >>";
  for (let index = 0; index < pages.length; index += 1) {
    const pageId = 3 + index * 2;
    const contentId = pageId + 1;
    pageIds.push(pageId);
    const stream = pages[index];
    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Contents ${contentId} 0 R /Resources << /Font << /F1 ${fontId} 0 R >> >> >>`;
    objects[contentId] = `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }
  objects[2] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
  objects[fontId] = "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  let body = "%PDF-1.4\n";
  const offsets = [0];
  for (let id = 1; id < objects.length; id += 1) {
    if (!objects[id]) continue;
    offsets[id] = body.length;
    body += `${id} 0 obj\n${objects[id]}\nendobj\n`;
  }
  const xref = body.length;
  const size = objects.length;
  let table = `xref\n0 ${size}\n`;
  table += "0000000000 65535 f \n";
  for (let id = 1; id < size; id += 1) {
    table += `${String(offsets[id] ?? 0).padStart(10, "0")} 00000 n \n`;
  }
  body += `${table}trailer\n<< /Size ${size} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return new TextEncoder().encode(body);
}

export function pdfText(bytes: Uint8Array): string {
  return new TextDecoder().decode(bytes);
}
