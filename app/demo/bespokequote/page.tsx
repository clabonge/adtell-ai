import Link from "next/link";
import { AuditBand } from "@/components/AuditBand";
import { BookingPrompt } from "@/components/BookingPrompt";
import { ButtonLink, Container, JsonLd, PageHero } from "@/components/ui";
import { bespokeQuoteDemo } from "@/content/bespokequote-demo";
import { auditCta, auditPath } from "@/content/nav";
import { pageMetadata } from "@/lib/seo";
import { videoObjectJsonLd } from "@/lib/structured-data";

export const metadata = pageMetadata({
  title: bespokeQuoteDemo.title,
  description: bespokeQuoteDemo.description,
  path: bespokeQuoteDemo.path,
});

export default function BespokeQuoteDemoPage() {
  return (
    <>
      <PageHero
        kicker={bespokeQuoteDemo.kicker}
        title={bespokeQuoteDemo.heading}
        lede={bespokeQuoteDemo.lede}
        crumbs={[{ name: bespokeQuoteDemo.title, path: bespokeQuoteDemo.path }]}
        cta={{ href: auditPath, label: auditCta }}
      />
      <article>
        <Container className="max-w-3xl py-14 sm:py-20">
          <figure>
            <video
              className="h-auto w-full max-w-full border border-line"
              controls
              muted
              preload="metadata"
              playsInline
              poster={bespokeQuoteDemo.poster}
              src={bespokeQuoteDemo.video}
              width={bespokeQuoteDemo.width}
              height={bespokeQuoteDemo.height}
            >
              {bespokeQuoteDemo.videoName}
            </video>
            <figcaption className="mt-4">
              <p className="text-sm leading-relaxed text-quiet">{bespokeQuoteDemo.silentNote}</p>
              <h2 className="mt-6 font-serif text-3xl tracking-tight">{bespokeQuoteDemo.seeingHeading}</h2>
              <ol className="mt-4 list-decimal space-y-3 pl-5 text-base leading-relaxed text-quiet">
                {bespokeQuoteDemo.seeing.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ol>
            </figcaption>
          </figure>
          <p className="mt-8 border border-oxblood px-4 py-3 text-base font-semibold leading-relaxed text-ivory">
            {bespokeQuoteDemo.sampleNote}
          </p>
          <h2 className="mt-12 font-serif text-3xl tracking-tight">{bespokeQuoteDemo.shopHeading}</h2>
          <p className="mt-4 text-lg leading-relaxed text-quiet">{bespokeQuoteDemo.shopBody}</p>
          <div className="mt-8">
            <ButtonLink href={auditPath}>{auditCta}</ButtonLink>
          </div>
          <BookingPrompt tone="void" className="mt-4" />
          <h2 className="mt-12 font-serif text-3xl tracking-tight">Related</h2>
          <ul className="mt-4 list-disc space-y-3 pl-5 text-base leading-relaxed text-quiet">
            <li>
              <a
                href={bespokeQuoteDemo.liveHref}
                className="font-semibold text-oxblood underline underline-offset-4"
              >
                {bespokeQuoteDemo.liveLabel}
              </a>
            </li>
            <li>
              <Link
                href={bespokeQuoteDemo.caseStudyPath}
                className="font-semibold text-oxblood underline underline-offset-4"
              >
                {bespokeQuoteDemo.caseStudyLabel}
              </Link>
            </li>
            <li>
              <Link
                href={bespokeQuoteDemo.furniturePath}
                className="font-semibold text-oxblood underline underline-offset-4"
              >
                {bespokeQuoteDemo.furnitureLabel}
              </Link>
            </li>
          </ul>
        </Container>
      </article>
      <AuditBand />
      <JsonLd
        data={videoObjectJsonLd({
          name: bespokeQuoteDemo.videoName,
          description: bespokeQuoteDemo.videoDescription,
          thumbnailPath: bespokeQuoteDemo.poster,
          uploadDate: bespokeQuoteDemo.uploadDate,
          contentPath: bespokeQuoteDemo.video,
        })}
      />
    </>
  );
}
