"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  AVAILABILITY_LABELS, AVAILABILITY_STATUSES, DEFAULT_SIZE_SYSTEM, JERSEY_TYPES, JERSEY_TYPE_LABELS, LOGO_TYPES, LOGO_TYPE_LABELS, MAX_PRODUCT_IMAGES, PRODUCT_TYPES, PRODUCT_TYPE_LABELS,
  SIZE_OPTIONS, SIZE_SYSTEMS, SIZE_SYSTEM_LABELS, TEAM_TYPES, TEAM_TYPE_LABELS, isTeamBased, type AvailabilityStatus, type ProductType, type SizeSystem,
} from "@/lib/catalog-constants";
import { productApi } from "@/lib/admin-api";
import { showApiError } from "@/lib/form-errors";
import type { CategoryDto, ProductDto } from "@/lib/types/catalog";
import { productInputSchema, type ProductInput } from "@/lib/validation/catalog";
import { Field, FormError, adminInputClass } from "@/components/pages/admin/FormFields";
import { ImageUploader } from "@/components/pages/admin/ImageUploader";
import { useUploadSession } from "@/components/pages/admin/useUploadSession";

const optionalNumber = (value: unknown) => (value === "" || value === null || value === undefined || Number.isNaN(Number(value)) ? null : Number(value));
const DEFAULT_STATUS: AvailabilityStatus = "supplier-confirmation-required";

// Clothing starts with every size ticked; shoes start empty because the range is wide.
function defaultVariants(system: SizeSystem) {
  const sizes = system === "uk" || system === "eu" ? [] : SIZE_OPTIONS[system];
  return sizes.map((size) => ({ size, availabilityStatus: DEFAULT_STATUS }));
}

