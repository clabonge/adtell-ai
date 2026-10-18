import Link from "next/link";
import type { ReactNode } from "react";

const linkClass = "text-sm font-semibold text-oxblood-ink underline underline-offset-4";

export function CrmChrome({ csrf, children }: { csrf: string; children: ReactNode }) {
  return (
    <div className="bg-ivory text-ink">
      <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-x-5 gap-y-2 px-5 py-4 sm:px-8">
        <p className="font-serif text-2xl tracking-tight">Private CRM</p>
        <Link className={linkClass} href="/admin/crm">
          Pipeline
        </Link>
        <Link className={linkClass} href="/admin/crm/import">
          Import
        </Link>
        <Link className={linkClass} href="/admin/crm/notifications">
          Notifications
        </Link>
        <a className={linkClass} href={`/admin/api/export?csrf=${encodeURIComponent(csrf)}`}>
          Export CSV
        </a>
        <form action="/admin/api/logout" method="post" className="sm:ml-auto">
          <input type="hidden" name="csrf" value={csrf} />
          <button type="submit" className={linkClass}>
            Log out
          </button>
        </form>
      </div>
      <div className="mx-auto w-full max-w-6xl px-5 pb-16 sm:px-8">{children}</div>
    </div>
  );
}

export function CrmMessage({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-ivory text-ink">
      <div className="mx-auto w-full max-w-3xl px-5 py-16 sm:px-8">
        <h1 className="font-serif text-4xl tracking-tight">{title}</h1>
        <p className="mt-4 text-base leading-relaxed">{body}</p>
      </div>
    </div>
  );
}
