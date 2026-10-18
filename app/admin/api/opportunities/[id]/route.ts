import { addNote, setConsent, updateOpportunity } from "@/lib/crm/queries";
import { authorizeMutation, formValue, privateRedirect } from "@/lib/crm/http";
import { logSafe } from "@/lib/crm/text";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const form = await request.formData();
  const access = await authorizeMutation(request, formValue(form, "csrf"));
  if (!access.ok) return access.response;
  const intent = formValue(form, "intent");
  try {
    const result =
      intent === "note"
        ? await addNote(access.db, id, formValue(form, "note"))
        : intent === "consent"
          ? await setConsent(access.db, formValue(form, "contact_id"), {
              consent: formValue(form, "marketing_consent") === "yes",
              evidence: formValue(form, "consent_evidence"),
            })
          : await updateOpportunity(access.db, id, {
              stage: formValue(form, "stage"),
              priority: formValue(form, "priority"),
              estimated: formValue(form, "estimated"),
              nextAction: formValue(form, "next_action"),
              nextActionOn: formValue(form, "next_action_on"),
              ownerNotes: formValue(form, "owner_notes"),
            });
    const target = new URL(`/admin/crm/opportunities/${id}`, request.url);
    if (!result.ok) target.searchParams.set("error", "invalid");
    else target.searchParams.set("saved", "1");
    return privateRedirect(target);
  } catch (err) {
    logSafe("crm update", err);
    return privateRedirect(new URL(`/admin/crm/opportunities/${id}?error=unavailable`, request.url));
  }
}
