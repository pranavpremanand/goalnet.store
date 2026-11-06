"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LuFilter as Filter, LuSlidersHorizontal as SlidersHorizontal, LuX as X } from "react-icons/lu";
import { formatRupees } from "@/lib/format";
import { ProductCard } from "@/components/common/ProductCard";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import type { StoreCategory, StorePriceBand, StoreProduct } from "@/lib/types/storefront";

function ShopContent({
  products: allProducts,
  categories,
  priceBands,
  searchQuery,
  initialCategory,
}: {
  products: StoreProduct[];
  categories: StoreCategory[];
  priceBands: StorePriceBand[];
  searchQuery: string;
  initialCategory?: string;
}) {
  const query = searchQuery.toLowerCase();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [selectedPriceBand, setSelectedPriceBand] = useState<string | null>(null);
  const [sort, setSort] = useState("featured");
  const selectedPrice = priceBands.find((band) => `${band.minPrice}-${band.maxPrice}` === selectedPriceBand);

  const products = useMemo(() => {
    let results = allProducts.filter((product) => {
      const searchable = `${product.name} ${product.category.name} ${product.brand} ${product.teamName}`.toLowerCase();
      const matchesQuery = !query || searchable.includes(query);
      const matchesCategory = !selectedCategories.length || selectedCategories.includes(product.category.slug);
      const matchesPrice = !selectedPrice || (product.price >= selectedPrice.minPrice && product.price <= selectedPrice.maxPrice);
      return matchesQuery && matchesCategory && matchesPrice;
    });
    if (sort === "low") results = [...results].sort((a, b) => a.price - b.price);
    if (sort === "high") results = [...results].sort((a, b) => b.price - a.price);
    return results;
  }, [allProducts, query, selectedCategories, selectedPrice, sort]);

  function toggleValue<T extends string>(value: T, current: T[], setter: (value: T[]) => void) {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function clearFilters() {
    setSelectedCategories([]);
    setSelectedPriceBand(null);
  }

  const filterContent = (
    <div className="space-y-7">
      {categories.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase">Category</h2>
            <button className="text-[10px] uppercase text-muted" onClick={clearFilters} type="button">Clear</button>
          </div>
          <div className="space-y-2.5">
            {categories.map((category) => (
              <label className="flex cursor-pointer items-center gap-2.5 text-sm" key={category.id}>
                <input checked={selectedCategories.includes(category.slug)} className="size-4 accent-[#f2fa18]" onChange={() => toggleValue(category.slug, selectedCategories, setSelectedCategories)} type="checkbox" />
                {category.name}
              </label>
            ))}
          </div>
        </div>
      )}
      {priceBands.length > 0 && (
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-xs font-bold uppercase">Price</h2>
            {selectedPriceBand && <button className="text-[10px] uppercase text-muted" onClick={() => setSelectedPriceBand(null)} type="button">Clear</button>}
          </div>
          <div className="space-y-2.5">
            {priceBands.map((band) => {
              const value = `${band.minPrice}-${band.maxPrice}`;
              const isSelected = selectedPriceBand === value;
              return (
                <label className={`flex cursor-pointer items-center gap-2.5 rounded px-1 py-1 text-sm ${isSelected ? "bg-brand/20 font-semibold" : ""}`} key={value}>
                  <input
                    checked={isSelected}
                    className="peer sr-only"
                    name="price"
                    onChange={() => setSelectedPriceBand(value)}
                    type="radio"
                  />
                  <span
                    aria-hidden="true"
                    className={`grid size-5 shrink-0 place-items-center rounded-full border ${isSelected ? "border-ink" : "border-muted"} peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ink`}
                  >
                    {isSelected && <span className="size-2.5 rounded-full bg-ink" />}
                  </span>
                  {formatRupees(band.minPrice)} – {formatRupees(band.maxPrice)}
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-9 sm:px-8 lg:px-14 lg:py-14">
      <div className="flex items-end justify-between gap-5 border-b border-line pb-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted"><Link href="/">Home</Link> / Shop</p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">The collection</h1>
          <p className="mt-2 text-sm text-muted">For the colors you carry with you.</p>
        </div>
        <button className="inline-flex min-h-10 items-center gap-2 bg-brand px-4 text-sm font-bold uppercase lg:hidden" onClick={() => setFilterOpen(true)} type="button">
          <Filter size={16} /> Filters
        </button>
      </div>
      {query && <p className="mt-5 text-sm">Search results for <strong>“{searchQuery}”</strong></p>}
      <div className="mt-7 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">{products.length} {products.length === 1 ? "product" : "products"}</p>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase">
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Sort by</span>
          <select className="bg-transparent text-sm font-medium normal-case outline-none" onChange={(event) => setSort(event.target.value)} value={sort}>
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[210px_1fr]">
        <aside className="hidden border-r border-line pr-7 lg:block">{filterContent}</aside>
        <div>
          {products.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ScrollReveal className="min-w-0" key={product.id} variant="scale">
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>
          ) : (
            <div className="grid min-h-72 place-items-center border border-dashed border-line p-8 text-center">
              <div>
                <p className="font-display text-2xl font-semibold">{allProducts.length === 0 ? "New products are on the way" : "No products found"}</p>
                <p className="mt-2 text-sm text-muted">{allProducts.length === 0 ? "Check back soon." : "Try adjusting your search or filters."}</p>
                {allProducts.length > 0 && <button className="mt-4 border-b border-ink pb-1 text-sm font-bold" onClick={clearFilters} type="button">Clear filters</button>}
              </div>
            </div>
          )}
        </div>
      </div>
      {filterOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 lg:hidden" onClick={() => setFilterOpen(false)}>
          <section aria-label="Product filters" aria-modal="true" className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto bg-paper p-6" onClick={(event) => event.stopPropagation()} role="dialog">
            <div className="mb-6 flex items-center justify-between border-b border-line pb-4"><h2 className="font-display text-2xl font-semibold">Filters</h2><button aria-label="Close filters" onClick={() => setFilterOpen(false)} type="button"><X size={22} /></button></div>
            {filterContent}
            <button className="mt-7 w-full bg-brand py-3 text-sm font-bold uppercase" onClick={() => setFilterOpen(false)} type="button">Show {products.length} results</button>
          </section>
        </div>
      )}
    </main>
  );
}

export function ShopPage({ products, categories, priceBands }: { products: StoreProduct[]; categories: StoreCategory[]; priceBands: StorePriceBand[] }) {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category");
  const initialCategory = categories.find((category) => category.slug === categoryParam)?.slug;
  const searchQuery = searchParams.get("q") ?? "";

  return (
    <ShopContent
      categories={categories}
      initialCategory={initialCategory}
      key={searchParams.toString()}
      priceBands={priceBands}
      products={products}
      searchQuery={searchQuery}
    />
  );
}
