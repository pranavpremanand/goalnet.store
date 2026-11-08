export type OfferDiscountType = "flat" | "percentage";
export type OfferAppliesTo = "all" | "categories" | "products";

export type OfferDto = {
  id: string;
  name: string;
  slug: string;
  discountType: OfferDiscountType;
  discountValue: number;
  appliesTo: OfferAppliesTo;
  categoryIds: string[];
  productIds: string[];
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type OfferInput = Omit<OfferDto, "id" | "slug" | "createdAt" | "updatedAt"> & { slug?: string };

export type OfferPrice = {
  price: number;
  originalPrice: number;
  discountAmount: number;
  offerName: string | null;
};
