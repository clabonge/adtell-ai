import { ButtonLink, Container } from "@/components/ui";

export default function NotFound() {
  return (
    <Container className="py-24">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-copper-deep">
        404
      </p>
      <h1 className="mt-4 font-serif text-5xl tracking-tight text-ink">That page is not here.</h1>
      <p className="mt-4 max-w-xl text-lg leading-relaxed text-ink-soft">
        The address may be out of date. The services, the audit, and the notes are still on the site.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <ButtonLink href="/">Back to the homepage</ButtonLink>
        <ButtonLink href="/contact" variant="ghost">
          Book an audit
        </ButtonLink>
      </div>
    </Container>
  );
}
