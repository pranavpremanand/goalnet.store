"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuCheck as Check, LuPencil as Pencil, LuPlus as Plus, LuTrash2 as Trash2, LuX as X } from "react-icons/lu";
import { ApiError } from "@/lib/api-client";
import { categoryApi } from "@/lib/admin-api";
import { showApiError } from "@/lib/form-errors";
import type { CategoryDto } from "@/lib/types/catalog";
import { categoryInputSchema, type CategoryInput } from "@/lib/validation/catalog";
import { Field, FormError, adminInputClass } from "@/components/pages/admin/FormFields";
import { ImageUploader } from "@/components/pages/admin/ImageUploader";
import { useUploadSession } from "@/components/pages/admin/useUploadSession";

type DeleteChoice = "reassign" | "delete";

function DeleteCategoryDialog({ category, others, onClose, onDeleted }: { category: CategoryDto; others: CategoryDto[]; onClose: () => void; onDeleted: () => void }) {
  const hasProducts = category.productCount > 0;
  const [choice, setChoice] = useState<DeleteChoice>(others.length > 0 ? "reassign" : "delete");
  const [targetId, setTargetId] = useState(others[0]?.id ?? "");
  const [understood, setUnderstood] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);
  const noun = category.productCount === 1 ? "product" : "products";
  const blocked = hasProducts && (choice === "reassign" ? !targetId : !understood);

  async function submit() {
    setDeleting(true);
    setError("");
    try {
      await categoryApi.remove(category.id, hasProducts ? { productAction: choice, targetCategoryId: choice === "reassign" ? targetId : undefined } : {});
      onDeleted();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : "Something went wrong. Please try again.");
      setDeleting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
      <section aria-labelledby="delete-category-title" aria-modal="true" className="max-h-[92vh] w-full max-w-md overflow-y-auto bg-paper p-6" role="dialog">
        <p className="text-xs font-bold uppercase text-muted">Please confirm</p>
        <h2 className="mt-2 font-display text-2xl font-semibold" id="delete-category-title">Delete this category?</h2>
        <p className="mt-2 text-sm text-muted">“{category.name}” and its cover image will be removed. This cannot be undone.</p>
        {hasProducts && (
          <div className="mt-4 border-l-4 border-red-600 bg-red-50 p-4">
            <p className="text-sm font-semibold text-red-800">This category has {category.productCount} {noun}.</p>
            <p className="mt-1 text-xs text-red-800">Choose what should happen to {category.productCount === 1 ? "it" : "them"}:</p>
            <fieldset className="mt-3 space-y-3">
              <legend className="sr-only">What to do with the products</legend>
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input checked={choice === "reassign"} className="mt-1 accent-[#f2fa18]" disabled={others.length === 0} name="product-action" onChange={() => setChoice("reassign")} type="radio" />
                <span><span className="font-semibold">Move {category.productCount === 1 ? "it" : "all of them"} to another category</span>{others.length === 0 && <span className="block text-xs text-muted">Create another category first to use this option.</span>}</span>
              </label>
              {choice === "reassign" && others.length > 0 && (
                <select aria-label="Move products to" className="ml-6 w-[calc(100%-1.5rem)] border border-line bg-white p-2 text-sm" onChange={(event) => setTargetId(event.target.value)} value={targetId}>{others.map((other) => <option key={other.id} value={other.id}>{other.name}</option>)}</select>
              )}
              <label className="flex cursor-pointer items-start gap-2 text-sm">
                <input checked={choice === "delete"} className="mt-1 accent-[#f2fa18]" name="product-action" onChange={() => setChoice("delete")} type="radio" />
                <span><span className="font-semibold">Delete {category.productCount === 1 ? "it" : "all of them"} along with the category</span><span className="block text-xs text-muted">The {noun} and {category.productCount === 1 ? "its" : "their"} images are permanently removed.</span></span>
              </label>
              {choice === "delete" && <label className="ml-6 flex items-start gap-2 text-xs"><input checked={understood} className="mt-0.5 accent-[#f2fa18]" onChange={(event) => setUnderstood(event.target.checked)} type="checkbox" />I understand these {noun} will be deleted permanently.</label>}
            </fieldset>
          </div>
        )}
        {error && <p className="mt-3 border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800" role="alert">{error}</p>}
        <div className="mt-5 flex gap-3"><button className="min-h-11 bg-red-700 px-5 text-xs font-bold uppercase text-white disabled:opacity-60" disabled={deleting || blocked} onClick={() => void submit()} type="button">{deleting ? "Deleting…" : hasProducts && choice === "reassign" ? "Move products and delete" : hasProducts ? "Delete category and products" : "Delete"}</button><button className="min-h-11 border border-line px-5 text-xs font-bold uppercase" onClick={onClose} type="button">Cancel</button></div>
      </section>
    </div>
  );
}

