import { confirmImport } from "@/lib/crm/import";
import { authorizeMutation, formValue, privateRedirect } from "@/lib/crm/http";
import { isUuid, logSafe } from "@/lib/crm/text";

export async function POST(request: Request) {
  const form = await request.formData();
  const access = await authorizeMutation(request, formValue(form, "csrf"));
  if (!access.ok) return access.response;
  const batchId = formValue(form, "batch");
  if (!isUuid(batchId)) return privateRedirect(new URL("/admin/crm/import?error=invalid", request.url));
  try {
    const result = await confirmImport(access.db, batchId);
    if (!result.ok) return privateRedirect(new URL("/admin/crm/import?error=invalid", request.url));
    return privateRedirect(new URL(`/admin/crm/import?batch=${batchId}&saved=1`, request.url));
  } catch (err) {
    logSafe("crm import confirm", err);
    return privateRedirect(new URL("/admin/crm/import?error=unavailable", request.url));
  }
}
