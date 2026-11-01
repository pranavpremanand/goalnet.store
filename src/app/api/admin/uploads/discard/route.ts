import { discardUploadsSchema } from "@/lib/validation/catalog";
import { requireAdmin } from "@/server/auth/current-user";
import { apiHandler, readJson } from "@/server/http/handler";
import { discardUnusedUploads } from "@/server/services/image.service";

export const POST = apiHandler(async (request) => {
  await requireAdmin();
  const { fileIds } = await readJson(request, discardUploadsSchema);
  await discardUnusedUploads(fileIds);
  return new Response(null, { status: 204 });
});
