import { apiHandler } from "@/server/http/handler";
import { requireAdmin } from "@/server/auth/current-user";
import { BadRequestError } from "@/server/errors";
import { adminReplyToTicket } from "@/server/services/ticket.service";

export const POST = apiHandler(async (request, context: { params: Promise<{ id: string }> }) => {
  const admin = await requireAdmin();
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message) throw new BadRequestError("Message cannot be empty.");

  const ticket = await adminReplyToTicket(id, admin.id, admin.name, message);
  return Response.json({ ticket });
});

