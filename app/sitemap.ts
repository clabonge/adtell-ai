import type { MetadataRoute } from "next";
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
  ];

  const pages: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: new URL(path || "/", site.url).toString(),
    lastModified: site.updated,
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

  return [
    ...pages,
    ...posts.map((post) => ({
      url: new URL(post.path, site.url).toString(),
      lastModified: post.date,
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
  ];
}
