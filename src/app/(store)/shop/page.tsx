import { Suspense } from "react";
import { CollectionLoadingSkeleton } from "@/components/common/Loading";
import { ShopPage } from "@/components/pages/shop/ShopPage";
import { listStoreCategories, listStorePriceBands, listStoreProductPage } from "@/server/services/storefront.service";

export const metadata = { title: "Shop | GoalNet" };

async function Shop({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const rawSearchParams = await searchParams;
  const searchQuery = typeof rawSearchParams.q === "string" ? rawSearchParams.q.trim().slice(0, 80) : "";
  const rawCategories = rawSearchParams.category ?? rawSearchParams.categories;
  const initialCategories = (Array.isArray(rawCategories) ? rawCategories : rawCategories ? [rawCategories] : [])
    .flatMap((category) => category.split(","))
    .filter(Boolean)
    .slice(0, 30);
  const [initialPage, categories, priceBands] = await Promise.all([
    listStoreProductPage({
      page: 1,
      query: searchQuery,
      categories: initialCategories,
      sort: "featured",
    }),
    listStoreCategories(),
    listStorePriceBands(),
  ]);
  return (
    <ShopPage
      categories={categories}
      initialCategories={initialCategories}
      initialPage={initialPage}
      key={JSON.stringify([searchQuery, initialCategories])}
      priceBands={priceBands}
      searchQuery={searchQuery}
    />
  );
}

export default function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  return (
    <Suspense
      fallback={<CollectionLoadingSkeleton />}
    >
      <Shop searchParams={searchParams} />
    </Suspense>
  );
}
