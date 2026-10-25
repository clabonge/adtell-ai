import fs from "node:fs";
import path from "node:path";

export type Collection = "blog" | "case-studies";

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string;
  kind?: string;
  body: string;
};

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

function parseFrontMatter(
  raw: string,
  file: string,
): { data: Record<string, string>; body: string } {
  const normalized = raw.replace(/^\uFEFF/, "");
  const match = normalized.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    throw new Error(
      `${file}: start the file with front matter wrapped in --- lines.`,
    );
  }

  const data: Record<string, string> = {};
  for (const line of match[1].split(/\r?\n/)) {
    if (!line.trim()) continue;
    const separator = line.indexOf(":");
    if (separator === -1) {
      throw new Error(`${file}: cannot read front matter line "${line}".`);
    }
    const key = line.slice(0, separator).trim();
    let value = line.slice(separator + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    data[key] = value;
  }

  return { data, body: match[2].trim() };
}

function readCollection(collection: Collection): Post[] {
  const directory = path.join(process.cwd(), "content", collection);
  if (!fs.existsSync(directory)) return [];

  return fs
    .readdirSync(directory)
    .filter((file) => file.endsWith(".md"))
    .map((file) => {
      const slug = file.slice(0, -3);
      const fullPath = path.join(directory, file);
      if (!SLUG.test(slug)) {
        throw new Error(
          `${fullPath}: use a lowercase kebab-case filename. That name is the URL slug.`,
        );
      }

      const { data, body } = parseFrontMatter(
        fs.readFileSync(fullPath, "utf8"),
        fullPath,
      );

      for (const key of ["title", "description", "date"] as const) {
        if (!data[key]) {
          throw new Error(`${fullPath}: front matter is missing "${key}".`);
        }
      }
      if (!DATE.test(data.date)) {
        throw new Error(`${fullPath}: date must be YYYY-MM-DD.`);
      }
      if (!body) {
        throw new Error(`${fullPath}: write the post under the front matter.`);
      }
      if (collection === "case-studies" && !data.kind) {
        throw new Error(
          `${fullPath}: case studies need a kind field. Use kind: implementation for a business we helped.`,
        );
      }

      return {
        slug,
        title: data.title,
        description: data.description,
        date: data.date,
        kind: data.kind,
        body,
      };
    })
    .sort((a, b) => {
      if (a.date === b.date) return a.slug < b.slug ? -1 : a.slug > b.slug ? 1 : 0;
      return a.date < b.date ? 1 : -1;
    });
}

export function getPosts(collection: Collection): Post[] {
  return readCollection(collection);
}

export function getPost(collection: Collection, slug: string): Post | undefined {
  return readCollection(collection).find((post) => post.slug === slug);
}

export function kindLabel(kind: string | undefined): string | undefined {
  if (!kind) return undefined;
  if (kind === "implementation") return "Implementation";
  return kind;
}
