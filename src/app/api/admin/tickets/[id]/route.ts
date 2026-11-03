import { apiHandler } from "@/server/http/handler";
import { requireAdmin } from "@/server/auth/current-user";
import { adminGetTicket } from "@/server/services/ticket.service";

export const GET = apiHandler(async (_request, context: { params: Promise<{ id: string }> }) => {
  await requireAdmin();
  const { id } = await context.params;
  const ticket = await adminGetTicket(id);
  return Response.json({ ticket });
});

