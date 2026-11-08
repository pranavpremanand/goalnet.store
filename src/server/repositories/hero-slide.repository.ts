import type { Types } from "mongoose";
import { connectToDatabase } from "@/server/db/connect";
import type { HeroSlideOutput } from "@/lib/validation/hero";
import { resolveHeroMediaType } from "@/lib/types/hero";
import { HeroSlideModel, type HeroSlideAttrs } from "@/server/models/hero-slide.model";

export type HeroSlideRecord = Omit<HeroSlideAttrs, "createdAt" | "updatedAt"> & { id: string; createdAt: string; updatedAt: string };

type HeroSlideDoc = HeroSlideAttrs & { _id: Types.ObjectId };

function toRecord(doc: HeroSlideDoc): HeroSlideRecord {
  return {
    id: doc._id.toString(),
    tagline: doc.tagline,
    heading: doc.heading,
    highlightedWord: doc.highlightedWord ?? "",
    description: doc.description,
    showContent: doc.showContent ?? true,
    image: {
      url: doc.image.url,
      fileId: doc.image.fileId,
      alt: doc.image.alt ?? "",
      mediaType: resolveHeroMediaType({ url: doc.image.url, mediaType: doc.image.mediaType }),
    },
    mobileImage: doc.mobileImage?.url && doc.mobileImage.fileId
      ? { url: doc.mobileImage.url, fileId: doc.mobileImage.fileId, alt: doc.mobileImage.alt ?? "", mediaType: "image" }
      : null,
    desktopImage: doc.desktopImage?.url && doc.desktopImage.fileId
      ? { url: doc.desktopImage.url, fileId: doc.desktopImage.fileId, alt: doc.desktopImage.alt ?? "", mediaType: "image" }
      : null,
    buttons: doc.buttons.map((button) => ({ label: button.label, href: button.href, style: button.style })),
    isActive: doc.isActive,
    displayOrder: doc.displayOrder,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function listHeroSlides(options: { activeOnly?: boolean } = {}): Promise<HeroSlideRecord[]> {
  await connectToDatabase();
  const docs = await HeroSlideModel.find(options.activeOnly ? { isActive: true } : {}).sort({ displayOrder: 1, createdAt: 1 }).lean<HeroSlideDoc[]>();
  return docs.map(toRecord);
}

export async function findHeroSlide(id: string): Promise<HeroSlideRecord | null> {
  await connectToDatabase();
  const doc = await HeroSlideModel.findById(id).lean<HeroSlideDoc>();
  return doc ? toRecord(doc) : null;
}

export async function createHeroSlide(input: HeroSlideOutput): Promise<HeroSlideRecord> {
  await connectToDatabase();
  const doc = await HeroSlideModel.create(input);
  return toRecord(doc.toObject() as HeroSlideDoc);
}

export async function updateHeroSlide(id: string, input: HeroSlideOutput): Promise<HeroSlideRecord | null> {
  await connectToDatabase();
  const doc = await HeroSlideModel.findByIdAndUpdate(id, { $set: input }, { returnDocument: "after", runValidators: true }).lean<HeroSlideDoc>();
  return doc ? toRecord(doc) : null;
}

export async function reorderHeroSlides(ids: string[]) {
  await connectToDatabase();
  if (ids.length === 0) return;
  await HeroSlideModel.bulkWrite(ids.map((id, displayOrder) => ({
    updateOne: { filter: { _id: id }, update: { $set: { displayOrder } } },
  })));
}

export async function deleteHeroSlide(id: string) {
  await connectToDatabase();
  return (await HeroSlideModel.deleteOne({ _id: id })).deletedCount === 1;
}

export async function isHeroMediaFileUsed(fileId: string) {
  await connectToDatabase();
  return (await HeroSlideModel.exists({
    $or: [
      { "image.fileId": fileId },
      { "mobileImage.fileId": fileId },
      { "desktopImage.fileId": fileId },
    ],
  })) !== null;
}
