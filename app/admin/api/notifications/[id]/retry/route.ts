import { retryFailedJob } from "@/lib/crm/notify";
import { authorizeMutation, formValue, privateJson, privateRedirect } from "@/lib/crm/http";
import { isUuid, logSafe } from "@/lib/crm/text";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const form = await request.formData();
  const access = await authorizeMutation(request, formValue(form, "csrf"));
  if (!access.ok) return access.response;
  if (!isUuid(id)) return privateJson({ ok: false, error: "That notification was not found." }, 404);
  try {
    const result = await retryFailedJob(access.db, id);
    if (!result.ok) return privateRedirect(new URL("/admin/crm/notifications?error=missing", request.url));
    return privateRedirect(new URL("/admin/crm/notifications?retried=1", request.url));
  } catch (err) {
    logSafe("crm notification retry", err);
    return privateRedirect(new URL("/admin/crm/notifications?error=unavailable", request.url));
  }
}
