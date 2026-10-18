import { createOwnerRecord } from "@/lib/crm/queries";
import { authorizeMutation, formValue, privateRedirect } from "@/lib/crm/http";
import { logSafe } from "@/lib/crm/text";

export async function POST(request: Request) {
  const form = await request.formData();
  const access = await authorizeMutation(request, formValue(form, "csrf"));
  if (!access.ok) return access.response;
  try {
    const created = await createOwnerRecord(access.db, {
      company: formValue(form, "company"),
      website: formValue(form, "website"),
      industry: formValue(form, "industry"),
      location: formValue(form, "location"),
      contactName: formValue(form, "contact_name"),
      role: formValue(form, "role"),
      email: formValue(form, "email"),
      phone: formValue(form, "phone"),
      stage: formValue(form, "stage"),
      nextAction: formValue(form, "next_action"),
      nextActionOn: formValue(form, "next_action_on"),
      notes: formValue(form, "notes"),
    });
    if (!created.ok) {
      return privateRedirect(new URL("/admin/crm?error=invalid", request.url));
    }
    return privateRedirect(new URL(`/admin/crm/opportunities/${created.id}`, request.url));
  } catch (err) {
    logSafe("crm create contact", err);
    return privateRedirect(new URL("/admin/crm?error=unavailable", request.url));
  }
}
