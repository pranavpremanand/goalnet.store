import { z } from "zod";
import { objectIdSchema } from "@/lib/validation/catalog";
import { requireAdmin } from "@/server/auth/current-user";
import { NotFoundError } from "@/server/errors";
import { apiHandler, readJson } from "@/server/http/handler";
import * as adminUserService from "@/server/services/admin-user.service";

type Context = { params: Promise<{ id: string }> };
const blockedSchema = z.object({ isBlocked: z.boolean() }).strict();

export const PATCH = apiHandler<Context>(async (request, context) => {
  await requireAdmin();
  const id = objectIdSchema.safeParse((await context.params).id);
  if (!id.success) throw new NotFoundError("Customer not found.");
  const { isBlocked } = await readJson(request, blockedSchema);
  const user = await adminUserService.setCustomerBlocked(id.data, isBlocked);
  return Response.json({ user });
});
