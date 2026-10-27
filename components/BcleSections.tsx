import Link from "next/link";
import { BclePhoto } from "@/components/BclePhoto";
import { ButtonLink, Container, Kicker } from "@/components/ui";
import { bcleAbout, bcleCaseStudy, bcleCaseStudyShots, bcleDelivery, bcleShop } from "@/content/bcle";
import { bespokeQuoteDemo } from "@/content/bespokequote-demo";
import { furnitureShop } from "@/content/industry-examples";
import { auditPath } from "@/content/nav";

function FramedPhoto({
  name,
  alt,
  sizes,
}: {
  name: Parameters<typeof BclePhoto>[0]["name"];
  alt: string;
  sizes: string;
}) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden bg-raise">
      <BclePhoto
        name={name}
        alt={alt}
        sizes={sizes}
        className="absolute inset-0 h-full w-full object-cover"
      />
    </div>
  );
}

function Screen({
  name,
  alt,
  sizes,
}: {
  name: Parameters<typeof BclePhoto>[0]["name"];
  alt: string;
  sizes: string;
}) {
  const ui = name.startsWith("bespokequote") || name.startsWith("bcle-ai-cut-sheet");
  if (ui) {
    return (
      <BclePhoto
        name={name}
        alt={alt}
        sizes={sizes}
        className="h-auto w-full border border-line"
      />
    );
  }
  return <FramedPhoto name={name} alt={alt} sizes={sizes} />;
}

function CaseStudyLink({ recording = false }: { recording?: boolean }) {
  return (
    <div className="mt-6">
      <p className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
        <Link
          href={bcleCaseStudy.path}
          className="text-sm font-semibold text-oxblood underline decoration-oxblood/40 underline-offset-4"
        >
          Read the BCLE Furniture case study
        </Link>
        {recording ? (
          <Link
            href={bespokeQuoteDemo.path}
            className="text-sm font-semibold text-oxblood underline decoration-oxblood/40 underline-offset-4"
          >
            Watch the {bespokeQuoteDemo.duration}-second recording
          </Link>
        ) : null}
      </p>
      {recording ? (
        <p className="mt-2 text-sm leading-relaxed text-quiet">{bespokeQuoteDemo.sampleNote}</p>
      ) : null}
    </div>
  );
}

function DeliveredLead() {
  const phrase = "BespokeQuote.furniture";
  const text = furnitureShop.lead;
  const index = text.indexOf(phrase);
  if (index < 0) {
    return (
      <>
        {text}{" "}
        <a
          href={furnitureShop.href}
          className="font-semibold text-oxblood underline underline-offset-4"
        >
          {furnitureShop.host}
        </a>
      </>
    );
  }
  return (
    <>
      {text.slice(0, index)}
      <a
        href={furnitureShop.href}
        className="font-semibold text-oxblood underline underline-offset-4"
      >
        {phrase}
      </a>
      {text.slice(index + phrase.length)}
    </>
  );
}

export function BcleShopStrip() {
  return (
    <section className="border-b border-line">
      <Container className="py-16 sm:py-24">
        <Kicker>{bcleShop.kicker}</Kicker>
        <h2 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight sm:text-5xl">{bcleShop.heading}</h2>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-quiet">
          <DeliveredLead />
        </p>
        <ul className="mt-10 grid items-start gap-6 md:grid-cols-3">
          {bcleShop.photos.map((photo) => (
            <li key={photo.name}>
              <figure>
                <Screen name={photo.name} alt={photo.alt} sizes="(min-width: 768px) 30vw, 100vw" />
                <figcaption className="mt-3 text-sm leading-relaxed text-quiet">{photo.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <CaseStudyLink recording />
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
        <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bcleAbout.photos.map((photo) => (
            <li key={photo.name}>
              <figure>
                <FramedPhoto name={photo.name} alt={photo.alt} sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw" />
                <figcaption className="mt-3 text-sm leading-relaxed text-quiet">{photo.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <CaseStudyLink />
      </Container>
    </section>
  );
}

export function BcleDelivery() {
  return (
    <section className="border-b border-line">
      <Container className="py-12 sm:py-16">
        <Kicker>{bcleShop.kicker}</Kicker>
        <h2 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight sm:text-5xl">{furnitureShop.heading}</h2>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-quiet">
          <DeliveredLead />
        </p>
        <ul className="mt-10 grid items-start gap-6 md:grid-cols-2">
          {bcleDelivery.screenshots.map((shot) => (
            <li key={shot.name}>
              <figure>
                <Screen name={shot.name} alt={shot.alt} sizes="(min-width: 768px) 45vw, 100vw" />
                <figcaption className="mt-3 text-sm leading-relaxed text-quiet">{shot.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <h3 className="mt-12 font-serif text-2xl tracking-tight">{bcleDelivery.inventoryHeading}</h3>
        <p className="mt-3 max-w-2xl text-lg leading-relaxed text-quiet">{bcleDelivery.inventory}</p>
        <ul className="mt-8 grid items-start gap-6 md:grid-cols-2">
          {bcleDelivery.sheets.map((sheet) => (
            <li key={sheet.name}>
              <figure>
                <BclePhoto
                  name={sheet.name}
                  alt={sheet.alt}
                  sizes="(min-width: 768px) 40vw, 100vw"
                  className="h-auto w-full border border-line"
                />
                <figcaption className="mt-3 text-sm leading-relaxed text-quiet">{sheet.caption}</figcaption>
              </figure>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm leading-relaxed text-quiet">{bcleDelivery.blurNote}</p>
        <ul className="mt-8 list-disc space-y-2 pl-5 text-base leading-relaxed text-quiet">
          {furnitureShop.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        <p className="mt-6 text-lg leading-relaxed text-quiet">{furnitureShop.close}</p>
        <div className="mt-8">
          <ButtonLink href={auditPath}>Request my free audit</ButtonLink>
        </div>
        <CaseStudyLink />
      </Container>
    </section>
  );
}

export function BcleCaseStudyShots() {
  return (
    <div className="mt-12">
      <h2 className="font-serif text-3xl tracking-tight">The software</h2>
      <p className="mt-4 text-lg leading-relaxed text-quiet">
        These screenshots are BespokeQuote.furniture. Names and amounts on the screens are part of
        the software interface.
      </p>
      <ul className="mt-8 grid gap-8">
        {bcleCaseStudyShots.map((shot) => (
          <li key={shot.name}>
            <figure>
              <Screen name={shot.name} alt={shot.alt} sizes="(min-width: 768px) 42rem, 100vw" />
              <figcaption className="mt-3 text-sm leading-relaxed text-quiet">{shot.caption}</figcaption>
            </figure>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-lg leading-relaxed text-quiet">
        <a
          href={furnitureShop.href}
          className="font-semibold text-oxblood underline underline-offset-4"
        >
          {furnitureShop.host}
        </a>
      </p>
      <p className="mt-4 text-lg leading-relaxed text-quiet">
        <Link
          href={bespokeQuoteDemo.path}
          className="font-semibold text-oxblood underline underline-offset-4"
        >
          Watch the screen recording
        </Link>
      </p>
    </div>
  );
}
