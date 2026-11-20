import Link from "next/link";
import { furnitureOffer } from "@/content/furniture-offer";

export function FurnitureOffer() {
  return (
    <div className="mt-8">
      <p className="text-lg leading-relaxed text-quiet">{furnitureOffer.anywhere}</p>
      <h3 className="mt-10 font-serif text-2xl tracking-tight">{furnitureOffer.pricesHeading}</h3>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {furnitureOffer.offers.map((offer) => (
          <li key={offer.slug} className="border border-line p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-oxblood">
              Starting point
            </p>
            <p className="mt-2 font-serif text-3xl tracking-tight">{offer.priceLabel}</p>
            <p className="mt-2 text-sm leading-relaxed">
              <Link
                href={`/services#${offer.slug}`}
                className="font-semibold text-oxblood underline decoration-oxblood/40 underline-offset-4"
              >
                {offer.name}
              </Link>
            </p>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-base leading-relaxed text-quiet">{furnitureOffer.note}</p>
    </div>
  );
}
