import Link from "next/link";
import type { Faq } from "@/content/faqs";

export function FaqList({ items }: { items: readonly Faq[] }) {
  return (
    <div className="border-t border-line">
      {items.map((item) => (
        <details key={item.question} className="border-b border-line">
          <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-4 py-4 text-left text-lg font-semibold text-ivory">
            {item.question}
            <span className="faq-plus shrink-0 font-serif text-2xl leading-none text-oxblood" aria-hidden="true">
              +
            </span>
            <span className="faq-minus shrink-0 font-serif text-2xl leading-none text-oxblood" aria-hidden="true">
              –
            </span>
          </summary>
          <p className="max-w-3xl pb-5 text-base leading-relaxed text-quiet">
            {item.answer}
            {item.link ? (
              <>
                {" "}
                <Link
                  href={item.link.href}
                  className="font-semibold text-oxblood underline underline-offset-4"
                >
                  {item.link.label}
                </Link>
              </>
            ) : null}
          </p>
        </details>
      ))}
    </div>
  );
}
