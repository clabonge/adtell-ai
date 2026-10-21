import { handoff, type WorkflowStep } from "@/content/workflows";

export function WorkflowDiagram({
  heading,
  steps,
}: {
  heading: string;
  steps: readonly WorkflowStep[];
}) {
  return (
    <section className="mt-12" aria-labelledby="workflow-heading">
      <h2 id="workflow-heading" className="font-serif text-3xl tracking-tight">
        {heading}
      </h2>
      <ol className="mt-6 grid gap-4 sm:grid-cols-4">
        {steps.map((step) => (
          <li key={step.label} className="border border-line p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-oxblood">{step.label}</p>
            <p className="mt-2 text-sm leading-relaxed text-quiet">{step.text}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function HandoffList() {
  return (
    <section className="mt-12" aria-labelledby="handoff-heading">
      <h2 id="handoff-heading" className="font-serif text-3xl tracking-tight">
        {handoff.title}
      </h2>
      <ul className="mt-4 list-disc space-y-2 pl-5 text-base leading-relaxed text-quiet">
        {handoff.items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
