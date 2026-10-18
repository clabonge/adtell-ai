import { Suspense } from "react";
import { redirect } from "next/navigation";
import { crmAuthConfig } from "@/lib/crm/auth";
import { requireOwnerPage } from "@/lib/crm/page-guard";

export const metadata = { title: "CRM sign in", robots: { index: false, follow: false } };

export default function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-ivory">Loading sign in…</p>}>
      <LoginForm searchParams={props.searchParams} />
    </Suspense>
  );
}

async function LoginForm({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const access = await requireOwnerPage();
  if (access.kind === "ok") redirect("/admin/crm");
  const params = await searchParams;
  const unconfigured = access.kind === "unconfigured" || !crmAuthConfig();
  return (
    <div className="bg-ivory text-ink">
      <div className="mx-auto w-full max-w-lg px-5 py-16 sm:px-8">
        <h1 className="font-serif text-4xl tracking-tight">Owner sign in</h1>
        <p className="mt-4 text-base leading-relaxed text-quiet-ink">
          This CRM is private. There is no public signup and no default password.
        </p>
        {unconfigured ? (
          <p className="mt-6 border border-oxblood-ink px-3 py-2 text-sm" role="alert">
            The private CRM is not configured.
          </p>
        ) : null}
        {access.kind === "unavailable" || params.error === "unavailable" ? (
          <p className="mt-6 border border-oxblood-ink px-3 py-2 text-sm" role="alert">
            The CRM database is unavailable.
          </p>
        ) : null}
        {params.error === "credentials" ? (
          <p className="mt-6 border border-oxblood-ink px-3 py-2 text-sm" role="alert">
            The email or password is wrong.
          </p>
        ) : null}
        {params.error === "limited" ? (
          <p className="mt-6 border border-oxblood-ink px-3 py-2 text-sm" role="alert">
            Too many sign-in attempts. Wait and try again.
          </p>
        ) : null}
        {unconfigured ? null : (
          <form action="/admin/api/login" method="post" className="mt-8 grid gap-4">
            <label className="text-sm font-semibold" htmlFor="crm-email">
              Email
              <input
                id="crm-email"
                name="email"
                type="email"
                autoComplete="username"
                required
                className="mt-2 min-h-11 w-full border border-line bg-ivory-deep px-3"
              />
            </label>
            <label className="text-sm font-semibold" htmlFor="crm-password">
              Password
              <input
                id="crm-password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-2 min-h-11 w-full border border-line bg-ivory-deep px-3"
              />
            </label>
            <button type="submit" className="min-h-11 bg-void px-5 text-sm font-semibold text-ivory">
              Sign in
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
