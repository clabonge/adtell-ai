import type { Metadata } from "next";
import { site } from "@/content/site";
import { shareImageAlt, shareImageSize } from "@/lib/share-image";

type PageMeta = {
  title: string;
  description: string;
  path: string;
  absolute?: boolean;
  ogType?: "website" | "article";
  publishedTime?: string;
};

export function pageMetadata({
  title,
  description,
  path,
  absolute = false,
  ogType = "website",
  publishedTime,
}: PageMeta): Metadata {
  const url = new URL(path, site.url).toString();
  const titled = title.includes(site.serviceRegion) ? title : `${title} | ${site.serviceRegion}`;
  const described = description.includes("Bucks County")
    ? description
    : `${description} ${site.localPresence}`;
  const openGraphImage = {
    url: new URL("/opengraph-image", site.url).toString(),
    ...shareImageSize,
    alt: shareImageAlt,
    type: "image/png",
  };
  const twitterImage = {
    url: new URL("/twitter-image", site.url).toString(),
    ...shareImageSize,
    alt: shareImageAlt,
    type: "image/png",
  };

  return {
    title: absolute ? { absolute: titled } : titled,
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
