import type { Types } from "mongoose";
import { connectToDatabase } from "@/server/db/connect";
import type { HeroSlideInput } from "@/lib/validation/hero";
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
    image: { url: doc.image.url, fileId: doc.image.fileId, alt: doc.image.alt ?? "" },
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

export async function createHeroSlide(input: HeroSlideInput): Promise<HeroSlideRecord> {
  await connectToDatabase();
  const doc = await HeroSlideModel.create(input);
  return toRecord(doc.toObject() as HeroSlideDoc);
}

export async function updateHeroSlide(id: string, input: HeroSlideInput): Promise<HeroSlideRecord | null> {
  await connectToDatabase();
  const doc = await HeroSlideModel.findByIdAndUpdate(id, { $set: input }, { returnDocument: "after", runValidators: true }).lean<HeroSlideDoc>();
  return doc ? toRecord(doc) : null;
}

export async function deleteHeroSlide(id: string) {
  await connectToDatabase();
  return (await HeroSlideModel.deleteOne({ _id: id })).deletedCount === 1;
}

export async function isHeroImageFileUsed(fileId: string) {
  await connectToDatabase();
  return (await HeroSlideModel.exists({ "image.fileId": fileId })) !== null;
}
