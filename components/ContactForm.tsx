"use client";

import Link from "next/link";
import { useId, useRef, useState, type FormEvent } from "react";
import { BookingPrompt } from "@/components/BookingPrompt";
import { companySizes } from "@/content/audit";
import { site } from "@/content/site";
import { bookingUrl } from "@/lib/booking";
import { validateAudit, type AuditErrors, type AuditSubmission } from "@/lib/audit";

type FormState = {
  name: string;
  email: string;
  company: string;
  industry: string;
  size: string;
  drains: string;
  companyWebsite: string;
};

const emptyForm: FormState = {
  name: "",
  email: "",
  company: "",
  industry: "",
  size: "",
  drains: "",
  companyWebsite: "",
};

function mailtoHref(value: AuditSubmission) {
  const sizeLabel =
    companySizes.find((option) => option.value === value.size)?.label ?? value.size;
  const lines = [`Name: ${value.name}`, `Email: ${value.email}`, `Company: ${value.company}`];
  if (value.industry) lines.push(`Industry: ${value.industry}`);
  if (value.size) lines.push(`Company size: ${sizeLabel}`);
  lines.push("", "The work that costs the most:", value.drains);
  const subject = encodeURIComponent("AI savings audit");
  const body = encodeURIComponent(lines.join("\n"));
  return `mailto:${site.email}?subject=${subject}&body=${body}`;
}

