"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuPencil as Pencil, LuPlus as Plus, LuTrash2 as Trash2 } from "react-icons/lu";
import { LoadingSpinner } from "@/components/common/Loading";
import { adminInputClass } from "@/components/pages/admin/FormFields";
import { ApiError } from "@/lib/api-client";
import { offerApi } from "@/lib/admin-api";
import { formatRupees } from "@/lib/format";
import type { CategoryDto, ProductDto } from "@/lib/types/catalog";
import type { OfferDto, OfferInput } from "@/lib/types/offers";
import { offerInputSchema, type OfferInput as OfferPayload } from "@/lib/validation/offers";

type Props = { offers: OfferDto[]; categories: CategoryDto[]; products: ProductDto[] };
type FormState = Omit<OfferInput, "startDate" | "endDate" | "slug"> & { slug: string; startDate: string; endDate: string };

function localDateTime(value: string) {
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
}

function defaultForm(): FormState {
  const now = new Date();
  const end = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return {
    name: "",
    slug: "",
    discountType: "flat",
    discountValue: 25,
    appliesTo: "all",
    categoryIds: [],
    productIds: [],
    startDate: localDateTime(now.toISOString()),
    endDate: localDateTime(end.toISOString()),
    isActive: true,
  };
}

function toForm(offer: OfferDto): FormState {
  return {
    name: offer.name,
    slug: offer.slug,
    discountType: offer.discountType,
    discountValue: offer.discountValue,
    appliesTo: offer.appliesTo,
    categoryIds: offer.categoryIds,
    productIds: offer.productIds,
    startDate: localDateTime(offer.startDate),
    endDate: localDateTime(offer.endDate),
    isActive: offer.isActive,
  };
}

function offerState(offer: OfferDto, now: number) {
  if (!offer.isActive) return "Paused";
  if (new Date(offer.startDate).getTime() > now) return "Scheduled";
  if (new Date(offer.endDate).getTime() < now) return "Expired";
  return "Active";
}

function inputPayload(form: FormState): OfferPayload | null {
  const startDate = new Date(form.startDate);
  const endDate = new Date(form.endDate);
  if (!Number.isFinite(startDate.getTime()) || !Number.isFinite(endDate.getTime())) return null;
  const result = offerInputSchema.safeParse({
    ...form,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
  });
  return result.success ? result.data : null;
}

