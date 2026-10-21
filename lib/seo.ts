import type { Metadata } from "next";
import { site } from "@/content/site";

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
      ...(publishedTime ? { publishedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: titled,
      description: described,
    },
  };
}
