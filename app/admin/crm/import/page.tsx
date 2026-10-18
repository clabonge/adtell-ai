import { Suspense } from "react";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { CrmChrome, CrmMessage } from "@/components/crm/CrmChrome";
import { requireOwnerPage } from "@/lib/crm/page-guard";
import { importBatches, importRows } from "@/lib/crm/schema";
import { isUuid } from "@/lib/crm/text";

export const metadata = { title: "CRM import", robots: { index: false, follow: false } };

export default function ImportPage(props: {
  searchParams: Promise<{ batch?: string; error?: string; saved?: string }>;
}) {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-ivory">Loading import…</p>}>
      <ImportBody searchParams={props.searchParams} />
    </Suspense>
  );
}

async function ImportBody({
  searchParams,
}: {
  searchParams: Promise<{ batch?: string; error?: string; saved?: string }>;
}) {
  const access = await requireOwnerPage();
  if (access.kind === "login") redirect("/admin/crm/login");
  if (access.kind !== "ok") {
    return <CrmMessage title="CRM unavailable" body="Sign-in or the database is not available." />;
  }
  const params = await searchParams;
  const batch =
    params.batch && isUuid(params.batch)
      ? (
          await access.db.db.select().from(importBatches).where(eq(importBatches.id, params.batch)).limit(1)
        )[0]
      : null;
  const rows = batch
    ? await access.db.db.select().from(importRows).where(eq(importRows.batchId, batch.id))
    : [];
  rows.sort((a, b) => a.rowNumber - b.rowNumber);
  return (
    <CrmChrome csrf={access.session.csrfToken}>
      <h1 className="font-serif text-4xl tracking-tight">Import</h1>
      <p className="mt-3 max-w-3xl text-sm leading-relaxed text-quiet-ink">
        Research imports do not send email, do not create inquiry notifications, and do not grant marketing consent.
        Nothing is saved until you confirm. Verified details are not overwritten, and ambiguous contacts are not merged.
      </p>
      <p className="mt-4">
        <a className="text-sm font-semibold underline" href="/admin/api/import/template">
          Download the CSV template
        </a>
      </p>
      {params.error ? (
        <p className="mt-4 border border-oxblood-ink px-3 py-2 text-sm" role="alert">
          The file was not imported. Use the template and fix the rows.
        </p>
      ) : null}
      {params.saved && batch ? (
        <p className="mt-4 text-sm">
          Saved {batch.createdCount}. Skipped {batch.skippedCount}. Errors {batch.errorCount}. A repeated confirmation does not create duplicates.
        </p>
      ) : null}
      <form action="/admin/api/import/preview" method="post" encType="multipart/form-data" className="mt-6 grid gap-3">
        <input type="hidden" name="csrf" value={access.session.csrfToken} />
        <label className="text-sm font-semibold" htmlFor="import-file">
          CSV file
          <input id="import-file" name="file" type="file" accept=".csv,text/csv" required className="mt-2 block" />
        </label>
        <button type="submit" className="min-h-11 w-fit bg-void px-4 text-sm font-semibold text-ivory">
          Preview
        </button>
      </form>

      {batch ? (
        <>
          <h2 className="mt-10 font-serif text-2xl">Preview</h2>
          <p className="mt-2 text-sm">Status: {batch.status}. Rows: {batch.rowCount}.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="py-2 pr-3">Row</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Message</th>
                  <th className="py-2">Suggestion</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={row.id} className="border-b border-line/40">
                    <td className="py-2 pr-3">{row.rowNumber}</td>
                    <td className="py-2 pr-3">{row.status}</td>
                    <td className="py-2 pr-3">{row.message}</td>
                    <td className="py-2">{row.suggestion}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {batch.status === "previewed" ? (
            <form action="/admin/api/import/confirm" method="post" className="mt-6">
              <input type="hidden" name="csrf" value={access.session.csrfToken} />
              <input type="hidden" name="batch" value={batch.id} />
              <button type="submit" className="min-h-11 bg-void px-4 text-sm font-semibold text-ivory">
                Confirm and save ready rows
              </button>
            </form>
          ) : null}
        </>
      ) : null}
    </CrmChrome>
  );
}