export function AdminOffers({ offers, categories, products }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<OfferDto | null>(null);
  const [form, setForm] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [now] = useState(() => Date.now());
  const eligibleCount = form?.appliesTo === "all"
    ? products.length
    : form?.appliesTo === "categories"
      ? products.filter((product) => product.categories.some((category) => form.categoryIds.includes(category.id))).length
      : form?.productIds.length ?? 0;
  const previewOriginal = 419;
  const previewDiscount = form
    ? Math.min(previewOriginal, Math.round((form.discountType === "flat" ? form.discountValue : previewOriginal * form.discountValue / 100) * 100) / 100)
    : 0;

  function beginCreate() {
    setEditing(null);
    setForm(defaultForm());
    setError("");
    setNotice("");
  }

  function beginEdit(offer: OfferDto) {
    setEditing(offer);
    setForm(toForm(offer));
    setError("");
    setNotice("");
  }

  function closeForm() {
    if (!saving) {
      setForm(null);
      setEditing(null);
    }
  }

  function updateForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => current ? { ...current, [key]: value } : current);
  }

  function toggleId(key: "categoryIds" | "productIds", id: string) {
    setForm((current) => current ? {
      ...current,
      [key]: current[key].includes(id)
        ? current[key].filter((value) => value !== id)
        : [...current[key], id],
    } : current);
  }

  async function saveOffer() {
    if (!form) return;
    const payload = inputPayload(form);
    if (!payload) {
      const result = offerInputSchema.safeParse({
        ...form,
        startDate: Number.isFinite(new Date(form.startDate).getTime()) ? new Date(form.startDate).toISOString() : "",
        endDate: Number.isFinite(new Date(form.endDate).getTime()) ? new Date(form.endDate).toISOString() : "",
      });
      setError(result.success ? "Please review your offer details." : result.error.issues[0]?.message ?? "Please review your offer details.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      if (editing) await offerApi.update(editing.id, payload);
      else await offerApi.create(payload);
      setForm(null);
      setEditing(null);
      setNotice(editing ? "Offer updated." : "Offer created.");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : "The offer could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  async function deleteOffer(offer: OfferDto) {
    setDeleting(offer.id);
    setError("");
    try {
      await offerApi.remove(offer.id);
      setNotice("Offer deleted.");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : "The offer could not be deleted.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted">Promotions</p>
          <h1 className="mt-2 font-display text-3xl font-semibold sm:text-4xl">Offers &amp; Discounts</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted">Create time-limited offers without changing your product prices.</p>
        </div>
        <button className="inline-flex min-h-11 items-center gap-2 bg-ink px-5 text-xs font-bold uppercase text-white hover:bg-brand hover:text-ink" onClick={beginCreate} type="button">
          <Plus size={16} /> Create New Offer
        </button>
      </header>

      {notice && <p className="mt-5 border-l-4 border-green-700 bg-green-50 p-3 text-sm text-green-900" role="status">{notice}</p>}
      {error && !form && <p className="mt-5 border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}

      {form && (
        <section className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1.4fr)_minmax(300px,.8fr)]">
          <div className="border border-line bg-paper p-5 sm:p-7">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted">{editing ? "Edit offer" : "New promotion"}</p>
                <h2 className="mt-2 font-display text-2xl font-semibold">Offer details</h2>
              </div>
              <button aria-label="Close offer form" className="px-2 py-1 text-muted hover:text-ink" onClick={closeForm} type="button">✕</button>
            </div>
            <div className="mt-6 grid gap-5">
              <label className="text-sm font-semibold">Offer Name
                <input className={adminInputClass} maxLength={120} onChange={(event) => updateForm("name", event.target.value)} placeholder="Diwali Special Offer" value={form.name} />
              </label>

              <fieldset>
                <legend className="text-sm font-semibold">Discount Type</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {(["flat", "percentage"] as const).map((type) => (
                    <label className={`flex min-h-12 cursor-pointer items-center gap-3 border p-3 text-sm ${form.discountType === type ? "border-ink bg-brand/20" : "border-line"}`} key={type}>
                      <input checked={form.discountType === type} name="discountType" onChange={() => updateForm("discountType", type)} type="radio" />
                      {type === "flat" ? "Flat Amount (₹)" : "Percentage (%)"}
                    </label>
                  ))}
                </div>
              </fieldset>

              <label className="text-sm font-semibold">Discount Value
                <input className={adminInputClass} max={form.discountType === "percentage" ? 100 : 1_000_000} min={0.01} onChange={(event) => updateForm("discountValue", Number(event.target.value))} step="0.01" type="number" value={form.discountValue} />
              </label>

              <fieldset>
                <legend className="text-sm font-semibold">Apply Offer To</legend>
                <div className="mt-2 grid gap-2 sm:grid-cols-3">
                  {([
                    ["all", "All Products"],
                    ["categories", "Collections / Categories"],
                    ["products", "Selected Products"],
                  ] as const).map(([value, label]) => (
                    <label className={`flex min-h-12 cursor-pointer items-center gap-2 border p-3 text-xs font-medium ${form.appliesTo === value ? "border-ink bg-brand/20" : "border-line"}`} key={value}>
                      <input checked={form.appliesTo === value} name="appliesTo" onChange={() => updateForm("appliesTo", value)} type="radio" />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>

              {form.appliesTo === "categories" && (
                <fieldset className="max-h-56 overflow-y-auto border border-line p-3">
                  <legend className="px-1 text-xs font-semibold">Select collections / categories</legend>
                  {categories.map((category) => (
                    <label className="flex cursor-pointer items-center gap-2 py-2 text-sm" key={category.id}>
                      <input checked={form.categoryIds.includes(category.id)} onChange={() => toggleId("categoryIds", category.id)} type="checkbox" />
                      {category.name}{!category.isActive && <span className="text-xs text-muted">(inactive)</span>}
                    </label>
                  ))}
                  {categories.length === 0 && <p className="py-2 text-sm text-muted">No categories available.</p>}
                </fieldset>
              )}

              {form.appliesTo === "products" && (
                <fieldset className="max-h-64 overflow-y-auto border border-line p-3">
                  <legend className="px-1 text-xs font-semibold">Select products</legend>
                  {products.map((product) => (
                    <label className="flex cursor-pointer items-center gap-2 border-b border-line/60 py-2 text-sm last:border-0" key={product.id}>
                      <input checked={form.productIds.includes(product.id)} onChange={() => toggleId("productIds", product.id)} type="checkbox" />
                      <span className="min-w-0 flex-1 truncate">{product.name}</span>
                      <span className="text-xs text-muted">{formatRupees(product.price)}</span>
                    </label>
                  ))}
                  {products.length === 0 && <p className="py-2 text-sm text-muted">No active products available.</p>}
                </fieldset>
              )}

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-sm font-semibold">Offer Start Date
                  <input className={adminInputClass} onChange={(event) => updateForm("startDate", event.target.value)} required type="datetime-local" value={form.startDate} />
                </label>
                <label className="text-sm font-semibold">Offer End Date
                  <input className={adminInputClass} onChange={(event) => updateForm("endDate", event.target.value)} required type="datetime-local" value={form.endDate} />
                </label>
              </div>
              <label className="flex cursor-pointer items-center gap-3 text-sm font-semibold">
                <input checked={form.isActive} onChange={(event) => updateForm("isActive", event.target.checked)} type="checkbox" />
                Offer Status — Active
              </label>
            </div>
            {error && <p className="mt-4 border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
            <div className="mt-6 flex flex-wrap gap-3">
              <button aria-busy={saving} className="inline-flex min-h-11 items-center justify-center bg-ink px-5 text-xs font-bold uppercase text-white disabled:opacity-60" disabled={saving} onClick={() => void saveOffer()} type="button">
                {saving ? <LoadingSpinner label="Saving…" /> : editing ? "Save Changes" : "Create Offer"}
              </button>
              <button className="min-h-11 border border-line px-5 text-xs font-bold uppercase" disabled={saving} onClick={closeForm} type="button">Cancel</button>
            </div>
          </div>

          <aside className="h-fit border border-line bg-canvas p-5 sm:p-7">
            <p className="text-xs font-bold uppercase tracking-[0.15em] text-muted">Admin preview</p>
            <h2 className="mt-4 font-display text-2xl font-semibold">{form.name.trim() || "Your offer name"}</h2>
            <span className={`mt-3 inline-flex px-2.5 py-1 text-[10px] font-bold uppercase ${form.isActive ? "bg-green-100 text-green-900" : "bg-line text-muted"}`}>{form.isActive ? "Active" : "Paused"}</span>
            <p className="mt-5 text-lg font-bold uppercase">
              {form.discountType === "flat" ? `Flat ${formatRupees(form.discountValue)} off` : `${form.discountValue}% off`}
            </p>
            <p className="mt-1 text-sm text-muted">
              {form.appliesTo === "all" ? "Applicable to all products" : form.appliesTo === "categories" ? `Applicable to ${form.categoryIds.length} selected ${form.categoryIds.length === 1 ? "category" : "categories"}` : `Applicable to ${form.productIds.length} selected ${form.productIds.length === 1 ? "product" : "products"}`}
            </p>
            <div className="mt-6 border-t border-line pt-5 text-sm">
              <p className="font-semibold">Products eligible</p>
              <p className="mt-1 text-muted">{form.appliesTo === "all" ? "All active products" : `${eligibleCount} active ${eligibleCount === 1 ? "product" : "products"}`}</p>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="text-muted">Example price</span>
                <span className="text-right">
                  <span className="block text-xs text-muted line-through">{formatRupees(previewOriginal)}</span>
                  <span className="block font-bold">{formatRupees(previewOriginal - previewDiscount)}</span>
                  <span className="block text-xs text-green-800">Save {formatRupees(previewDiscount)}</span>
                </span>
              </div>
              <div className="mt-5 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                <div><p className="text-xs text-muted">Starts</p><p className="mt-1 font-medium">{form.startDate ? new Date(form.startDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}</p></div>
                <div><p className="text-xs text-muted">Ends</p><p className="mt-1 font-medium">{form.endDate ? new Date(form.endDate).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "—"}</p></div>
              </div>
            </div>
          </aside>
        </section>
      )}

      <section className="mt-8 border border-line bg-paper">
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <h2 className="font-display text-xl font-semibold">All offers <span className="ml-1 text-sm font-normal text-muted">({offers.length})</span></h2>
        </div>
        {offers.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="font-semibold">No offers created yet</p>
            <p className="mt-1 text-sm text-muted">Create a discount offer to feature it across eligible products.</p>
          </div>
        ) : (
          <div className="divide-y divide-line">
            {offers.map((offer) => {
              const status = offerState(offer, now);
              const targetLabel = offer.appliesTo === "all" ? "All active products" : offer.appliesTo === "categories" ? `${offer.categoryIds.length} categories` : `${offer.productIds.length} products`;
              return (
                <article className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-6" key={offer.id}>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{offer.name}</h3>
                      <span className={`px-2 py-1 text-[10px] font-bold uppercase ${status === "Active" ? "bg-green-100 text-green-900" : "bg-canvas text-muted"}`}>{status}</span>
                    </div>
                    <p className="mt-1 text-sm text-muted">{offer.discountType === "flat" ? `${formatRupees(offer.discountValue)} off` : `${offer.discountValue}% off`} · {targetLabel}</p>
                    <p className="mt-1 text-xs text-muted">{new Date(offer.startDate).toLocaleDateString("en-IN")} – {new Date(offer.endDate).toLocaleDateString("en-IN")}</p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button aria-label={`Edit ${offer.name}`} className="grid size-10 place-items-center border border-line hover:bg-canvas" onClick={() => beginEdit(offer)} type="button"><Pencil size={16} /></button>
                    <button aria-label={`Delete ${offer.name}`} className="grid size-10 place-items-center border border-line text-red-700 hover:bg-red-50 disabled:opacity-50" disabled={deleting === offer.id} onClick={() => void deleteOffer(offer)} type="button">{deleting === offer.id ? <LoadingSpinner label="Deleting…" /> : <Trash2 size={16} />}</button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