function CategoryDialog({ category, onClose, onSaved }: { category: CategoryDto | null; onClose: () => void; onSaved: (message: string) => void }) {
  const uploads = useUploadSession();
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<CategoryInput>({
    resolver: zodResolver(categoryInputSchema),
    defaultValues: category
      ? { name: category.name, slug: category.slug, description: category.description, tagline: category.tagline, coverImage: category.coverImage, isActive: category.isActive, displayOrder: category.displayOrder }
      : { name: "", slug: "", description: "", tagline: "", isActive: true, displayOrder: 0 },
  });

  async function onSubmit(values: CategoryInput) {
    try {
      if (category) await categoryApi.update(category.id, values);
      else await categoryApi.create(values);
      uploads.markSaved();
      onSaved(category ? "Category updated." : "Category created.");
    } catch (error) {
      showApiError(error, setError);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
      <section aria-labelledby="category-dialog-title" aria-modal="true" className="relative max-h-[92vh] w-full max-w-xl overflow-y-auto bg-paper p-6 sm:p-8" role="dialog">
        <button aria-label="Close" className="absolute right-4 top-4" onClick={onClose} type="button"><X size={20} /></button>
        <p className="text-xs font-bold uppercase text-muted">Catalog</p>
        <h2 className="mt-1 font-display text-2xl font-semibold" id="category-dialog-title">{category ? "Edit category" : "New category"}</h2>
        <form className="mt-6 space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
          <FormError message={errors.root?.server?.message} />
          <Field error={errors.name?.message} label="Category name"><input {...register("name")} aria-invalid={Boolean(errors.name)} className={adminInputClass} placeholder="e.g. Retro classics" /></Field>
          <Field error={errors.slug?.message} hint="Leave blank to generate it from the name." label="Slug (optional)"><input {...register("slug")} aria-invalid={Boolean(errors.slug)} className={adminInputClass} placeholder="retro-classics" /></Field>
          <Field error={errors.tagline?.message} hint="Short line shown above the name on the homepage, e.g. From the archive." label="Tagline"><input {...register("tagline")} aria-invalid={Boolean(errors.tagline)} className={adminInputClass} placeholder="From the archive" /></Field>
          <Field error={errors.description?.message} label="Description"><textarea {...register("description")} aria-invalid={Boolean(errors.description)} className={adminInputClass} rows={3} /></Field>
          <div>
            <p className="text-xs font-semibold">Cover image</p>
            <div className="mt-2">
              <Controller control={control} name="coverImage" render={({ field }) => <ImageUploader error={errors.coverImage?.message ?? errors.coverImage?.url?.message} max={1} onChange={(images) => field.onChange(images[0])} session={uploads} target="category" value={field.value ? [field.value] : []} />} />
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field error={errors.displayOrder?.message} hint="Lower numbers appear first." label="Display order"><input {...register("displayOrder", { valueAsNumber: true })} aria-invalid={Boolean(errors.displayOrder)} className={adminInputClass} inputMode="numeric" type="number" /></Field>
            <label className="flex items-center gap-2 self-end pb-3 text-sm"><input {...register("isActive")} className="size-4 accent-[#f2fa18]" type="checkbox" />Active (visible on the store)</label>
          </div>
          <div className="flex gap-3">
            <button className="min-h-11 bg-brand px-6 text-xs font-bold uppercase disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? "Saving…" : "Save category"}</button>
            <button className="min-h-11 border border-line px-6 text-xs font-bold uppercase" onClick={onClose} type="button">Cancel</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export function AdminCategories({ categories }: { categories: CategoryDto[] }) {
  const router = useRouter();
  const [dialog, setDialog] = useState<{ mode: "closed" } | { mode: "form"; category: CategoryDto | null } | { mode: "delete"; category: CategoryDto }>({ mode: "closed" });
  const [notice, setNotice] = useState("");

  function saved(message: string) {
    setDialog({ mode: "closed" });
    setNotice(message);
    router.refresh();
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs font-bold uppercase text-muted">Catalog settings</p><h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Categories</h1><p className="mt-2 text-sm text-muted">Organize the products fans come looking for. Active categories appear on the homepage.</p></div>
        <button className="inline-flex min-h-11 items-center gap-2 bg-brand px-5 text-xs font-bold uppercase" onClick={() => { setNotice(""); setDialog({ mode: "form", category: null }); }} type="button"><Plus size={15} /> New category</button>
      </div>
      {notice && <p aria-live="polite" className="mt-5 flex items-center gap-2 bg-canvas p-3 text-sm"><Check size={15} />{notice}</p>}

      {categories.length === 0 ? (
        <p className="mt-6 border border-dashed border-line p-8 text-center text-sm text-muted">No categories yet. Create your first one to start adding products.</p>
      ) : (
        <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-canvas text-[10px] font-bold uppercase text-muted"><tr><th className="px-4 py-3">Category</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Products</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody>
              {categories.map((category) => (
                <tr className="border-t border-line" key={category.id}>
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative size-12 shrink-0 overflow-hidden bg-canvas"><Image alt={category.coverImage.alt || category.name} className="object-cover" fill sizes="48px" src={category.coverImage.url} /></div><span className="font-semibold">{category.name}</span></div></td>
                  <td className="px-4 py-3 text-muted">{category.slug}</td>
                  <td className="px-4 py-3">{category.productCount}</td>
                  <td className="px-4 py-3">{category.displayOrder}</td>
                  <td className="px-4 py-3"><span className={`px-2 py-1 text-[10px] font-bold uppercase ${category.isActive ? "bg-brand" : "bg-canvas text-muted"}`}>{category.isActive ? "Active" : "Inactive"}</span></td>
                  <td className="px-4 py-3"><div className="flex justify-end gap-2"><button aria-label={`Edit ${category.name}`} className="grid size-9 place-items-center border border-line" onClick={() => { setNotice(""); setDialog({ mode: "form", category }); }} type="button"><Pencil size={15} /></button><button aria-label={`Delete ${category.name}`} className="grid size-9 place-items-center border border-line text-red-700" onClick={() => setDialog({ mode: "delete", category })} type="button"><Trash2 size={15} /></button></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {dialog.mode === "form" && <CategoryDialog category={dialog.category} key={dialog.category?.id ?? "new"} onClose={() => setDialog({ mode: "closed" })} onSaved={saved} />}
      {dialog.mode === "delete" && <DeleteCategoryDialog category={dialog.category} key={dialog.category.id} onClose={() => setDialog({ mode: "closed" })} onDeleted={() => saved("Category deleted.")} others={categories.filter((item) => item.id !== dialog.category.id)} />}
    </div>
  );
}
