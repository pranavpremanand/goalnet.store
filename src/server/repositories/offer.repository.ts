import { Types } from "mongoose";
import type { OfferDto } from "@/lib/types/offers";
import { connectToDatabase } from "@/server/db/connect";
import { OfferModel, type OfferAttrs } from "@/server/models/offer.model";

type OfferDoc = OfferAttrs & { _id: Types.ObjectId };
export type OfferData = Omit<OfferAttrs, "createdAt" | "updatedAt" | "categoryIds" | "productIds"> & {
  categoryIds: string[];
  productIds: string[];
};

function toDto(doc: OfferDoc): OfferDto {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    discountType: doc.discountType,
    discountValue: doc.discountValue,
    appliesTo: doc.appliesTo,
    categoryIds: doc.categoryIds.map(String),
    productIds: doc.productIds.map(String),
    startDate: doc.startDate.toISOString(),
    endDate: doc.endDate.toISOString(),
    isActive: doc.isActive,
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

export async function listOffers(): Promise<OfferDto[]> {
  await connectToDatabase();
  const docs = await OfferModel.find({}).sort({ createdAt: -1 }).lean<OfferDoc[]>();
  return docs.map(toDto);
}

export async function listCurrentOffers(now: Date) {
  await connectToDatabase();
  return OfferModel.find({ isActive: true, startDate: { $lte: now }, endDate: { $gte: now } })
    .sort({ createdAt: 1, _id: 1 })
    .lean<OfferDoc[]>();
}

export async function offerSlugExists(slug: string, excludeId?: string) {
  await connectToDatabase();
  return (await OfferModel.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) !== null;
}

export async function createOffer(data: OfferData): Promise<OfferDto> {
  await connectToDatabase();
  const doc = await OfferModel.create(data);
  return toDto(doc.toObject() as OfferDoc);
}

export async function updateOffer(id: string, data: OfferData): Promise<OfferDto | null> {
  await connectToDatabase();
  const doc = await OfferModel.findByIdAndUpdate(id, { $set: data }, { returnDocument: "after", runValidators: true }).lean<OfferDoc>();
  return doc ? toDto(doc) : null;
}

export async function deleteOffer(id: string) {
  await connectToDatabase();
  return (await OfferModel.deleteOne({ _id: id })).deletedCount === 1;
}
