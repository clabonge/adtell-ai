import { getImageProps } from "next/image";

export function HomepageShot({
  dir,
  name,
  alt,
  caption,
  href,
  width,
  height,
}: {
  dir: string;
  name: string;
  alt: string;
  caption: string;
  href: string;
  width: number;
  height: number;
}) {
  const shared = { alt, width, height, sizes: "(min-width: 768px) 42rem, 100vw" };
  const { props: webp } = getImageProps({
    ...shared,
    src: `/images/${dir}/${name}.webp`,
  });
  const { props: jpg } = getImageProps({
    ...shared,
    src: `/images/${dir}/${name}.jpg`,
    loading: "lazy",
    className: "h-auto w-full border border-line",
  });

  return (
    <figure className="mt-12">
      <picture>
        <source type="image/webp" srcSet={webp.srcSet} sizes={webp.sizes} />
        <img {...jpg} alt={alt} />
      </picture>
      <figcaption className="mt-3 text-sm leading-relaxed text-quiet">
        {caption}{" "}
        <a href={href} className="font-semibold text-oxblood underline underline-offset-4">
          {href.replace(/^https:\/\//, "")}
        </a>
      </figcaption>
    </figure>
  );
}
