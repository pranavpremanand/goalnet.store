import { Suspense } from "react";
import { ShopPage } from "@/components/pages/shop/ShopPage";
import { listStoreCategories, listStoreProducts } from "@/server/services/storefront.service";

export const metadata = { title: "Shop | GoalNet" };

async function Shop() {
  const [products, categories] = await Promise.all([listStoreProducts(), listStoreCategories()]);
  return <ShopPage categories={categories} products={products} />;
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto min-h-[60vh] max-w-[1440px] px-5 py-12 text-sm text-muted">
          Loading collection…
        </main>
      }
    >
      <Shop />
    </Suspense>
  );
}
