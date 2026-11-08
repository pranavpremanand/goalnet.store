import { announcementBarInputSchema } from "@/lib/validation/announcement";
import { requireAdmin } from "@/server/auth/current-user";
import { apiHandler, readJson } from "@/server/http/handler";
import * as announcementService from "@/server/services/announcement.service";

export const GET = apiHandler(async () => {
  await requireAdmin();
  return Response.json({ announcement: await announcementService.getAnnouncementBar() });
});

export const PUT = apiHandler(async (request) => {
  await requireAdmin();
  const input = await readJson(request, announcementBarInputSchema);
  return Response.json({ announcement: await announcementService.saveAnnouncementBar(input) });
});
