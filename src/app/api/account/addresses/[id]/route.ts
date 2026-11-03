import { apiHandler } from "@/server/http/handler";
import { requireUser } from "@/server/auth/current-user";
import { removeUserAddress } from "@/server/repositories/user.repository";

export const DELETE = apiHandler(async (_request, context: { params: Promise<{ id: string }> }) => {
  const user = await requireUser();
  const { id } = await context.params;
  const addresses = await removeUserAddress(user.id, id);
  return Response.json({ addresses });
});

