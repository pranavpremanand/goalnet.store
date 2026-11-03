import { objectIdSchema } from "@/lib/validation/catalog";
import { orderUpdateSchema } from "@/lib/validation/orders";
import { requireAdmin } from "@/server/auth/current-user";
import { NotFoundError } from "@/server/errors";
import { apiHandler, readJson } from "@/server/http/handler";
import * as orderService from "@/server/services/order.service";

type Context = { params: Promise<{ id: string }> };

export const PATCH = apiHandler<Context>(async (request, { params }) => {
  await requireAdmin();
  const id = objectIdSchema.safeParse((await params).id);
  if (!id.success) throw new NotFoundError("Order not found.");
  const input = await readJson(request, orderUpdateSchema);
  return Response.json({ order: await orderService.updateOrder(id.data, input) });
});
