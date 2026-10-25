import Link from "next/link";
import { Container, Kicker } from "@/components/ui";
import { auditCta, auditPath } from "@/content/nav";
import { sampleBaseline } from "@/content/sample-baseline";
import { savingsShare } from "@/content/services";

export function SavingsShare({ bordered = true }: { bordered?: boolean }) {
  return (
    <section
      id="savings-share"
      className={bordered ? "scroll-mt-28 border-t border-line" : "scroll-mt-28"}
    >
      <Container className="py-16 sm:py-24">
        <Kicker>{savingsShare.kicker}</Kicker>
        <h2 className="mt-4 max-w-3xl font-serif text-4xl tracking-tight sm:text-5xl">
          {savingsShare.title}
        </h2>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-quiet">{savingsShare.lede}</p>
        <ul className="mt-10 grid gap-8 md:grid-cols-3">
          {savingsShare.points.map((point) => (
            <li key={point.title} className="border-t-2 border-oxblood pt-5">
              <h3 className="font-serif text-2xl tracking-tight">{point.title}</h3>
              <p className="mt-3 text-base leading-relaxed text-quiet">{point.body}</p>
            </li>
          ))}
        </ul>
        <aside className="mt-10 max-w-2xl border border-line p-5">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-oxblood">
            {savingsShare.illustration.label}
          </p>
          <p className="mt-3 text-base leading-relaxed text-quiet">{savingsShare.illustration.body}</p>
        </aside>
        <p className="mt-6 max-w-2xl text-base leading-relaxed text-quiet">
          <Link
            href={sampleBaseline.path}
            className="font-semibold text-oxblood underline underline-offset-4"
          >
            {sampleBaseline.linkLabel}
          </Link>
          . {sampleBaseline.label}. {sampleBaseline.business} is a made-up business.
        </p>
        <p className="mt-10">
          <Link
            href={auditPath}
            className="text-sm font-semibold text-oxblood underline decoration-oxblood/40 underline-offset-4"
          >
            {auditCta}
          </Link>
        </p>
      </Container>
    </section>
  );
}
