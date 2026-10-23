import type { MetadataRoute } from "next";
import { industries, industryPath, whoWeHelp } from "@/content/industries";
import { sampleAudit } from "@/content/sample-audit";
import { site } from "@/content/site";
import { getPosts } from "@/lib/posts";

function lastModifiedFor(path: string): string {
  if (path === sampleAudit.path) return sampleAudit.updated;
  const key = (path || "/") as keyof typeof site.pageUpdated;
  if (key in site.pageUpdated) return site.pageUpdated[key];
  return site.updated;
}

function postLastModified(path: string, date: string): string {
  const base = date > site.updated ? date : site.updated;
  const key = path as keyof typeof site.pageUpdated;
  if (key in site.pageUpdated && site.pageUpdated[key] > base) return site.pageUpdated[key];
  return base;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = [
    "",
    "/services",
    "/how-it-works",
    "/about",
    "/case-studies",
    "/blog",
    "/contact",
    "/privacy",
    "/terms",
    "/cfo-brief",
    sampleAudit.path,
  ];

  const pages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: new URL(path || "/", site.url).toString(),
    lastModified:
      path === "/services" || path === "/cfo-brief" ? "2026-10-23" : lastModifiedFor(path),
    changeFrequency: path === "" || path === "/blog" ? "weekly" : "monthly",
    priority: path === "" ? 1 : path === "/services" || path === "/contact" ? 0.8 : 0.7,
  }));

  const posts = [
    ...getPosts("blog").map((post) => ({
      path: `/blog/${post.slug}`,
      date: post.date,
    })),
    ...getPosts("case-studies").map((post) => ({
      path: `/case-studies/${post.slug}`,
      date: post.date,
    })),
  ];

  const industryPages: MetadataRoute.Sitemap = [
    whoWeHelp.path,
    ...industries.map((industry) => industryPath(industry)),
  ].map((path) => ({
    url: new URL(path, site.url).toString(),
    lastModified: whoWeHelp.updated,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [
    ...pages,
    ...industryPages,
    ...posts.map((post) => ({
      url: new URL(post.path, site.url).toString(),
      lastModified: postLastModified(post.path, post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
