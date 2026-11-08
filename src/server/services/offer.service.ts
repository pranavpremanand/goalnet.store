import type { OfferDto, OfferPrice } from "@/lib/types/offers";
import type { ProductDto } from "@/lib/types/catalog";
import { isDuplicateKeyError } from "@/server/db/errors";
import { BadRequestError, ConflictError, NotFoundError } from "@/server/errors";
import * as categoryRepository from "@/server/repositories/category.repository";
import * as offerRepository from "@/server/repositories/offer.repository";
import * as productRepository from "@/server/repositories/product.repository";
import { resolveSlug } from "@/server/services/slug.service";
import type { OfferInput } from "@/lib/validation/offers";

type OfferTargetProduct = Pick<ProductDto, "id" | "price" | "category" | "categories">;
type CurrentOffer = Awaited<ReturnType<typeof offerRepository.listCurrentOffers>>[number];

export async function listOffers() {
  return offerRepository.listOffers();
}

function offerMatches(offer: CurrentOffer, product: OfferTargetProduct) {
  if (offer.appliesTo === "all") return true;
  if (offer.appliesTo === "products") return offer.productIds.some((id) => id.toString() === product.id);
  const categoryIds = new Set([product.category.id, ...product.categories.map((category) => category.id)]);
  return offer.categoryIds.some((id) => categoryIds.has(id.toString()));
}

export function bestOfferPrice(product: OfferTargetProduct, offers: CurrentOffer[]): OfferPrice {
  let best: { offer: CurrentOffer; discount: number } | null = null;
  for (const offer of offers) {
    if (!offerMatches(offer, product)) continue;
    const rawDiscount = offer.discountType === "flat"
      ? offer.discountValue
      : product.price * offer.discountValue / 100;
    const discount = Math.min(product.price, Math.round(rawDiscount * 100) / 100);
    if (discount > 0 && (!best || discount > best.discount)) best = { offer, discount };
  }
  return {
    price: product.price - (best?.discount ?? 0),
    originalPrice: product.price,
    discountAmount: best?.discount ?? 0,
    offerName: best?.offer.name ?? null,
  };
}

export async function priceProducts<T extends OfferTargetProduct>(products: T[]): Promise<Map<string, OfferPrice>> {
  if (products.length === 0) return new Map();
  const offers = await offerRepository.listCurrentOffers(new Date());
  return new Map(products.map((product) => [product.id, bestOfferPrice(product, offers)]));
}

function toData(input: OfferInput, slug: string): offerRepository.OfferData {
  return {
    ...input,
    slug,
    categoryIds: input.appliesTo === "categories" ? input.categoryIds : [],
    productIds: input.appliesTo === "products" ? input.productIds : [],
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
  };
}

async function assertTargetsExist(input: OfferInput) {
  if (input.appliesTo === "categories") {
    const categories = await Promise.all(input.categoryIds.map((id) => categoryRepository.findCategoryById(id)));
    if (categories.some((category) => !category)) throw new BadRequestError("One or more selected categories do not exist.");
  }
  if (input.appliesTo === "products") {
    const products = await Promise.all(input.productIds.map((id) => productRepository.findProductById(id)));
    if (products.some((product) => !product)) throw new BadRequestError("One or more selected products do not exist.");
  }
}

export async function createOffer(input: OfferInput) {
  await assertTargetsExist(input);
  const slug = await resolveSlug({
    requested: input.slug,
    name: input.name,
    exists: (value) => offerRepository.offerSlugExists(value),
  });
  try {
    return await offerRepository.createOffer(toData(input, slug));
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new ConflictError("This offer slug is already in use.");
    throw error;
  }
}

export async function updateOffer(id: string, input: OfferInput) {
  await assertTargetsExist(input);
  const slug = await resolveSlug({
    requested: input.slug,
    name: input.name,
    exists: (value) => offerRepository.offerSlugExists(value, id),
  });
  let offer: OfferDto | null;
  try {
    offer = await offerRepository.updateOffer(id, toData(input, slug));
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new ConflictError("This offer slug is already in use.");
    throw error;
  }
  if (!offer) throw new NotFoundError("Offer not found.");
  return offer;
}

export async function deleteOffer(id: string) {
  if (!(await offerRepository.deleteOffer(id))) throw new NotFoundError("Offer not found.");
}
