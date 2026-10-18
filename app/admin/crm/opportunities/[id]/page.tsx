import { Suspense } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CrmChrome, CrmMessage } from "@/components/crm/CrmChrome";
import { PRIORITIES, STAGE_LABELS, STAGES } from "@/lib/crm/constants";
import { requireOwnerPage } from "@/lib/crm/page-guard";
import { getOpportunity } from "@/lib/crm/queries";
import { dollarsFromCents } from "@/lib/crm/text";

export const metadata = { title: "CRM opportunity", robots: { index: false, follow: false } };

export default function OpportunityPage(props: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-ivory">Loading the opportunity…</p>}>
      <Opportunity params={props.params} searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Opportunity({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const access = await requireOwnerPage();
  if (access.kind === "login") redirect("/admin/crm/login");
  if (access.kind !== "ok") {
    return <CrmMessage title="CRM unavailable" body="Sign-in or the database is not available." />;
  }
  const { id } = await params;
  const query = await searchParams;
  const record = await getOpportunity(access.db, id);
  if (!record) notFound();
  const { opportunity, company, contact } = record;
  const inputClass = "mt-2 min-h-11 w-full border border-line bg-ivory-deep px-3";
  return (
    <CrmChrome csrf={access.session.csrfToken}>
      <p className="text-sm">
        <Link className="font-semibold underline" href="/admin/crm">
          Pipeline
        </Link>
      </p>
      <h1 className="mt-3 font-serif text-4xl tracking-tight">{company.name}</h1>
      {query.saved ? <p className="mt-4 text-sm">Saved.</p> : null}
      {query.error ? (
        <p className="mt-4 border border-oxblood-ink px-3 py-2 text-sm" role="alert">
          The change was not saved. Check the fields.
        </p>
      ) : null}

      <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
        <Item label="Website" value={company.website} />
        <Item label="Domain" value={company.domain} />
        <Item label="Industry" value={company.industry} />
        <Item label="Location" value={company.location} />
        <Item label="Contact" value={contact?.name} />
        <Item label="Title" value={contact?.role} />
        <Item label="Email" value={contact?.email} />
        <Item label="Phone" value={contact?.phone} />
        <Item label="Origin" value={opportunity.origin} />
        <Item label="Verification" value={contact?.verificationStatus} />
        <Item label="Marketing consent" value={contact?.marketingConsent ? "Recorded" : "Not granted"} />
        <Item label="Consent evidence" value={contact?.consentEvidence} />
        <Item label="Source URL" value={opportunity.sourceUrl} />
        <Item label="Source reference" value={opportunity.sourceReference} />
        <Item label="Research date" value={opportunity.researchedOn} />
      </dl>

      <form action={`/admin/api/opportunities/${opportunity.id}`} method="post" className="mt-8 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="csrf" value={access.session.csrfToken} />
        <input type="hidden" name="intent" value="save" />
        <label className="text-sm font-semibold">
          Stage
          <select name="stage" defaultValue={opportunity.stage} className={inputClass}>
            {STAGES.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Priority
          <select name="priority" defaultValue={opportunity.priority} className={inputClass}>
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Estimated value in USD, not revenue
          <input
            name="estimated"
            defaultValue={dollarsFromCents(opportunity.estimatedValueCents)}
            inputMode="decimal"
            className={inputClass}
          />
        </label>
        <label className="text-sm font-semibold">
          Follow-up date
          <input type="date" name="next_action_on" defaultValue={opportunity.nextActionOn ?? ""} className={inputClass} />
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Next action
          <input name="next_action" defaultValue={opportunity.nextAction ?? ""} className={inputClass} />
        </label>
        <label className="text-sm font-semibold sm:col-span-2">
          Owner notes
          <textarea
            name="owner_notes"
            rows={5}
            defaultValue={opportunity.ownerNotes ?? ""}
            className="mt-2 w-full border border-line bg-ivory-deep px-3 py-2"
          />
        </label>
        <button type="submit" className="min-h-11 bg-void px-4 text-sm font-semibold text-ivory sm:w-fit">
          Save changes
        </button>
      </form>

      {contact ? (
        <form action={`/admin/api/opportunities/${opportunity.id}`} method="post" className="mt-8 grid gap-3">
          <input type="hidden" name="csrf" value={access.session.csrfToken} />
          <input type="hidden" name="intent" value="consent" />
          <input type="hidden" name="contact_id" value={contact.id} />
          <h2 className="font-serif text-2xl">Marketing consent</h2>
          <p className="text-sm text-quiet-ink">
            Leave this off unless you have separate permission. An inquiry or a public address is not consent.
          </p>
          <label className="text-sm font-semibold">
            <input type="checkbox" name="marketing_consent" value="yes" defaultChecked={contact.marketingConsent} />{" "}
            Marketing consent is recorded
          </label>
          <label className="text-sm font-semibold">
            Evidence
            <textarea
              name="consent_evidence"
              rows={3}
              defaultValue={contact.consentEvidence ?? ""}
              className="mt-2 w-full border border-line bg-ivory-deep px-3 py-2"
            />
          </label>
          <button type="submit" className="min-h-11 w-fit bg-void px-4 text-sm font-semibold text-ivory">
            Save consent
          </button>
        </form>
      ) : null}

      <form action={`/admin/api/opportunities/${opportunity.id}`} method="post" className="mt-8 grid gap-3">
        <input type="hidden" name="csrf" value={access.session.csrfToken} />
        <input type="hidden" name="intent" value="note" />
        <h2 className="font-serif text-2xl">Add a note</h2>
        <textarea name="note" rows={4} required className="w-full border border-line bg-ivory-deep px-3 py-2" />
        <button type="submit" className="min-h-11 w-fit bg-void px-4 text-sm font-semibold text-ivory">
          Add note
        </button>
      </form>

      <h2 className="mt-10 font-serif text-2xl">Inquiries</h2>
      <ul className="mt-3 space-y-4 text-sm">
        {record.inquiries.map((inquiry) => (
          <li key={inquiry.id} className="border border-line px-3 py-3">
            <p>
              {inquiry.submittedAt.toISOString()} · {inquiry.name} · {inquiry.email}
            </p>
            <p className="mt-2 whitespace-pre-wrap">{inquiry.drains}</p>
            <p className="mt-2 text-quiet-ink">
              {[inquiry.pageUrl, inquiry.referrer, inquiry.utmSource, inquiry.utmCampaign].filter(Boolean).join(" · ")}
            </p>
          </li>
        ))}
        {record.inquiries.length === 0 ? <li>No inbound inquiry is attached.</li> : null}
      </ul>

      <h2 className="mt-10 font-serif text-2xl">Activity</h2>
      <ul className="mt-3 space-y-3 text-sm">
        {record.activities.map((activity) => (
          <li key={activity.id}>
            <p className="text-quiet-ink">
              {activity.createdAt.toISOString()} · {activity.kind}
            </p>
            <p className="whitespace-pre-wrap">{activity.body}</p>
          </li>
        ))}
      </ul>

      <h2 className="mt-10 font-serif text-2xl">Notifications</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {record.jobs.map((job) => (
          <li key={String(job.id)}>
            {String(job.channel)} · {String(job.status)} · attempts {String(job.attempts)}
            {job.last_error ? ` · ${String(job.last_error)}` : ""}
          </li>
        ))}
        {record.jobs.length === 0 ? <li>No notification jobs for this opportunity.</li> : null}
      </ul>
    </CrmChrome>
  );
}

function Item({ label, value }: { label: string; value: string | null | undefined }) {
  return (
    <div>
      <dt className="font-semibold">{label}</dt>
      <dd>{value || "Blank"}</dd>
    </div>
  );
}
