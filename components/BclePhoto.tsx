import { getImageProps } from "next/image";
import { preload } from "react-dom";
import type { CSSProperties } from "react";

const shots = {
  "bcle-ai-cut-sheet-nesting": { dir: "bcle", width: 1600, height: 1200 },
  "bcle-ai-cut-sheet-receiving-tag": { dir: "bcle", width: 1200, height: 1600 },
  "bcle-burkle-operator": { dir: "bcle", width: 1600, height: 1200 },
  "bcle-shop-floor": { dir: "bcle", width: 1600, height: 1200 },
  "bcle-thermwood-cnc": { dir: "bcle", width: 1200, height: 1600 },
  "bespokequote-dashboard": { dir: "bespokequote", width: 1400, height: 766 },
  "bespokequote-how-it-works": { dir: "bespokequote", width: 1600, height: 1000 },
} as const;

export type BcleName = keyof typeof shots;

export function BclePhoto({
  name,
  alt,
  sizes,
  priority = false,
  className,
  style,
}: {
  name: BcleName;
  alt: string;
  sizes: string;
  /** Above-the-fold only. Everything else stays lazy. */
  priority?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  const shot = shots[name];
  const shared = { alt, width: shot.width, height: shot.height, sizes };
  const { props: webp } = getImageProps({
    ...shared,
    src: `/images/${shot.dir}/${name}.webp`,
  });
  const { props: jpg } = getImageProps({
    ...shared,
    src: `/images/${shot.dir}/${name}.jpg`,
    priority,
    loading: priority ? "eager" : "lazy",
    fetchPriority: priority ? "high" : "auto",
    className,
    style,
  });

  if (priority && webp.srcSet) {
    preload(webp.src, {
      as: "image",
      imageSrcSet: webp.srcSet,
      imageSizes: webp.sizes,
      fetchPriority: "high",
    });
  }

  return (
    <picture>
      <source type="image/webp" srcSet={webp.srcSet} sizes={webp.sizes} />
      <img {...jpg} alt={alt} />
    </picture>
  );
}
