import { apiHandler } from "@/server/http/handler";
import { requireUser } from "@/server/auth/current-user";
import { BadRequestError } from "@/server/errors";
import { customerReplyToTicket } from "@/server/services/ticket.service";

export const POST = apiHandler(async (request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await context.params;
  const body = await request.json().catch(() => null);
  const message = typeof body?.message === "string" ? body.message.trim() : "";

  if (!message) throw new BadRequestError("Message cannot be empty.");

  const ticket = await customerReplyToTicket(id, user.id, user.name, message);
  return Response.json({ ticket });
});

