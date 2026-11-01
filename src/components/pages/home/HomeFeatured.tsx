import { Suspense } from "react";
import Link from "next/link";
import { unstable_rethrow } from "next/navigation";
import { LuArrowUpRight as ArrowUpRight } from "react-icons/lu";
import { ProductCard } from "@/components/common/ProductCard";
import { listFeaturedProducts } from "@/server/services/storefront.service";

async function FeaturedProducts() {
  let products: Awaited<ReturnType<typeof listFeaturedProducts>> = [];
  try {
    products = await listFeaturedProducts(8);
  } catch (error) {
    unstable_rethrow(error);
    // The homepage should still render if the database is briefly unreachable.
    console.error("Could not load featured products", error);
  }
  if (products.length === 0) return null;

  return (
    <section className="bg-canvas py-14 sm:py-20">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="mb-8 flex items-end justify-between gap-5 sm:mb-11">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase text-muted">Picked from the stands</p>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Fans’ favorites</h2>
          </div>
          <Link className="inline-flex shrink-0 items-center gap-2 border-b border-ink pb-1 text-xs font-bold uppercase" href="/shop">
            View all <ArrowUpRight size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeFeatured() {
  return (
    <Suspense fallback={null}>
      <FeaturedProducts />
    </Suspense>
  );
}
