import { previewImport } from "@/lib/crm/import";
import { authorizeMutation, formValue, privateRedirect } from "@/lib/crm/http";
import { logSafe } from "@/lib/crm/text";

export async function POST(request: Request) {
  const form = await request.formData();
  const access = await authorizeMutation(request, formValue(form, "csrf"));
  if (!access.ok) return access.response;
  const file = form.get("file");
  if (!(file instanceof File)) {
    return privateRedirect(new URL("/admin/crm/import?error=file", request.url));
  }
  try {
    const csv = await file.text();
    const preview = await previewImport(access.db, { filename: file.name, csv });
    if (!preview.ok) {
      return privateRedirect(new URL(`/admin/crm/import?error=invalid`, request.url));
    }
    return privateRedirect(new URL(`/admin/crm/import?batch=${preview.batchId}`, request.url));
  } catch (err) {
    logSafe("crm import preview", err);
    return privateRedirect(new URL("/admin/crm/import?error=unavailable", request.url));
  }
}
