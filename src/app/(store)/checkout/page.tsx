import { CheckoutPage } from "@/components/pages/checkout/CheckoutPage";

export const metadata = { title: "Your Bag | GoalNet" };

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ buyNow?: string | string[]; size?: string | string[] }>;
}) {
  const params = await searchParams;
  const productId = typeof params.buyNow === "string" ? params.buyNow : undefined;
  const size = typeof params.size === "string" ? params.size : undefined;

  return <CheckoutPage buyNow={productId && size ? { productId, size } : undefined} />;
}