export function ContactForm() {
  const baseId = useId();
  const [form, setForm] = useState<FormState>(emptyForm);
  const [errors, setErrors] = useState<AuditErrors>({});
  const [pending, setPending] = useState(false);
  const [result, setResult] = useState<{ submission: AuditSubmission; received: boolean } | null>(
    null,
  );
  const idempotencyKey = useRef<string | null>(null);

  function fieldId(name: string) {
    return `${baseId}-${name}`;
  }

  function update(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);

    const local = validateAudit(form);
    if (!local.ok) {
      setErrors(local.errors);
      return;
    }

    if (!idempotencyKey.current) idempotencyKey.current = crypto.randomUUID();
    setPending(true);
    setErrors({});
    const pageUrl = new URL(window.location.href);
    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey.current,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          company: form.company,
          industry: form.industry,
          size: form.size,
          drains: form.drains,
          company_website: form.companyWebsite,
          page_url: window.location.href,
          referrer: document.referrer,
          utm_source: pageUrl.searchParams.get("utm_source"),
          utm_medium: pageUrl.searchParams.get("utm_medium"),
          utm_campaign: pageUrl.searchParams.get("utm_campaign"),
          utm_term: pageUrl.searchParams.get("utm_term"),
          utm_content: pageUrl.searchParams.get("utm_content"),
        }),
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        received?: boolean;
        errors?: AuditErrors;
      };
      if (response.status === 409) {
        idempotencyKey.current = null;
      }
      if (!response.ok || !payload.ok || payload.received !== true) {
        setErrors(
          payload.errors ?? {
            form: "We could not save your request. Please try again.",
          },
        );
        if (payload.received === false && payload.ok) {
          setResult({ submission: local.value, received: false });
          setErrors({});
        }
        return;
      }
      setResult({ submission: local.value, received: true });
    } catch {
      setErrors({
        form: "We could not save your request. Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  if (result) {
    return (
      <div role="status" className="sheet border border-line bg-ivory p-6 text-ink sm:p-8">
        <h2 className="font-serif text-3xl tracking-tight text-ink">
          {result.received ? "Your request has been received." : "Send this request yourself."}
        </h2>
        {result.received ? (
          <>
            <p className="mt-4 text-base leading-relaxed text-quiet-ink">
              We will follow up at the address you entered.
            </p>
            {bookingUrl() ? (
              <div className="mt-4">
                <BookingPrompt />
              </div>
            ) : (
              <p className="mt-4 text-base leading-relaxed text-quiet-ink">
                You can also call{" "}
                <a className="font-semibold text-oxblood-ink underline underline-offset-4" href={`tel:${site.phoneTel}`}>
                  {site.phone}
                </a>
                .
              </p>
            )}
          </>
        ) : (
          <>
            <p className="mt-4 text-base leading-relaxed text-quiet-ink">
              This note has not been saved. Send it to{" "}
              <a
                className="font-semibold text-oxblood-ink underline underline-offset-4"
                href={`mailto:${site.email}`}
              >
                {site.email}
              </a>
              , or call{" "}
              <a className="font-semibold text-oxblood-ink underline underline-offset-4" href={`tel:${site.phoneTel}`}>
                {site.phone}
              </a>
              .
            </p>
            <p className="mt-6">
              <a
                className="inline-flex min-h-11 items-center justify-center bg-void px-5 text-sm font-semibold text-ivory hover:bg-raise"
                href={mailtoHref(result.submission)}
              >
                Email this audit request
              </a>
            </p>
          </>
        )}
        <button
          type="button"
          className="mt-4 text-sm font-semibold text-oxblood-ink underline underline-offset-4"
          onClick={() => {
            idempotencyKey.current = null;
            setResult(null);
            setForm(emptyForm);
          }}
        >
          Start another request
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate aria-label="AI savings audit request" className="sheet border border-line bg-ivory p-6 text-ink sm:p-8">
      <p className="text-sm text-quiet-ink">
        Name, email, company, and the work that costs the most are required.
      </p>
      {errors.form ? (
        <div role="alert" className="mt-4 border border-oxblood-ink bg-ivory-deep px-3 py-2 text-sm text-ink">
          <p>{errors.form}</p>
          <p className="mt-2">
            You can also email{" "}
            <a className="font-semibold underline" href={`mailto:${site.email}`}>
              {site.email}
            </a>{" "}
            or call{" "}
            <a className="font-semibold underline" href={`tel:${site.phoneTel}`}>
              {site.phone}
            </a>
            .
          </p>
        </div>
      ) : null}

      <div className="mt-6 grid gap-5">
        <Field
          id={fieldId("name")}
          label="Name"
          error={errors.name}
          autoComplete="name"
          value={form.name}
          onChange={(value) => update("name", value)}
        />
        <Field
          id={fieldId("email")}
          label="Email"
          type="email"
          error={errors.email}
          autoComplete="email"
          value={form.email}
          onChange={(value) => update("email", value)}
        />
        <Field
          id={fieldId("company")}
          label="Company"
          error={errors.company}
          autoComplete="organization"
          value={form.company}
          onChange={(value) => update("company", value)}
        />
        <Field
          id={fieldId("industry")}
          label="Industry"
          optional
          error={errors.industry}
          value={form.industry}
          onChange={(value) => update("industry", value)}
          placeholder="Manufacturing, hospitality, professional services"
        />
        <div>
          <label htmlFor={fieldId("size")} className="text-sm font-semibold text-ink">
            Company size <span className="font-normal text-quiet-ink">(optional)</span>
          </label>
          <select
            id={fieldId("size")}
            name="size"
            value={form.size}
            onChange={(event) => update("size", event.target.value)}
            aria-invalid={errors.size ? true : undefined}
            aria-describedby={errors.size ? `${fieldId("size")}-error` : undefined}
            className="mt-2 min-h-11 w-full border border-line bg-ivory-deep px-3 text-base text-ink"
          >
            <option value="">Select a range</option>
            {companySizes.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {errors.size ? (
            <p id={`${fieldId("size")}-error`} className="mt-2 text-sm text-oxblood-ink">
              {errors.size}
            </p>
          ) : null}
        </div>
        <div>
          <label htmlFor={fieldId("drains")} className="text-sm font-semibold text-ink">
            The work that costs the most
          </label>
          <textarea
            id={fieldId("drains")}
            name="drains"
            required
            rows={6}
            maxLength={4000}
            value={form.drains}
            onChange={(event) => update("drains", event.target.value)}
            aria-invalid={errors.drains ? true : undefined}
            aria-describedby={errors.drains ? `${fieldId("drains")}-error` : undefined}
            placeholder="e.g. booking replies we write from scratch every day"
            className="mt-2 w-full border border-line bg-ivory-deep px-3 py-3 text-base leading-relaxed text-ink"
          />
          {errors.drains ? (
            <p id={`${fieldId("drains")}-error`} className="mt-2 text-sm text-oxblood-ink">
              {errors.drains}
            </p>
          ) : null}
        </div>
      </div>

      <div className="sr-only" aria-hidden="true">
        <label htmlFor={fieldId("website")}>
          Company website
          <input
            id={fieldId("website")}
            name="company_website"
            tabIndex={-1}
            autoComplete="off"
            value={form.companyWebsite}
            onChange={(event) => update("companyWebsite", event.target.value)}
          />
        </label>
      </div>

      <p className="mt-6 text-sm leading-relaxed text-quiet-ink">
        Free. No obligation. We reply within one business day with a time to talk.
      </p>
      <button
        type="submit"
        disabled={pending}
        aria-busy={pending}
        className="mt-4 inline-flex min-h-11 items-center justify-center bg-void px-5 text-sm font-semibold text-ivory hover:bg-raise disabled:cursor-wait disabled:opacity-70"
      >
        {pending ? "Saving" : "Request my free audit"}
      </button>
      <p className="mt-4 text-sm leading-relaxed text-quiet-ink">
        We save your request and email you a confirmation. We reply within one business day. You
        can also email {site.email} or call {site.phone}.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-quiet-ink">
        We store this request so we can reply, and we do not sell it.{" "}
        <Link href="/privacy" className="font-semibold text-oxblood-ink underline underline-offset-4">
          Privacy
        </Link>
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  type = "text",
  autoComplete,
  placeholder,
  optional = false,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  type?: string;
  autoComplete?: string;
  placeholder?: string;
  optional?: boolean;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-semibold text-ink">
        {label}
        {optional ? <span className="font-normal text-quiet-ink"> (optional)</span> : null}
      </label>
      <input
        id={id}
        name={label.toLowerCase()}
        type={type}
        value={value}
        autoComplete={autoComplete}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2 min-h-11 w-full border border-line bg-ivory-deep px-3 text-base text-ink"
      />
      {error ? (
        <p id={`${id}-error`} className="mt-2 text-sm text-oxblood-ink">
          {error}
        </p>
      ) : null}
    </div>
  );
}
