"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { LuFilter as Filter, LuSlidersHorizontal as SlidersHorizontal, LuX as X } from "react-icons/lu";
import { formatRupees } from "@/lib/format";
import { ProductCard } from "@/components/common/ProductCard";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { LoadingSpinner, SkeletonBlock } from "@/components/common/Loading";
import { apiRequest } from "@/lib/api-client";
import type { StoreCategory, StorePriceBand, StoreProductPage } from "@/lib/types/storefront";

type ShopSort = "featured" | "low" | "high";

function getProductPageUrl(
  page: number,
  filters: { query: string; categories: string[]; minPrice?: number; maxPrice?: number; sort: ShopSort },
) {
  const params = new URLSearchParams({ page: String(page), sort: filters.sort });
  if (filters.query) params.set("q", filters.query);
  for (const category of filters.categories) params.append("category", category);
  if (filters.minPrice !== undefined) params.set("minPrice", String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set("maxPrice", String(filters.maxPrice));
  return `/api/storefront/products?${params}`;
}

function ShopContent({
  initialPage,
  categories,
  priceBands,
  searchQuery,
  initialCategories,
}: {
  initialPage: StoreProductPage;
  categories: StoreCategory[];
  priceBands: StorePriceBand[];
  searchQuery: string;
  initialCategories: string[];
}) {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(initialCategories);
  const [selectedPriceBand, setSelectedPriceBand] = useState<string | null>(null);
  const [sort, setSort] = useState<ShopSort>("featured");
  const [products, setProducts] = useState(initialPage.items);
  const [total, setTotal] = useState(initialPage.total);
  const [nextPage, setNextPage] = useState(initialPage.page + 1);
  const [hasMore, setHasMore] = useState(initialPage.hasMore);
  const [loadingPage, setLoadingPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retryToken, setRetryToken] = useState(0);
  const [mobileToolbarHidden, setMobileToolbarHidden] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const loadingMoreRef = useRef(false);
  const canLoadAtSentinelRef = useRef(true);
  const activeRequestRef = useRef<AbortController | null>(null);
  const skippedInitialRequestRef = useRef(false);
  const selectedPrice = priceBands.find((band) => `${band.minPrice}-${band.maxPrice}` === selectedPriceBand);
  const filters = useMemo(() => ({
    query: searchQuery.trim(),
    categories: [...selectedCategories].sort(),
    minPrice: selectedPrice?.minPrice,
    maxPrice: selectedPrice?.maxPrice,
    sort,
  }), [searchQuery, selectedCategories, selectedPrice, sort]);
  const filterKey = JSON.stringify(filters);
  const initialFilterKey = useMemo(() => JSON.stringify({
    query: searchQuery.trim(),
    categories: [...initialCategories].sort(),
    sort: "featured",
  }), [initialCategories, searchQuery]);

  useEffect(() => {
    let previousScrollY = window.scrollY;
    let toolbarDocumentTop = toolbarRef.current
      ? toolbarRef.current.getBoundingClientRect().top + window.scrollY
      : 0;

    function updateToolbarVisibility() {
      const currentScrollY = window.scrollY;
      if (window.innerWidth >= 1024) {
        setMobileToolbarHidden(false);
      } else if (currentScrollY <= toolbarDocumentTop - 72) {
        setMobileToolbarHidden(false);
      } else if (Math.abs(currentScrollY - previousScrollY) > 3) {
        setMobileToolbarHidden(currentScrollY > previousScrollY);
      }
      previousScrollY = currentScrollY;
    }

    function updateToolbarPosition() {
      if (!toolbarRef.current) return;
      toolbarDocumentTop = toolbarRef.current.getBoundingClientRect().top + window.scrollY;
      updateToolbarVisibility();
    }

    window.addEventListener("scroll", updateToolbarVisibility, { passive: true });
    window.addEventListener("resize", updateToolbarPosition);
    updateToolbarVisibility();

    return () => {
      window.removeEventListener("scroll", updateToolbarVisibility);
      window.removeEventListener("resize", updateToolbarPosition);
    };
  }, []);

  useEffect(() => () => activeRequestRef.current?.abort(), []);

  useEffect(() => {
    if (!skippedInitialRequestRef.current && filterKey === initialFilterKey && retryToken === 0) {
      skippedInitialRequestRef.current = true;
      return;
    }
    skippedInitialRequestRef.current = true;

    activeRequestRef.current?.abort();
    loadingMoreRef.current = false;
    canLoadAtSentinelRef.current = true;
    const controller = new AbortController();
    activeRequestRef.current = controller;
    setProducts([]);
    setTotal(0);
    setNextPage(1);
    setHasMore(false);
    setLoadingMore(false);
    setLoadingPage(true);
    setLoadError("");

    void apiRequest<StoreProductPage>(getProductPageUrl(1, filters), { signal: controller.signal })
      .then((result) => {
        setProducts(result.items);
        setTotal(result.total);
        setNextPage(result.page + 1);
        setHasMore(result.hasMore);
      })
      .catch((error: unknown) => {
        if (!controller.signal.aborted) {
          setLoadError(error instanceof Error ? error.message : "Products could not be loaded. Please try again.");
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoadingPage(false);
          activeRequestRef.current = null;
        }
      });

    return () => {
      controller.abort();
      if (activeRequestRef.current === controller) activeRequestRef.current = null;
    };
  }, [filterKey, filters, initialFilterKey, retryToken]);

  const loadNextPage = useCallback(async () => {
    if (!hasMore || loadingMoreRef.current || loadingPage) return;
    loadingMoreRef.current = true;
    setLoadingMore(true);
    setLoadError("");
    const controller = new AbortController();
    activeRequestRef.current = controller;

    try {
      const result = await apiRequest<StoreProductPage>(
        getProductPageUrl(nextPage, filters),
        { signal: controller.signal },
      );
      if (!controller.signal.aborted) {
        setProducts((current) => {
          const currentIds = new Set(current.map((product) => product.id));
          return [...current, ...result.items.filter((product) => !currentIds.has(product.id))];
        });
        setTotal(result.total);
        setNextPage(result.page + 1);
        setHasMore(result.hasMore);
      }
    } catch (error) {
      if (!controller.signal.aborted) {
        setLoadError(error instanceof Error ? error.message : "More products could not be loaded. Please try again.");
      }
    } finally {
      if (!controller.signal.aborted) {
        loadingMoreRef.current = false;
        setLoadingMore(false);
        activeRequestRef.current = null;
      }
    }
  }, [filters, hasMore, loadingPage, nextPage]);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore || loadingPage || loadError) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          canLoadAtSentinelRef.current = true;
        } else if (canLoadAtSentinelRef.current) {
          canLoadAtSentinelRef.current = false;
          void loadNextPage();
        }
      },
      { rootMargin: "700px 0px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadError, loadNextPage, loadingPage]);

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
    <main className="mx-auto max-w-[1440px] py-9 lg:py-14">
      <div className="px-5 flex items-end justify-between gap-5">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase text-muted"><Link href="/">Home</Link> / Shop</p>
          <h1 className="font-display text-4xl font-semibold sm:text-5xl">The collection</h1>
          <p className="mt-2 text-sm text-muted">For the colors you carry with you.</p>
        </div>
      </div>
      {searchQuery.trim() && <p className="mt-5 text-sm">Search results for <strong>“{searchQuery}”</strong></p>}
      <div
        className={`sticky top-[72px] px-5 sm:px-8 lg:px-14 z-30 mt-7 flex items-center justify-between gap-3 border-y border-line bg-paper/95 py-3 backdrop-blur transition-transform duration-200 lg:top-[72px] lg:z-20 lg:mt-5 lg:translate-y-0 ${mobileToolbarHidden ? "-translate-y-[calc(100%+72px)] lg:translate-y-0" : "translate-y-0"}`}
        ref={toolbarRef}
      >
        <button className="inline-flex min-h-10 shrink-0 items-center gap-2 bg-brand px-3 text-xs font-bold uppercase lg:hidden" onClick={() => setFilterOpen(true)} type="button">
          <Filter size={16} /> Filters
        </button>
        <p aria-live="polite" className="hidden text-sm text-muted lg:block">
          {loadingPage ? "Updating products…" : `Showing ${products.length} of ${total} products`}
        </p>
        <label className="flex items-center gap-2 text-xs font-semibold uppercase">
          <SlidersHorizontal size={15} />
          <span className="hidden sm:inline">Sort by</span>
          <select className="bg-transparent text-sm font-medium normal-case outline-none" onChange={(event) => {
            const value = event.target.value;
            if (value === "featured" || value === "low" || value === "high") setSort(value);
          }} value={sort}>
            <option value="featured">Featured</option>
            <option value="low">Price: low to high</option>
            <option value="high">Price: high to low</option>
          </select>
        </label>
      </div>
      <div className="px-5 sm:px-8 lg:px-14 mt-6 grid gap-8 lg:grid-cols-[210px_1fr]">
        <aside className="hidden self-start border-r border-line pr-7 lg:sticky lg:top-[132px] lg:block lg:max-h-[calc(100svh-148px)] lg:overflow-y-auto">{filterContent}</aside>
        <div>
          {loadingPage && products.length === 0 ? (
            <div aria-label="Loading products" className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4" role="status">
              {Array.from({ length: 8 }, (_, index) => (
                <div className="space-y-3" key={index}>
                  <SkeletonBlock className="aspect-4/5" />
                  <SkeletonBlock className="h-4 w-4/5" />
                  <SkeletonBlock className="h-4 w-1/3" />
                </div>
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ScrollReveal className="min-w-0" key={product.id} variant="scale">
                  <ProductCard product={product} />
                </ScrollReveal>
              ))}
            </div>
          ) : loadError ? (
            <div className="grid min-h-72 place-items-center border border-dashed border-line p-8 text-center">
              <div>
                <p className="font-display text-2xl font-semibold">Products could not be loaded</p>
                <p className="mt-2 text-sm text-muted">{loadError}</p>
                <button className="mt-4 border-b border-ink pb-1 text-sm font-bold" onClick={() => setRetryToken((current) => current + 1)} type="button">Try again</button>
              </div>
            </div>
          ) : (
            <div className="grid min-h-72 place-items-center border border-dashed border-line p-8 text-center">
              <div>
                <p className="font-display text-2xl font-semibold">No products found</p>
                <p className="mt-2 text-sm text-muted">Try adjusting your search or filters.</p>
                <button className="mt-4 border-b border-ink pb-1 text-sm font-bold" onClick={clearFilters} type="button">Clear filters</button>
              </div>
            </div>
          )}
          {products.length > 0 && <div aria-hidden="true" className="h-px" ref={sentinelRef} />}
          {loadingMore && <div className="flex justify-center py-8"><LoadingSpinner label="Loading more products…" /></div>}
          {loadError && products.length > 0 && (
            <div className="flex flex-col items-center gap-2 py-6 text-center">
              <p className="text-sm text-red-700">{loadError}</p>
              <button className="border-b border-ink pb-1 text-sm font-bold" onClick={() => void loadNextPage()} type="button">Try loading again</button>
            </div>
          )}
        </div>
      </div>
      {filterOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 lg:hidden" onClick={() => setFilterOpen(false)}>
          <section aria-label="Product filters" aria-modal="true" className="absolute bottom-0 left-0 right-0 max-h-[88vh] overflow-y-auto bg-paper p-6" onClick={(event) => event.stopPropagation()} role="dialog">
            <div className="mb-6 flex items-center justify-between border-b border-line pb-4"><h2 className="font-display text-2xl font-semibold">Filters</h2><button aria-label="Close filters" onClick={() => setFilterOpen(false)} type="button"><X size={22} /></button></div>
            {filterContent}
            <button className="mt-7 w-full bg-brand py-3 text-sm font-bold uppercase" onClick={() => setFilterOpen(false)} type="button">Show {total} results</button>
          </section>
        </div>
      )}
    </main>
  );
}

export function ShopPage({
  initialPage,
  categories,
  priceBands,
  searchQuery,
  initialCategories,
}: {
  initialPage: StoreProductPage;
  categories: StoreCategory[];
  priceBands: StorePriceBand[];
  searchQuery: string;
  initialCategories: string[];
}) {
  return (
    <ShopContent
      categories={categories}
      initialCategories={initialCategories}
      priceBands={priceBands}
      initialPage={initialPage}
      searchQuery={searchQuery}
    />
  );
}
