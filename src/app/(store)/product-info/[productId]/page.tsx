import { notFound } from "next/navigation";
import { ProductDetailsPage } from "@/components/pages/product-details/ProductDetailsPage";
import { featuredProducts } from "@/data/products";

export function generateStaticParams() {
  return featuredProducts.map((product) => ({ productId: product.id }));
}

export default async function Page({ params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  const product = featuredProducts.find((item) => item.id === productId);
  if (!product) notFound();
  return <ProductDetailsPage product={product} />;
}