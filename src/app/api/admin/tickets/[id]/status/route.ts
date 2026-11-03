import { apiHandler } from "@/server/http/handler";
import { requireAdmin } from "@/server/auth/current-user";
import { BadRequestError } from "@/server/errors";
import { adminSetTicketStatus } from "@/server/services/ticket.service";
import type { TicketStatus } from "@/server/models/ticket.model";

const VALID_STATUSES: TicketStatus[] = ["open", "in_progress", "resolved", "closed"];

export const PATCH = apiHandler(async (request, context: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const status = body?.status as TicketStatus;

  if (!VALID_STATUSES.includes(status)) {
    throw new BadRequestError("Invalid status value.");
  }

  const ticket = await adminSetTicketStatus(id, status);
  return Response.json({ ticket });
});

