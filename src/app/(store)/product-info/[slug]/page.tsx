import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProductDetailsPage } from "@/components/pages/product-details/ProductDetailsPage";
import { getStoreProduct, listRelatedProducts } from "@/server/services/storefront.service";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const product = await getStoreProduct((await params).slug);
  if (!product) return { title: "Product not found | GoalNet" };
  return { title: `${product.seoTitle || product.name} | GoalNet`, description: product.seoDescription || product.description.slice(0, 160) || undefined };
}

async function Product({ params }: Params) {
  const { slug } = await params;
  const product = await getStoreProduct(slug);
  if (!product) notFound();
  return <ProductDetailsPage product={product} related={await listRelatedProducts(product, 4)} />;
}

export default function Page({ params }: Params) {
  return (
    <Suspense fallback={<main className="mx-auto min-h-[60vh] max-w-[1440px] px-5 py-12 text-sm text-muted">Loading product…</main>}>
      <Product params={params} />
    </Suspense>
  );
}
