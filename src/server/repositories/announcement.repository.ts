import { connectToDatabase } from "@/server/db/connect";
import { AnnouncementBarModel, type AnnouncementBarAttrs } from "@/server/models/announcement.model";
import type { AnnouncementBarInput } from "@/lib/validation/announcement";

const ANNOUNCEMENT_KEY = "site-announcement";
const DEFAULT_ANNOUNCEMENT = "For the love of the game.";

export async function getAnnouncementBar() {
  await connectToDatabase();
  const record = await AnnouncementBarModel.findOne({ key: ANNOUNCEMENT_KEY })
    .lean<AnnouncementBarAttrs & { updatedAt?: Date }>();
  return {
    text: record?.text ?? DEFAULT_ANNOUNCEMENT,
    isActive: record?.isActive ?? false,
    updatedAt: record?.updatedAt?.toISOString() ?? null,
  };
}

export async function saveAnnouncementBar(input: AnnouncementBarInput) {
  await connectToDatabase();
  const record = await AnnouncementBarModel.findOneAndUpdate(
    { key: ANNOUNCEMENT_KEY },
    { $set: input, $setOnInsert: { key: ANNOUNCEMENT_KEY } },
    { upsert: true, returnDocument: "after", runValidators: true, setDefaultsOnInsert: true },
  ).lean<AnnouncementBarAttrs>();
  return {
    text: record.text,
    isActive: record.isActive,
    updatedAt: record.updatedAt.toISOString(),
  };
}
