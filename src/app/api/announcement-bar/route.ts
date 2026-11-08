import { apiHandler } from "@/server/http/handler";
import * as announcementService from "@/server/services/announcement.service";

export const GET = apiHandler(async () => {
  return Response.json({ announcement: await announcementService.getAnnouncementBar() });
});
