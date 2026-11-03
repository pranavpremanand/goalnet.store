import { apiHandler } from "@/server/http/handler";
import { requireUser } from "@/server/auth/current-user";
import { BadRequestError } from "@/server/errors";
import { createCustomerTicket, listCustomerTickets } from "@/server/services/ticket.service";

export const GET = apiHandler(async () => {
  const user = await requireUser();
  const tickets = await listCustomerTickets(user.id);
  return Response.json({ tickets });
});

export const POST = apiHandler(async (request) => {
  const user = await requireUser();
  const body = await request.json().catch(() => null);
  const subject = typeof body?.subject === "string" ? body.subject.trim() : "";
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  const orderRef = typeof body?.orderRef === "string" ? body.orderRef.trim() : "";

  if (!subject) throw new BadRequestError("Topic/subject is required.");
  if (!message) throw new BadRequestError("Issue description / message is required.");

  const ticket = await createCustomerTicket({
    userId: user.id,
    userName: user.name,
    userEmail: user.email,
    orderRef,
    subject,
    message,
  });

  return Response.json({ ticket }, { status: 201 });
});

