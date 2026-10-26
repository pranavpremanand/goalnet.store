"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LuFilter as Filter, LuSlidersHorizontal as SlidersHorizontal, LuX as X } from "react-icons/lu";
import { ProductCard } from "@/components/common/ProductCard";
import { featuredProducts } from "@/data/products";

const categories = ["National jerseys", "Club jerseys", "Retro classics", "Special editions"];
const priceBands = [
  { label: "Under ₹2,500", min: 0, max: 2500 },
  { label: "₹2,500 – ₹3,000", min: 2500, max: 3000 },
  { label: "Over ₹3,000", min: 3000, max: Infinity },
];
const colors = ["White", "Blue", "Red", "Yellow"];

export function ShopPage() {
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const query = searchQuery.toLowerCase();
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [priceBand, setPriceBand] = useState("");
  const [sort, setSort] = useState("featured");

  const products = useMemo(() => {
    let results = featuredProducts.filter((product) => {
      const matchesQuery = !query || `${product.name} ${product.category}`.toLowerCase().includes(query);
      const matchesCategory = !selectedCategories.length || selectedCategories.includes(product.category);
      const matchesColor = !selectedColors.length || selectedColors.includes(product.color);
      const range = priceBands.find((band) => band.label === priceBand);
      const matchesPrice = !range || (product.price >= range.min && product.price <= range.max);
      return matchesQuery && matchesCategory && matchesColor && matchesPrice;
    });
    if (sort === "low") results = [...results].sort((a, b) => a.price - b.price);
    if (sort === "high") results = [...results].sort((a, b) => b.price - a.price);
    if (sort === "rent") results = results.filter((product) => product.availableForRent);
    return results;
  }, [priceBand, query, selectedCategories, selectedColors, sort]);

  function toggleValue(value: string, current: string[], setter: (value: string[]) => void) {
    setter(current.includes(value) ? current.filter((item) => item !== value) : [...current, value]);
  }

  function clearFilters() {
    setSelectedCategories([]);
    setSelectedColors([]);
    setPriceBand("");
  }

  const filterContent = (
    <div className="space-y-7">
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase">Category</h2>
          <button className="text-[10px] uppercase text-muted" onClick={clearFilters} type="button">Clear</button>
        </div>
        <div className="space-y-2.5">
          {categories.map((category) => (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm" key={category}>
              <input checked={selectedCategories.includes(category)} className="size-4 accent-[#f2fa18]" onChange={() => toggleValue(category, selectedCategories, setSelectedCategories)} type="checkbox" />
              {category}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase">Price</h2>
        <div className="space-y-2.5">
          {priceBands.map((band) => (
            <label className="flex cursor-pointer items-center gap-2.5 text-sm" key={band.label}>
              <input checked={priceBand === band.label} className="size-4 accent-[#f2fa18]" name="price" onChange={() => setPriceBand(priceBand === band.label ? "" : band.label)} type="radio" />
              {band.label}
            </label>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-3 text-xs font-bold uppercase">Color</h2>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button aria-pressed={selectedColors.includes(color)} className={`border px-3 py-1.5 text-xs transition ${selectedColors.includes(color) ? "border-ink bg-ink text-white" : "border-line hover:border-ink"}`} key={color} onClick={() => toggleValue(color, selectedColors, setSelectedColors)} type="button">{color}</button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <main className="mx-auto max-w-[1440px] px-5 py-9 sm:px-8 lg:px-14 lg:py-14">
      <div className="flex items-end justify-between gap-5 border-b border-line pb-6">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted"><Link href="/">Home</Link> / Jerseys</p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">The collection</h1>
          <p className="mt-2 text-sm text-muted">For the colors you carry with you.</p>
        </div>
        <button className="inline-flex min-h-10 items-center gap-2 bg-brand px-4 text-sm font-bold uppercase lg:hidden" onClick={() => setFilterOpen(true)} type="button">
          <Filter size={16} /> Filters
        </button>
      </div>
      {query && <p className="mt-5 text-sm">Search results for <strong>“{searchQuery}”</strong></p>}
      <div className="mt-7 flex items-center justify-between gap-4">
        <p className="text-sm text-muted">{products.length} jerseys</p>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase">
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Sort by</span>
          <select className="bg-transparent text-sm font-medium normal-case outline-none" onChange={(event) => setSort(event.target.value)} value={sort}>
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
            <option value="rent">Available for rent</option>
          </select>
        </label>
      </div>
      <div className="mt-6 grid gap-8 lg:grid-cols-[210px_1fr]">
        <aside className="hidden border-r border-line pr-7 lg:block">{filterContent}</aside>
        <div>
          {products.length ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => <ProductCard key={product.id} product={product} />)}
            </div>
          ) : (
            <div className="grid min-h-72 place-items-center border border-dashed border-line p-8 text-center">
              <div><p className="font-display text-2xl font-semibold">No jerseys found</p><p className="mt-2 text-sm text-muted">Try adjusting your search or filters.</p><button className="mt-4 border-b border-ink pb-1 text-sm font-bold" onClick={clearFilters} type="button">Clear filters</button></div>
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