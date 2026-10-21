import type { Metadata } from "next";
import { site } from "@/content/site";
import { shareImageSize } from "@/lib/share-image";

export function shareImagePath(title: string): string {
  return `/og?${new URLSearchParams({ title }).toString()}`;
}

type PageMeta = {
  title: string;
  description: string;
  path: string;
  absolute?: boolean;
  ogType?: "website" | "article";
  publishedTime?: string;
};

/** Browser and social title. Region stays on the homepage and Who we help pages. */
export function documentTitle(topic: string, path: string): string {
  if (path === "/" || path === "") return `${site.name} | ${site.serviceRegion}`;
  if (path === "/who-we-help" || path.startsWith("/who-we-help/")) {
    return `${topic} | ${site.serviceRegion} | ${site.name}`;
  }
  return `${topic} | ${site.name}`;
}

export function pageMetadata({
  title,
  description,
  path,
  ogType = "website",
  publishedTime,
}: PageMeta): Metadata {
  const url = new URL(path, site.url).toString();
  const titled = documentTitle(title, path);
  const described = description.includes("Bucks County")
    ? description
    : `${description} ${site.localPresence}`;
  const imageUrl = new URL(shareImagePath(titled), site.url).toString();
  const openGraphImage = {
    url: imageUrl,
    ...shareImageSize,
    alt: titled,
    type: "image/png",
  };
  const twitterImage = {
    url: imageUrl,
    ...shareImageSize,
    alt: titled,
    type: "image/png",
  };

  return {
    title: { absolute: titled },
    description: described,
    alternates: { canonical: url },
    openGraph: {
      title: titled,
      description: described,
      url,
      siteName: site.name,
      type: ogType,
      locale: "en_US",
      images: [openGraphImage],
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: titled,
      description: described,
      images: [twitterImage],
    },
  };
}