function toDefaults(product?: ProductDto): Partial<ProductInput> {
  if (!product) {
    return {
      productType: "jersey", name: "", slug: "", description: "", brand: "", team: { name: "", type: "club" }, season: "", player: { name: "", number: null },
      jerseyType: "half-sleeve", logoType: "unknown", fabric: "", compareAtPrice: null, sizeSystem: "apparel", variants: defaultVariants("apparel"),
      images: [], category: "", isActive: true, isFeatured: false, displayOrder: 0, seo: { title: "", description: "" },
    };
  }
  const { id: _id, createdAt: _createdAt, updatedAt: _updatedAt, category, ...rest } = product;
  void _id; void _createdAt; void _updatedAt;
  return { ...rest, category: category.id };
}

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="border border-line p-5 sm:p-6">
      <h2 className="font-display text-xl font-semibold">{title}</h2>
      {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

export function AdminProductForm({ product, categories }: { product?: ProductDto; categories: CategoryDto[] }) {
  const router = useRouter();
  const uploads = useUploadSession();
  const { register, control, handleSubmit, setError, setValue, formState: { errors, isSubmitting } } = useForm<ProductInput>({ resolver: zodResolver(productInputSchema), defaultValues: toDefaults(product) });
  const productType = useWatch({ control, name: "productType" }) as ProductType;
  const sizeSystem = useWatch({ control, name: "sizeSystem" }) as SizeSystem;
  const teamBased = isTeamBased(productType);

  async function onSubmit(values: ProductInput) {
    try {
      if (product) await productApi.update(product.id, values);
      else await productApi.create(values);
      uploads.markSaved();
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      showApiError(error, setError);
    }
  }

  function changeProductType(type: ProductType) {
    const system = DEFAULT_SIZE_SYSTEM[type];
    setValue("sizeSystem", system);
    setValue("variants", defaultVariants(system));
  }

  const invalid = (message?: string) => Boolean(message);
  const sizeError = errors.variants?.message ?? errors.variants?.root?.message;

  return (
    <div>
      <Link className="text-xs font-bold uppercase text-muted hover:text-ink" href="/admin/products">← Back to products</Link>
      <p className="mt-5 text-xs font-bold uppercase text-muted">Catalog</p>
      <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">{product ? "Edit product" : "New product"}</h1>

      <form className="mt-8 max-w-4xl space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
        <FormError message={errors.root?.server?.message} />

        <Section title="Basics">
          <Field error={errors.productType?.message} label="Product type"><select {...register("productType", { onChange: (event) => changeProductType(event.target.value as ProductType) })} className={adminInputClass}>{PRODUCT_TYPES.map((type) => <option key={type} value={type}>{PRODUCT_TYPE_LABELS[type]}</option>)}</select></Field>
          <Field error={errors.brand?.message} label="Brand (optional)"><input {...register("brand")} aria-invalid={invalid(errors.brand?.message)} className={adminInputClass} placeholder="e.g. Nike" /></Field>
          <Field className="sm:col-span-2" error={errors.name?.message} label="Product name"><input {...register("name")} aria-invalid={invalid(errors.name?.message)} className={adminInputClass} placeholder={teamBased ? "e.g. Argentina Home Jersey 2022" : "e.g. Predator Elite Boots"} /></Field>
          <Field className="sm:col-span-2" error={errors.slug?.message} hint="Leave blank to generate it from the name." label="Slug (optional)"><input {...register("slug")} aria-invalid={invalid(errors.slug?.message)} className={adminInputClass} /></Field>
          <Field className="sm:col-span-2" error={errors.description?.message} label="Description"><textarea {...register("description")} aria-invalid={invalid(errors.description?.message)} className={adminInputClass} rows={4} /></Field>
        </Section>

        {teamBased && (
          <Section title="Team and player">
            <Field error={errors.team?.name?.message} label="Team name"><input {...register("team.name")} aria-invalid={invalid(errors.team?.name?.message)} className={adminInputClass} placeholder="e.g. Argentina" /></Field>
            <Field error={errors.team?.type?.message} label="Team type"><select {...register("team.type")} className={adminInputClass}>{TEAM_TYPES.map((type) => <option key={type} value={type}>{TEAM_TYPE_LABELS[type]}</option>)}</select></Field>
            <Field error={errors.season?.message} label="Season"><input {...register("season")} aria-invalid={invalid(errors.season?.message)} className={adminInputClass} placeholder="e.g. 2025/26" /></Field>
            <span className="hidden sm:block" />
            <Field error={errors.player?.name?.message} label="Player name (optional)"><input {...register("player.name")} aria-invalid={invalid(errors.player?.name?.message)} className={adminInputClass} /></Field>
            <Field error={errors.player?.number?.message} label="Player number (optional)"><input {...register("player.number", { setValueAs: optionalNumber })} aria-invalid={invalid(errors.player?.number?.message)} className={adminInputClass} inputMode="numeric" type="number" /></Field>
          </Section>
        )}

        <Section title="Product details">
          {productType === "jersey" && <Field error={errors.jerseyType?.message} label="Jersey type"><select {...register("jerseyType")} className={adminInputClass}>{JERSEY_TYPES.map((type) => <option key={type} value={type}>{JERSEY_TYPE_LABELS[type]}</option>)}</select></Field>}
          {teamBased && <Field error={errors.logoType?.message} label="Logo type"><select {...register("logoType")} className={adminInputClass}>{LOGO_TYPES.map((type) => <option key={type} value={type}>{LOGO_TYPE_LABELS[type]}</option>)}</select></Field>}
          <Field className="sm:col-span-2" error={errors.fabric?.message} hint="Optional, e.g. breathable mesh or synthetic leather." label="Material"><input {...register("fabric")} aria-invalid={invalid(errors.fabric?.message)} className={adminInputClass} /></Field>
        </Section>

        <Section description="Prices are in Indian rupees (₹)." title="Price and sizes">
          <Field error={errors.price?.message} label="Selling price (₹)"><input {...register("price", { valueAsNumber: true })} aria-invalid={invalid(errors.price?.message)} className={adminInputClass} inputMode="decimal" step="any" type="number" /></Field>
          <Field error={errors.compareAtPrice?.message} hint="Optional original price, shown struck through." label="Compare-at price (₹)"><input {...register("compareAtPrice", { setValueAs: optionalNumber })} aria-invalid={invalid(errors.compareAtPrice?.message)} className={adminInputClass} inputMode="decimal" step="any" type="number" /></Field>
          <Field className="sm:col-span-2" error={errors.sizeSystem?.message} label="Size type"><select {...register("sizeSystem", { onChange: (event) => setValue("variants", defaultVariants(event.target.value as SizeSystem)) })} className={adminInputClass}>{SIZE_SYSTEMS.map((system) => <option key={system} value={system}>{SIZE_SYSTEM_LABELS[system]}</option>)}</select></Field>
          <div className="sm:col-span-2">
            <p className="text-xs font-semibold">Available sizes</p>
            <Controller control={control} name="variants" render={({ field }) => (
              <div className="mt-2 divide-y divide-line border border-line">
                {SIZE_OPTIONS[sizeSystem].map((size) => {
                  const current = field.value.find((variant) => variant.size === size);
                  const setList = (next: typeof field.value) => field.onChange(SIZE_OPTIONS[sizeSystem].flatMap((item) => next.filter((variant) => variant.size === item)));
                  return (
                    <div className="flex flex-wrap items-center gap-3 p-3" key={size}>
                      <label className="flex w-24 items-center gap-2 text-sm font-semibold"><input checked={Boolean(current)} className="size-4 accent-[#f2fa18]" onChange={(event) => setList(event.target.checked ? [...field.value, { size, availabilityStatus: DEFAULT_STATUS }] : field.value.filter((variant) => variant.size !== size))} type="checkbox" />{size}</label>
                      <select aria-label={`${size} availability`} className="min-w-0 flex-1 border border-line bg-white p-2 text-sm disabled:opacity-40" disabled={!current} onChange={(event) => setList(field.value.map((variant) => (variant.size === size ? { ...variant, availabilityStatus: event.target.value as AvailabilityStatus } : variant)))} value={current?.availabilityStatus ?? DEFAULT_STATUS}>{AVAILABILITY_STATUSES.map((status) => <option key={status} value={status}>{AVAILABILITY_LABELS[status]}</option>)}</select>
                    </div>
                  );
                })}
              </div>
            )} />
            {sizeError && <p className="mt-1.5 text-xs text-red-700" role="alert">{sizeError}</p>}
          </div>
        </Section>

        <Section title="Images">
          <div className="sm:col-span-2">
            <Controller control={control} name="images" render={({ field }) => <ImageUploader error={errors.images?.message ?? errors.images?.root?.message} max={MAX_PRODUCT_IMAGES} onChange={field.onChange} session={uploads} target="product" value={field.value} />} />
          </div>
        </Section>

        <Section title="Category and storefront">
          <Field className="sm:col-span-2" error={errors.category?.message} hint={categories.length === 0 ? undefined : "Only categories created in the admin are listed."} label="Category">
            <select {...register("category")} aria-invalid={invalid(errors.category?.message)} className={adminInputClass}><option value="">Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}{category.isActive ? "" : " (inactive)"}</option>)}</select>
          </Field>
          {categories.length === 0 && <p className="text-sm text-muted sm:col-span-2">You need a category first. <Link className="font-semibold text-ink underline" href="/admin/categories">Create a category</Link>.</p>}
          <label className="flex items-center gap-2 text-sm"><input {...register("isActive")} className="size-4 accent-[#f2fa18]" type="checkbox" />Active (visible on the store)</label>
          <label className="flex items-center gap-2 text-sm"><input {...register("isFeatured")} className="size-4 accent-[#f2fa18]" type="checkbox" />Featured</label>
          <Field error={errors.displayOrder?.message} hint="Lower numbers appear first." label="Display order"><input {...register("displayOrder", { valueAsNumber: true })} aria-invalid={invalid(errors.displayOrder?.message)} className={adminInputClass} inputMode="numeric" type="number" /></Field>
        </Section>

        <Section description="Optional. Used for search engine results." title="SEO">
          <Field className="sm:col-span-2" error={errors.seo?.title?.message} label="SEO title"><input {...register("seo.title")} aria-invalid={invalid(errors.seo?.title?.message)} className={adminInputClass} /></Field>
          <Field className="sm:col-span-2" error={errors.seo?.description?.message} label="SEO description"><textarea {...register("seo.description")} aria-invalid={invalid(errors.seo?.description?.message)} className={adminInputClass} rows={3} /></Field>
        </Section>

        <div className="flex gap-3">
          <button className="min-h-12 bg-brand px-8 text-xs font-bold uppercase disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? "Saving…" : product ? "Save changes" : "Create product"}</button>
          <Link className="inline-flex min-h-12 items-center border border-line px-8 text-xs font-bold uppercase" href="/admin/products">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
