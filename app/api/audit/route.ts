import { handleAuditRequest } from "@/lib/crm/audit-request";

/**
 * Save a free AI savings audit request before telling the visitor it was received.
 * Email and webhook notifications are queued separately for the worker.
 * Do not log the body. Do not commit keys. See docs/crm.md.
 */
export async function POST(request: Request) {
  return handleAuditRequest(request);
}
