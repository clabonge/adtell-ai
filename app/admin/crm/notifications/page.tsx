import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { CrmChrome, CrmMessage } from "@/components/crm/CrmChrome";
import { requireOwnerPage } from "@/lib/crm/page-guard";
import { listFailedJobs } from "@/lib/crm/queries";

export const metadata = { title: "CRM notifications", robots: { index: false, follow: false } };

export default function NotificationsPage(props: { searchParams: Promise<{ error?: string; retried?: string }> }) {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-ivory">Loading notifications…</p>}>
      <Notifications searchParams={props.searchParams} />
    </Suspense>
  );
}

async function Notifications({ searchParams }: { searchParams: Promise<{ error?: string; retried?: string }> }) {
  const access = await requireOwnerPage();
  if (access.kind === "login") redirect("/admin/crm/login");
  if (access.kind !== "ok") {
    return <CrmMessage title="CRM unavailable" body="Sign-in or the database is not available." />;
  }
  const params = await searchParams;
  const jobs = await listFailedJobs(access.db);
  return (
    <CrmChrome csrf={access.session.csrfToken}>
      <h1 className="font-serif text-4xl tracking-tight">Failed notifications</h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-quiet-ink">
        Email and webhook are separate jobs. One can fail while the other succeeds. Retry queues the job again. Delivery is at-least-once, so a provider can receive a duplicate.
      </p>
      {params.retried ? <p className="mt-4 text-sm">The job was queued again.</p> : null}
      {params.error ? (
        <p className="mt-4 border border-oxblood-ink px-3 py-2 text-sm" role="alert">
          That failed job is no longer available.
        </p>
      ) : null}
      {jobs.length === 0 ? <p className="mt-6 text-sm">No failed notifications.</p> : null}
      <ul className="mt-6 space-y-4">
        {jobs.map((job) => (
          <li key={job.id} className="border border-line px-3 py-3 text-sm">
            <p>
              <Link className="font-semibold underline" href={`/admin/crm/opportunities/${job.opportunity_id}`}>
                {job.company_name}
              </Link>{" "}
              · {job.channel} · attempts {job.attempts}
            </p>
            {job.last_error ? <p className="mt-2">{job.last_error}</p> : null}
            <form action={`/admin/api/notifications/${job.id}/retry`} method="post" className="mt-3">
              <input type="hidden" name="csrf" value={access.session.csrfToken} />
              <button type="submit" className="min-h-11 bg-void px-4 text-sm font-semibold text-ivory">
                Retry
              </button>
            </form>
          </li>
        ))}
      </ul>
    </CrmChrome>
  );
}
