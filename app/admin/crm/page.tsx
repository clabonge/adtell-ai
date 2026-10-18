import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CrmChrome, CrmMessage } from "@/components/crm/CrmChrome";
import { STAGE_LABELS, STAGES } from "@/lib/crm/constants";
import { requireOwnerPage } from "@/lib/crm/page-guard";
import { listOpportunities, listOverdue, report } from "@/lib/crm/queries";
import { dollarsFromCents } from "@/lib/crm/text";

export const metadata = { title: "CRM", robots: { index: false, follow: false } };

type Search = { company?: string; origin?: string; stage?: string; follow_up?: string; error?: string };

export default function CrmPage(props: { searchParams: Promise<Search> }) {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-ivory">Loading the CRM…</p>}>
      <CrmHome searchParams={props.searchParams} />
    </Suspense>
  );
}

async function CrmHome({ searchParams }: { searchParams: Promise<Search> }) {
  const access = await requireOwnerPage();
  if (access.kind === "login") redirect("/admin/crm/login");
  if (access.kind === "unconfigured") {
    return (
      <CrmMessage
        title="CRM is not configured"
        body="There is no default password. Set the owner variables and database before signing in."
      />
    );
  }
  if (access.kind === "unavailable") {
    return <CrmMessage title="CRM database unavailable" body="Nothing on this page was changed." />;
  }
  const params = await searchParams;
  const filters = {
    company: params.company,
    origin: params.origin,
    stage: params.stage,
    followUp: params.follow_up,
  };
  const [rows, overdue, summary] = await Promise.all([
    listOpportunities(access.db, filters),
    listOverdue(access.db),
    report(access.db),
  ]);
  const reached = Object.fromEntries(summary.reached.map((row) => [row.stage, row.count]));
  const inputClass = "mt-2 min-h-11 w-full border border-line bg-ivory-deep px-3";
  return (
    <CrmChrome csrf={access.session.csrfToken}>
      <h1 className="font-serif text-4xl tracking-tight">Pipeline</h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-quiet-ink">
        Estimates are not revenue. Inbound requests are saved as contacted, and the audit is not booked until you change the stage. Public details and an inquiry are not marketing consent.
      </p>
      {params.error === "invalid" ? (
        <p className="mt-4 border border-oxblood-ink px-3 py-2 text-sm" role="alert">
          Check the new contact fields and try again.
        </p>
      ) : null}

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric label="Lead source: inbound" value={countOrigin(summary.byOrigin, "inbound")} />
        <Metric label="Lead source: owner" value={countOrigin(summary.byOrigin, "owner")} />
        <Metric label="Lead source: research" value={countOrigin(summary.byOrigin, "research")} />
        <Metric label="Reached audit booked" value={String(reached.audit_booked ?? 0)} />
        <Metric label="Reached proposal sent" value={String(reached.proposal_sent ?? 0)} />
        <Metric label="Wins" value={String(reached.won ?? 0)} />
        <Metric
          label="Estimated open pipeline, not revenue"
          value={dollarsFromCents(summary.openCents) || "0.00"}
        />
        <Metric
          label="Estimated won value, not revenue"
          value={dollarsFromCents(summary.wonCents) || "0.00"}
        />
      </section>
      <p className="mt-3 text-sm text-quiet-ink">
        {summary.missingEstimates} open or won opportunities have no estimate. Reached counts are opportunities that entered that stage, including ones that have since moved.
      </p>

      <h2 className="mt-10 font-serif text-2xl">Overdue follow-ups</h2>
      {overdue.length === 0 ? (
        <p className="mt-3 text-sm">No overdue follow-ups.</p>
      ) : (
        <ul className="mt-3 space-y-2 text-sm">
          {overdue.map((item) => (
            <li key={item.id}>
              <Link className="font-semibold underline" href={`/admin/crm/opportunities/${item.id}`}>
                {item.companyName}
              </Link>{" "}
              {item.nextActionOn}: {item.nextAction || "Follow up"}
            </li>
          ))}
        </ul>
      )}

      <form method="get" className="mt-10 grid gap-4 sm:grid-cols-4" aria-label="Filter opportunities">
        <label className="text-sm font-semibold">
          Company
          <input name="company" defaultValue={params.company ?? ""} className={inputClass} />
        </label>
        <label className="text-sm font-semibold">
          Origin
          <select name="origin" defaultValue={params.origin ?? ""} className={inputClass}>
            <option value="">Any</option>
            <option value="inbound">Inbound</option>
            <option value="owner">Owner</option>
            <option value="research">Research</option>
          </select>
        </label>
        <label className="text-sm font-semibold">
          Stage
          <select name="stage" defaultValue={params.stage ?? ""} className={inputClass}>
            <option value="">Any</option>
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Follow-up on or before
          <input type="date" name="follow_up" defaultValue={params.follow_up ?? ""} className={inputClass} />
        </label>
        <button type="submit" className="min-h-11 bg-void px-4 text-sm font-semibold text-ivory sm:col-span-4 sm:w-fit">
          Filter
        </button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[44rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-line">
              <th className="py-2 pr-3">Company</th>
              <th className="py-2 pr-3">Contact</th>
              <th className="py-2 pr-3">Origin</th>
              <th className="py-2 pr-3">Stage</th>
              <th className="py-2 pr-3">Follow-up</th>
              <th className="py-2">Estimate, not revenue</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line/40">
                <td className="py-2 pr-3">
                  <Link className="font-semibold underline" href={`/admin/crm/opportunities/${row.id}`}>
                    {row.companyName}
                  </Link>
                </td>
                <td className="py-2 pr-3">{row.contactName}</td>
                <td className="py-2 pr-3">{row.origin}</td>
                <td className="py-2 pr-3">{STAGE_LABELS[row.stage as keyof typeof STAGE_LABELS] ?? row.stage}</td>
                <td className="py-2 pr-3">{row.nextActionOn ?? ""}</td>
                <td className="py-2">{dollarsFromCents(row.estimatedValueCents)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length === 0 ? <p className="mt-3 text-sm">No opportunities match these filters.</p> : null}
      </div>

      <h2 className="mt-12 font-serif text-2xl">Add an owner contact</h2>
      <p className="mt-2 text-sm text-quiet-ink">
        This does not send email and does not grant marketing consent. Leave unknown fields blank.
      </p>
      <form action="/admin/api/contacts" method="post" className="mt-4 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="csrf" value={access.session.csrfToken} />
        <Field name="company" label="Company" required />
        <Field name="website" label="Website" />
        <Field name="industry" label="Industry" />
        <Field name="location" label="Location" />
        <Field name="contact_name" label="Contact name" required />
        <Field name="role" label="Title" />
        <Field name="email" label="Email" type="email" />
        <Field name="phone" label="Phone" />
        <label className="text-sm font-semibold">
          Stage
          <select name="stage" defaultValue="researched" className={inputClass}>
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
        </label>
        <Field name="next_action" label="Next action" />
        <Field name="next_action_on" label="Follow-up date" type="date" />
        <label className="text-sm font-semibold sm:col-span-2">
          Notes
          <textarea name="notes" rows={4} className="mt-2 w-full border border-line bg-ivory-deep px-3 py-2" />
        </label>
        <button type="submit" className="min-h-11 bg-void px-4 text-sm font-semibold text-ivory sm:w-fit">
          Save contact
        </button>
      </form>
    </CrmChrome>
  );
}

function countOrigin(rows: Array<{ origin: string; count: number }>, origin: string) {
  return String(rows.find((row) => row.origin === origin)?.count ?? 0);
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-line px-3 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-quiet-ink">{label}</p>
      <p className="mt-2 font-serif text-2xl">{value}</p>
    </div>
  );
}

function Field({
  name,
  label,
  type = "text",
  required = false,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <label className="text-sm font-semibold">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        className="mt-2 min-h-11 w-full border border-line bg-ivory-deep px-3"
      />
    </label>
  );
}
