import { quotedInWriting, services, type Service } from "@/content/services";

/**
 * Copy for the furniture page and the BespokeQuote demo.
 * Prices come from content/services.ts. The turnaround is the published
 * BCLE Furniture case-study wording. Do not paraphrase it.
 */

function requireService(slug: string): Service {
  const service = services.find((item) => item.slug === slug);
  if (!service) throw new Error(`Missing service: ${slug}`);
  return service;
}

const starter = requireService("starter-workflow");
const implementation = requireService("implementation");

export const bcleTurnaround =
  "Measured result. Before, a quote could take up to three days for review and quoting. Now the maximum turnaround is 24 hours.";

export const furnitureOffer = {
  anywhere: "We build systems like this for shops anywhere, working by video.",
  pricesHeading: "Starting prices",
  offers: [
    { slug: starter.slug, name: starter.name, priceLabel: starter.priceLabel },
    {
      slug: implementation.slug,
      name: implementation.name,
      priceLabel: implementation.priceLabel,
    },
  ],
  note: quotedInWriting,
};
