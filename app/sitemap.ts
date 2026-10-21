import type { MetadataRoute } from "next";
import { industries, industryPath, whoWeHelp } from "@/content/industries";
import { sampleAudit } from "@/content/sample-audit";
import { site } from "@/content/site";
import { getPosts } from "@/lib/posts";

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
    sampleAudit.path,
  ];

  const pages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: new URL(path || "/", site.url).toString(),
    lastModified: path === sampleAudit.path ? sampleAudit.updated : site.updated,
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
      lastModified: post.date,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
