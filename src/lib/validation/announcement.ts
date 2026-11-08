import { z } from "zod";

export const announcementBarInputSchema = z.object({
  text: z.string().trim().min(1, "Enter an announcement").max(180, "Announcement must be 180 characters or fewer"),
  isActive: z.boolean(),
});

export type AnnouncementBarInput = z.infer<typeof announcementBarInputSchema>;
