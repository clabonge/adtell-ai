import Link from "next/link";
import type { ReactNode } from "react";

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

type Crumb = { name: string; path: string };

export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`mx-auto w-full max-w-6xl px-5 sm:px-8 ${className}`}>
      {children}
    </div>
  );
}

export function Kicker({
  children,
  tone = "void",
}: {
  children: ReactNode;
  tone?: "void" | "sheet";
}) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-[0.18em] ${
        tone === "sheet" ? "text-oxblood-ink" : "text-oxblood"
      }`}
    >
      {children}
    </p>
  );
}

const buttonVariants = {
  solid: "bg-ivory text-void hover:bg-ivory-deep",
  ghost:
    "border border-ivory/35 bg-transparent text-ivory hover:border-ivory hover:bg-ivory hover:text-void",
  sheet: "bg-void text-ivory hover:bg-raise",
} as const;

export function ButtonLink({
  href,
  children,
  variant = "solid",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: keyof typeof buttonVariants;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex min-h-11 items-center justify-center px-5 text-sm font-semibold tracking-wide transition-colors ${buttonVariants[variant]} ${className}`}
    >
      {children}
    </Link>
  );
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const trail = [{ name: "Home", path: "/" }, ...items];

  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-quiet">
        {trail.map((item, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={`${item.path}-${item.name}`} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {last ? (
                <span aria-current="page" className="text-ivory">
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="underline decoration-ivory/30 underline-offset-4 hover:decoration-ivory"
                >
                  {item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function PageHero({
  kicker,
  title,
  lede,
  crumbs,
  cta,
  after,
}: {
  kicker: string;
  title: string;
  lede: string;
  crumbs?: Crumb[];
  cta?: { href: string; label: string };
  after?: ReactNode;
}) {
  return (
    <section className="border-b border-line">
      <Container className="py-14 sm:py-20">
        {crumbs ? <Breadcrumbs items={crumbs} /> : null}
        <Kicker>{kicker}</Kicker>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.05] tracking-tight sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-quiet">{lede}</p>
        {after}
        {cta ? (
          <div className="mt-8">
            <ButtonLink href={cta.href}>{cta.label}</ButtonLink>
          </div>
        ) : null}
      </Container>
    </section>
  );
}
