import { z } from "zod";
import { requireAdmin } from "@/server/auth/current-user";
import { apiHandler } from "@/server/http/handler";
import * as adminUserService from "@/server/services/admin-user.service";

const querySchema = z.object({
  q: z.string().trim().max(100).default(""),
  page: z.coerce.number().int().min(1).default(1),
});

export const GET = apiHandler(async (request) => {
  await requireAdmin();
  const { q, page } = querySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
  return Response.json(await adminUserService.listAdminUsers({ q, page, limit: 50 }));
});
