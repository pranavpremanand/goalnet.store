import type { AnnouncementBarInput } from "@/lib/validation/announcement";
import * as announcementRepository from "@/server/repositories/announcement.repository";

export async function getAnnouncementBar() {
  return announcementRepository.getAnnouncementBar();
}

export async function saveAnnouncementBar(input: AnnouncementBarInput) {
  return announcementRepository.saveAnnouncementBar(input);
}
