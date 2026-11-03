import { apiHandler } from "@/server/http/handler";
import { requireUser } from "@/server/auth/current-user";
import { getCustomerTicket } from "@/server/services/ticket.service";

export const GET = apiHandler(async (_request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await context.params;
  const ticket = await getCustomerTicket(id, user.id);
  return Response.json({ ticket });
});

