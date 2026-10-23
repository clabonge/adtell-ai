import { BclePhoto } from "@/components/BclePhoto";
import { Container, Kicker } from "@/components/ui";
import { bcleAbout, bcleInventory, bcleShop } from "@/content/bcle";

function FramedPhoto({
  name,
  alt,
  sizes,
  className = "absolute inset-0 h-full w-full object-cover",
  style,
}: {
  name: Parameters<typeof BclePhoto>[0]["name"];
  alt: string;
  sizes: string;
  className?: string;
  style?: { objectPosition: string };
}) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-raise">
      <BclePhoto name={name} alt={alt} sizes={sizes} className={className} style={style} />
    </div>
  );
}

export function BcleShopStrip() {
  return (
    <section className="border-b border-line">
      <Container className="py-16 sm:py-24">
        <Kicker>{bcleShop.kicker}</Kicker>
        <h2 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight sm:text-5xl">{bcleShop.heading}</h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-quiet">{bcleShop.lede}</p>
        <ul className="mt-10 grid gap-6 md:grid-cols-3">
          {bcleShop.photos.map((photo) => (
            <li key={photo.name}>
              <figure>
                <FramedPhoto name={photo.name} alt={photo.alt} sizes="(min-width: 768px) 30vw, 100vw" />
                <figcaption className="mt-3 text-sm leading-relaxed text-quiet">{photo.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function BcleAboutPractice() {
  return (
    <section className="border-t border-line">
      <Container className="py-14 sm:py-20">
        <Kicker>{bcleAbout.kicker}</Kicker>
        <h2 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight">{bcleAbout.heading}</h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-quiet">{bcleAbout.lede}</p>
        <ul className="mt-10 grid gap-6 sm:grid-cols-2">
          {bcleAbout.photos.map((photo) => (
            <li key={photo.name}>
              <figure>
                <FramedPhoto name={photo.name} alt={photo.alt} sizes="(min-width: 640px) 45vw, 100vw" />
                <figcaption className="mt-3 text-sm leading-relaxed text-quiet">{photo.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}

export function BcleInventoryStory() {
  return (
    <section className="border-b border-line">
      <Container className="py-12 sm:py-16">
        <figure className="relative overflow-hidden">
          <div className="relative aspect-[16/10] sm:aspect-[21/9]">
            <BclePhoto
              name={bcleInventory.banner.name}
              alt={bcleInventory.banner.alt}
              sizes="100vw"
              className="absolute inset-0 h-full w-full object-cover"
              style={{ objectPosition: "50% 12%" }}
            />
          </div>
          <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-void via-void/85 to-transparent px-5 pt-24 pb-6 sm:px-8 sm:pb-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ivory">{bcleInventory.label}</p>
            <h2 className="mt-2 max-w-xl font-serif text-3xl tracking-tight text-ivory sm:text-5xl">
              {bcleInventory.heading}
            </h2>
          </figcaption>
        </figure>
        <p className="mt-8 max-w-3xl text-lg leading-relaxed text-quiet">{bcleInventory.lede}</p>
        <ul className="mt-8 grid gap-6 md:grid-cols-2">
          {bcleInventory.sheets.map((sheet) => (
            <li key={sheet.name}>
              <figure>
                <FramedPhoto name={sheet.name} alt={sheet.alt} sizes="(min-width: 768px) 45vw, 100vw" />
                <figcaption className="mt-3 text-sm leading-relaxed text-quiet">{sheet.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-quiet">{bcleInventory.blurNote}</p>
        <div className="mt-12 grid items-center gap-8 md:grid-cols-[minmax(0,0.72fr)_minmax(0,1fr)]">
          <figure>
            <BclePhoto
              name={bcleInventory.piecePhoto.name}
              alt={bcleInventory.piecePhoto.alt}
              sizes="(min-width: 768px) 36vw, 100vw"
              className="h-auto w-full"
            />
            <figcaption className="sr-only">{bcleInventory.piecePhoto.caption}</figcaption>
          </figure>
          <div>
            <Kicker>{bcleInventory.pieceKicker}</Kicker>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-quiet">{bcleInventory.piece}</p>
          </div>
        </div>
      </Container>
    </section>
  );
}
