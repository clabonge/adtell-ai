import { caseStudyQuotes } from "@/content/case-study-quotes";

export function ClientQuote({ slug }: { slug: string }) {
  const quote = caseStudyQuotes[slug];
  if (!quote) return null;

  return (
    <figure className="mt-10 border-l-2 border-oxblood pl-5">
      <blockquote className="font-serif text-2xl leading-snug tracking-tight text-ivory">
        {quote.text}
      </blockquote>
      <figcaption className="mt-4 text-sm text-quiet">{quote.attribution}</figcaption>
    </figure>
  );
}
