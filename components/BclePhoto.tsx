import { getImageProps } from "next/image";
import { preload } from "react-dom";
import type { CSSProperties } from "react";

const dimensions = {
  "bcle-ai-cut-sheet-nesting": { width: 1600, height: 1200 },
  "bcle-ai-cut-sheet-receiving-tag": { width: 1200, height: 1600 },
  "bcle-burkle-finishing-line": { width: 1600, height: 1200 },
  "bcle-burkle-operator": { width: 1600, height: 1200 },
  "bcle-burkle-operator-racks": { width: 1600, height: 1200 },
  "bcle-cnc-cut-cabinet": { width: 1200, height: 1600 },
  "bcle-cnc-vacuum-lift": { width: 1200, height: 1600 },
  "bcle-selexx-cnc": { width: 1600, height: 1200 },
  "bcle-shop-floor": { width: 1600, height: 1200 },
  "bcle-thermwood-cnc": { width: 1200, height: 1600 },
} as const;

export type BcleName = keyof typeof dimensions;

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
  const { width, height } = dimensions[name];
  const shared = { alt, width, height, sizes };
  const { props: webp } = getImageProps({
    ...shared,
    src: `/images/bcle/${name}.webp`,
  });
  const { props: jpg } = getImageProps({
    ...shared,
    src: `/images/bcle/${name}.jpg`,
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
