import { apiHandler } from "@/server/http/handler";
import { requireAdmin } from "@/server/auth/current-user";
import { adminListTickets } from "@/server/services/ticket.service";

export const GET = apiHandler(async (request) => {
  await requireAdmin();
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") ?? undefined;
  const search = searchParams.get("search") ?? undefined;
  const tickets = await adminListTickets({ status, search });
  return Response.json({ tickets });
});

