import { AdminAnnouncementBar } from "@/components/pages/admin/AdminAnnouncementBar";
import { requireAdminPage } from "@/server/auth/current-user";
import * as announcementService from "@/server/services/announcement.service";

export const metadata = { title: "Announcement bar | GoalNet Admin" };

export default async function Page() {
  await requireAdminPage();
  return <AdminAnnouncementBar announcement={await announcementService.getAnnouncementBar()} />;
}
