import { Suspense } from "react";
import { notFound } from "next/navigation";
import { AdminProductDetail } from "@/components/pages/admin/AdminProductDetail";
import { featuredProducts } from "@/data/products";

export function generateStaticParams() {
  return featuredProducts.map((product) => ({ productId: product.id }));
}

async function ProductRoute({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const product = featuredProducts.find((item) => item.id === productId);
  if (!product) notFound();
  return <AdminProductDetail product={product} />;
}

export default function Page({ params }: { params: Promise<{ productId: string }> }) {
  return <Suspense><ProductRoute params={params} /></Suspense>;
}