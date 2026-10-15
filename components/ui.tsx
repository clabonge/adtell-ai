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
  tone = "light",
}: {
  children: ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-[0.18em] ${
        tone === "dark" ? "text-copper-bright" : "text-copper-deep"
      }`}
    >
      {children}
    </p>
  );
}

const buttonVariants = {
  solid:
    "bg-copper-deep text-paper hover:bg-ink focus-visible:bg-ink",
  ghost:
    "border border-ink/20 bg-transparent text-ink hover:border-ink hover:bg-ink hover:text-paper",
  inverse: "bg-paper text-ink hover:bg-copper-bright",
  "inverse-ghost":
    "border border-paper/40 bg-transparent text-paper hover:bg-paper hover:text-ink",
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

export function Breadcrumbs({
  items,
  tone = "light",
}: {
  items: Crumb[];
  tone?: "light" | "dark";
}) {
  const trail = [{ name: "Home", path: "/" }, ...items];
  const muted = tone === "dark" ? "text-mist" : "text-muted";
  const current = tone === "dark" ? "text-paper" : "text-ink";

  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-sm ${muted}`}>
        {trail.map((item, index) => {
          const last = index === trail.length - 1;
          return (
            <li key={`${item.path}-${item.name}`} className="flex items-center gap-2">
              {index > 0 ? <span aria-hidden="true">/</span> : null}
              {last ? (
                <span aria-current="page" className={current}>
                  {item.name}
                </span>
              ) : (
                <Link
                  href={item.path}
                  className="underline decoration-current/40 underline-offset-4 hover:decoration-current"
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
}: {
  kicker: string;
  title: string;
  lede: string;
  crumbs?: Crumb[];
}) {
  return (
    <section className="border-b border-forest-line bg-forest-deep text-paper">
      <Container className="py-14 sm:py-20">
        {crumbs ? <Breadcrumbs items={crumbs} tone="dark" /> : null}
        <Kicker tone="dark">{kicker}</Kicker>
        <h1 className="mt-4 max-w-3xl font-serif text-4xl leading-[1.08] tracking-tight sm:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-mist">{lede}</p>
      </Container>
    </section>
  );
}
