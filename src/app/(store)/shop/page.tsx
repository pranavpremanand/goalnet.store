import { Suspense } from "react";
import { CollectionLoadingSkeleton } from "@/components/common/Loading";
import { ShopPage } from "@/components/pages/shop/ShopPage";
import { listStoreCategories, listStorePriceBands, listStoreProducts } from "@/server/services/storefront.service";

export const metadata = { title: "Shop | GoalNet" };

async function Shop() {
  const [products, categories, priceBands] = await Promise.all([
    listStoreProducts(),
    listStoreCategories(),
    listStorePriceBands(),
  ]);
  return <ShopPage categories={categories} priceBands={priceBands} products={products} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={<CollectionLoadingSkeleton />}
    >
      <Shop />
    </Suspense>
  );
}
