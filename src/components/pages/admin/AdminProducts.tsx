"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuCheck as Check, LuChevronDown as ChevronDown, LuChevronUp as ChevronUp, LuGripVertical as GripVertical, LuPencil as Pencil, LuPlus as Plus, LuTrash2 as Trash2 } from "react-icons/lu";
import { ApiError } from "@/lib/api-client";
import { PRODUCT_TYPE_LABELS } from "@/lib/catalog-constants";
import { productApi } from "@/lib/admin-api";
import type { CategoryDto, ProductDto, ProductListResult } from "@/lib/types/catalog";
import { formatRupees } from "@/lib/format";
import { adminInputClass } from "@/components/pages/admin/FormFields";
import { LoadingSpinner } from "@/components/common/Loading";
import { moveItem } from "@/lib/reorder";
import { SortableTable, SortableTableRow } from "@/components/pages/admin/SortableTable";

type Filters = { q: string; category: string; status: string };

function pageHref(filters: Filters, page: number) {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.status !== "all") params.set("status", filters.status);
  if (page > 1) params.set("page", String(page));
  const query = params.toString();
  return `/admin/products${query ? `?${query}` : ""}`;
}

export function AdminProducts({ result, categories, filters }: { result: ProductListResult; categories: CategoryDto[]; filters: Filters }) {
  const router = useRouter();
  const [toDelete, setToDelete] = useState<ProductDto | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [orderedProducts, setOrderedProducts] = useState<ProductDto[] | null>(null);
  const [reordering, setReordering] = useState(false);
  const totalPages = Math.max(1, Math.ceil(result.total / result.limit));
  const displayedProducts = orderedProducts ?? result.items;
  const canReorder =
    !filters.q &&
    !filters.category &&
    filters.status === "all" &&
    result.page === 1 &&
    result.total === result.items.length;

  async function saveProductOrder(ids: string[]) {
    if (reordering) return;
    const productsById = new Map(displayedProducts.map((product) => [product.id, product]));
    const reordered = ids.flatMap((id) => {
      const product = productsById.get(id);
      return product ? [product] : [];
    });
    if (reordered.length !== displayedProducts.length) return;

    setOrderedProducts(reordered.map((product, displayOrder) => ({ ...product, displayOrder })));
    setReordering(true);
    setError("");
    setNotice("");
    try {
      await productApi.reorder(reordered.map((product) => product.id));
      setNotice("Product order updated.");
    } catch (failure) {
      setOrderedProducts(null);
      setError(failure instanceof ApiError ? failure.message : "Could not save the new product order.");
      router.refresh();
    } finally {
      setReordering(false);
    }
  }

  function reorderProduct(fromId: string, toId: string) {
    const reordered = moveItem(displayedProducts, fromId, toId);
    if (reordered !== displayedProducts)
      void saveProductOrder(reordered.map((product) => product.id));
  }

  function moveProductBy(productId: string, offset: number) {
    const index = displayedProducts.findIndex((product) => product.id === productId);
    const target = displayedProducts[index + offset];
    if (target) reorderProduct(productId, target.id);
  }

  async function confirmDelete(product: ProductDto) {
    setDeleting(true);
    setError("");
    try {
      await productApi.remove(product.id);
      setOrderedProducts(null);
      setToDelete(null);
      setNotice("Product deleted.");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : "Something went wrong. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase text-muted">Catalog</p><h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Products</h1><p className="mt-2 text-sm text-muted">{result.total} {result.total === 1 ? "product" : "products"}</p></div>
        <Link className="inline-flex min-h-11 items-center gap-2 bg-brand px-5 text-xs font-bold uppercase" href="/admin/product/new"><Plus size={15} /> Add product</Link>
      </div>
      {notice && <p aria-live="polite" className="mt-5 flex items-center gap-2 bg-canvas p-3 text-sm"><Check size={15} />{notice}</p>}
      {error && !toDelete && <p className="mt-5 border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}

      <form action="/admin/products" className="mt-6 grid gap-3 border border-line p-4 sm:grid-cols-[1fr_200px_160px_auto] sm:items-end" method="get">
        <label className="text-xs font-semibold">Search<input aria-label="Search products" className={adminInputClass} defaultValue={filters.q} name="q" placeholder="Name, slug, brand or team" /></label>
        <label className="text-xs font-semibold">Category<select className={adminInputClass} defaultValue={filters.category} name="category"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className="text-xs font-semibold">Status<select className={adminInputClass} defaultValue={filters.status} name="status"><option value="all">All</option><option value="active">Active</option><option value="inactive">Inactive</option></select></label>
        <button className="min-h-11 border border-ink px-5 text-xs font-bold uppercase hover:bg-canvas" type="submit">Filter</button>
      </form>

      {result.items.length === 0 ? (
        <p className="mt-6 border border-dashed border-line p-8 text-center text-sm text-muted">{result.total === 0 && !filters.q && !filters.category && filters.status === "all" ? "No products yet. Add your first product." : "No products match these filters."}</p>
      ) : (
        <>
          {canReorder && <p className="mt-5 text-xs text-muted">Drag products or use the arrows to change their order. New products appear first.</p>}
          {!canReorder && result.total > result.items.length && result.page === 1 && <p className="mt-5 text-xs text-muted">Product reordering is available when the full, unfiltered catalog fits on one page.</p>}
          <SortableTable
            disabled={!canReorder || reordering}
            items={displayedProducts.map((product) => product.id)}
            onReorder={(ids) => void saveProductOrder(ids)}
          >
            <div className="mt-3 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain border border-line">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead className="bg-canvas text-[10px] font-bold uppercase text-muted"><tr><th className="px-2 py-3">Order</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Sizes</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                <tbody>
                  {displayedProducts.map((product, index) => (
                    <SortableTableRow className="border-t border-line" disabled={!canReorder || reordering} id={product.id} key={product.id}>
                      {({ attributes, listeners, setActivatorNodeRef }) => <>
                        <td className="px-2 py-3">
                          <div className="flex items-center gap-1">
                            <button {...attributes} {...listeners} aria-label={`Drag to reorder ${product.name}`} className="grid size-9 place-items-center border border-line disabled:opacity-40" disabled={!canReorder || reordering} ref={setActivatorNodeRef} style={{ touchAction: "none" }} type="button"><GripVertical size={17} /></button>
                            <div className="flex flex-col">
                              <button aria-label={`Move ${product.name} up`} className="p-1 text-muted disabled:opacity-30" disabled={!canReorder || reordering || index === 0} onClick={() => moveProductBy(product.id, -1)} onPointerDown={(event) => event.stopPropagation()} type="button"><ChevronUp size={14} /></button>
                              <button aria-label={`Move ${product.name} down`} className="p-1 text-muted disabled:opacity-30" disabled={!canReorder || reordering || index === displayedProducts.length - 1} onClick={() => moveProductBy(product.id, 1)} onPointerDown={(event) => event.stopPropagation()} type="button"><ChevronDown size={14} /></button>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative aspect-4/5 w-10 shrink-0 overflow-hidden bg-canvas">{product.images[0] && <Image alt={product.images[0].alt || product.name} className="object-cover" fill sizes="40px" src={product.images[0].url} />}</div><div><p className="font-semibold">{product.name}</p><p className="text-xs text-muted">{PRODUCT_TYPE_LABELS[product.productType]} · {product.slug}</p></div></div></td>
                        <td className="px-4 py-3">{product.categories.map((category) => category.name).join(", ")}</td>
                        <td className="px-4 py-3">{formatRupees(product.price)}</td>
                        <td className="px-4 py-3 text-muted">{product.variants.map((variant) => variant.size).join(", ")}</td>
                        <td className="px-4 py-3"><span className={`px-2 py-1 text-[10px] font-bold uppercase ${product.isActive ? "bg-brand" : "bg-canvas text-muted"}`}>{product.isActive ? "Active" : "Inactive"}</span>{product.isFeatured && <span className="ml-1 bg-ink px-2 py-1 text-[10px] font-bold uppercase text-white">Featured</span>}</td>
                        <td className="px-4 py-3"><div className="flex justify-end gap-2"><Link aria-label={`Edit ${product.name}`} className="grid size-9 place-items-center border border-line" href={`/admin/product/${product.id}`}><Pencil size={15} /></Link><button aria-label={`Delete ${product.name}`} className="grid size-9 place-items-center border border-line text-red-700" onClick={() => { setError(""); setNotice(""); setToDelete(product); }} type="button"><Trash2 size={15} /></button></div></td>
                      </>}
                    </SortableTableRow>
                  ))}
                </tbody>
              </table>
            </div>
          </SortableTable>
          {reordering && <p aria-live="polite" className="mt-3"><LoadingSpinner label="Saving product order…" /></p>}
        </>
      )}

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="mt-5 flex items-center justify-between text-xs font-bold uppercase">
          {result.page > 1 ? <Link className="underline" href={pageHref(filters, result.page - 1)}>Previous</Link> : <span />}
          <span className="text-muted">Page {result.page} of {totalPages}</span>
          {result.page < totalPages ? <Link className="underline" href={pageHref(filters, result.page + 1)}>Next</Link> : <span />}
        </nav>
      )}

      {toDelete && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <section aria-modal="true" className="w-full max-w-sm bg-paper p-6" role="dialog">
            <p className="text-xs font-bold uppercase text-muted">Please confirm</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Delete this product?</h2>
            <p className="mt-2 text-sm text-muted">“{toDelete.name}” and its images will be removed. This cannot be undone.</p>
            {error && <p className="mt-3 border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
            <div className="mt-5 flex gap-3"><button aria-busy={deleting} className="inline-flex min-h-11 items-center justify-center bg-red-700 px-5 text-xs font-bold uppercase text-white disabled:opacity-60" disabled={deleting} onClick={() => void confirmDelete(toDelete)} type="button">{deleting ? <LoadingSpinner label="Deleting…" /> : "Delete"}</button><button className="min-h-11 border border-line px-5 text-xs font-bold uppercase" onClick={() => setToDelete(null)} type="button">Cancel</button></div>
          </section>
        </div>
      )}
    </div>
  );
}
