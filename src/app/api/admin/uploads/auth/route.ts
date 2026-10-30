import { uploadTargetSchema } from "@/lib/validation/catalog";
import { requireAdmin } from "@/server/auth/current-user";
import { apiHandler, readJson } from "@/server/http/handler";
import { createUploadAuth } from "@/server/services/image.service";

export const POST = apiHandler(async (request) => {
  await requireAdmin();
  const { target } = await readJson(request, uploadTargetSchema);
  return Response.json(createUploadAuth(target), { headers: { "Cache-Control": "no-store" } });
});
