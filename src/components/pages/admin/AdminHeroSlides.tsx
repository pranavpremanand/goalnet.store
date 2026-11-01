"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuCheck as Check, LuPencil as Pencil, LuPlus as Plus, LuTrash2 as Trash2, LuX as X } from "react-icons/lu";
import { ApiError, apiRequest } from "@/lib/api-client";
import { showApiError } from "@/lib/form-errors";
import type { ImageAsset } from "@/lib/types/catalog";
import { heroSlideInputSchema, type HeroSlideInput } from "@/lib/validation/hero";
import { Field, FormError, adminInputClass } from "@/components/pages/admin/FormFields";
import { ImageUploader } from "@/components/pages/admin/ImageUploader";
import { useUploadSession } from "@/components/pages/admin/useUploadSession";

type HeroSlide = HeroSlideInput & { id: string; createdAt: string; updatedAt: string };

const emptySlide: HeroSlideInput = {
  tagline: "", heading: "", highlightedWord: "", description: "", image: { url: "", fileId: "", alt: "" }, buttons: [], isActive: true, displayOrder: 0,
};

function SlideEditor({ slide, onClose, onSaved }: { slide: HeroSlide | null; onClose: () => void; onSaved: (message: string) => void }) {
  const uploads = useUploadSession();
  const { register, control, handleSubmit, setError, formState: { errors, isSubmitting } } = useForm<HeroSlideInput>({
    resolver: zodResolver(heroSlideInputSchema),
    defaultValues: slide ? {
      tagline: slide.tagline, heading: slide.heading, highlightedWord: slide.highlightedWord, description: slide.description,
      image: slide.image, buttons: slide.buttons, isActive: slide.isActive, displayOrder: slide.displayOrder,
    } : emptySlide,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "buttons" });
  const heading = useWatch({ control, name: "heading" }) ?? "";
  const highlightedWord = useWatch({ control, name: "highlightedWord" }) ?? "";
  const highlightIndex = heading.toLocaleLowerCase().indexOf(highlightedWord.toLocaleLowerCase());
  const hasHighlight = Boolean(highlightedWord) && highlightIndex >= 0;

  async function onSubmit(values: HeroSlideInput) {
    try {
      if (slide) await apiRequest(`/api/admin/hero-slides/${slide.id}`, { method: "PUT", body: JSON.stringify(values) });
      else await apiRequest("/api/admin/hero-slides", { method: "POST", body: JSON.stringify(values) });
      uploads.markSaved();
      onSaved(slide ? "Slide updated." : "Slide added.");
    } catch (error) {
      showApiError(error, setError);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <section aria-labelledby="hero-editor-title" aria-modal="true" className="relative max-h-[92vh] w-full max-w-3xl overflow-y-auto bg-paper p-6 sm:p-8" role="dialog">
        <button aria-label="Close editor" className="absolute right-4 top-4" onClick={onClose} type="button"><X size={20} /></button>
        <p className="text-xs font-bold uppercase text-muted">Homepage</p>
        <h2 className="mt-1 font-display text-2xl font-semibold" id="hero-editor-title">{slide ? "Edit slide" : "New slide"}</h2>
        <form className="mt-6 space-y-6" noValidate onSubmit={handleSubmit(onSubmit)}>
          <FormError message={errors.root?.server?.message} />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field error={errors.tagline?.message} label="Tagline"><input {...register("tagline")} aria-invalid={Boolean(errors.tagline)} className={adminInputClass} placeholder="e.g. Made for matchday" /></Field>
            <Field error={errors.displayOrder?.message} hint="Lower numbers appear first." label="Display order"><input {...register("displayOrder", { valueAsNumber: true })} aria-invalid={Boolean(errors.displayOrder)} className={adminInputClass} min="0" type="number" /></Field>
          </div>
          <Field error={errors.heading?.message} label="Heading"><input {...register("heading")} aria-invalid={Boolean(errors.heading)} className={adminInputClass} placeholder="Every legend has a beginning." /></Field>
          <div>
            <Field error={errors.highlightedWord?.message} label="Highlighted word or phrase"><input {...register("highlightedWord")} aria-invalid={Boolean(errors.highlightedWord)} className={adminInputClass} placeholder="beginning" /></Field>
            <p aria-live="polite" className="mt-1.5 text-xs text-muted">Preview: {hasHighlight ? <>{heading.slice(0, highlightIndex)}<span className="bg-brand px-1 text-ink">{heading.slice(highlightIndex, highlightIndex + highlightedWord.length)}</span>{heading.slice(highlightIndex + highlightedWord.length)}</> : heading}</p>
          </div>
          <Field error={errors.description?.message} label="Description"><textarea {...register("description")} aria-invalid={Boolean(errors.description)} className={adminInputClass} rows={3} /></Field>
          <div>
            <p className="text-xs font-semibold">Background image</p>
            <p className="mt-1 text-[11px] text-muted">Wide landscape images work best. JPG, PNG or WebP, up to 5 MB.</p>
            <div className="mt-2">
                <Controller control={control} name="image" render={({ field }) => <ImageUploader error={errors.image?.message ?? errors.image?.url?.message} max={1} onChange={(images: ImageAsset[]) => field.onChange(images[0] ?? { url: "", fileId: "", alt: "" })} session={uploads} target="hero" value={field.value?.fileId ? [field.value] : []} />} />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between"><div><h3 className="text-xs font-bold uppercase">Buttons</h3><p className="mt-1 text-[11px] text-muted">Use a path on this website, such as /shop.</p></div><button className="inline-flex min-h-9 items-center gap-1 border border-line px-3 text-[10px] font-bold uppercase disabled:opacity-40" disabled={fields.length >= 2} onClick={() => append({ label: "Shop now", href: "/shop", style: fields.length === 0 ? "primary" : "secondary" })} type="button"><Plus size={14} /> Add button</button></div>
            {errors.buttons?.root?.message && <p className="mt-2 text-xs text-red-700" role="alert">{errors.buttons.root.message}</p>}
            <div className="mt-3 space-y-3">
              {fields.map((field, index) => (
                <div className="grid gap-3 border border-line p-3 sm:grid-cols-[1fr_1fr_140px_auto]" key={field.id}>
                  <Field error={errors.buttons?.[index]?.label?.message} label="Button text"><input {...register(`buttons.${index}.label`)} aria-invalid={Boolean(errors.buttons?.[index]?.label)} className={adminInputClass} /></Field>
                  <Field error={errors.buttons?.[index]?.href?.message} label="Destination"><input {...register(`buttons.${index}.href`)} aria-invalid={Boolean(errors.buttons?.[index]?.href)} className={adminInputClass} placeholder="/shop" /></Field>
                  <Field error={errors.buttons?.[index]?.style?.message} label="Style"><select {...register(`buttons.${index}.style`)} className={adminInputClass}><option value="primary">Primary</option><option value="secondary">Secondary</option></select></Field>
                  <button aria-label={`Remove button ${index + 1}`} className="mt-6 grid size-10 place-items-center border border-line text-red-700" onClick={() => remove(index)} type="button"><Trash2 size={15} /></button>
                </div>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm"><input {...register("isActive")} className="size-4 accent-[#f2fa18]" type="checkbox" />Active (shown in the carousel)</label>
          <div className="flex gap-3"><button className="min-h-11 bg-brand px-6 text-xs font-bold uppercase disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? "Saving…" : slide ? "Save slide" : "Add slide"}</button><button className="min-h-11 border border-line px-6 text-xs font-bold uppercase" onClick={onClose} type="button">Cancel</button></div>
        </form>
      </section>
    </div>
  );
}

export function AdminHeroSlides({ slides }: { slides: HeroSlide[] }) {
  const router = useRouter();
  const [editor, setEditor] = useState<{ open: false } | { open: true; slide: HeroSlide | null }>({ open: false });
  const [deleting, setDeleting] = useState<HeroSlide | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  function saved(message: string) {
    setEditor({ open: false });
    setNotice(message);
    router.refresh();
  }

  async function removeSlide(slide: HeroSlide) {
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/api/admin/hero-slides/${slide.id}`, { method: "DELETE" });
      setDeleting(null);
      setNotice("Slide deleted. Its image was removed from ImageKit.");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-muted">Homepage</p><h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Hero carousel</h1><p className="mt-2 text-sm text-muted">Manage the slides shown at the top of the homepage.</p></div><button className="inline-flex min-h-11 items-center gap-2 bg-brand px-5 text-xs font-bold uppercase" onClick={() => { setNotice(""); setEditor({ open: true, slide: null }); }} type="button"><Plus size={15} /> New slide</button></div>
      {notice && <p aria-live="polite" className="mt-5 flex items-center gap-2 bg-canvas p-3 text-sm"><Check size={15} />{notice}</p>}
      {slides.length === 0 ? <p className="mt-6 border border-dashed border-line p-8 text-center text-sm text-muted">No saved slides. The homepage is showing its default slide until you add one.</p> : (
        <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full min-w-[780px] text-left text-sm">
            <thead className="bg-canvas text-[10px] font-bold uppercase text-muted"><tr><th className="px-4 py-3">Slide</th><th className="px-4 py-3">Tagline</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
            <tbody>{slides.map((slide) => <tr className="border-t border-line" key={slide.id}><td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative h-12 w-20 shrink-0 overflow-hidden bg-canvas"><Image alt={slide.image.alt || slide.heading} className="object-cover" fill sizes="80px" src={slide.image.url} /></div><div><p className="font-semibold">{slide.heading}</p><p className="text-xs text-muted">{slide.buttons.map((button) => button.label).join(" · ") || "No buttons"}</p></div></div></td><td className="px-4 py-3">{slide.tagline}</td><td className="px-4 py-3">{slide.displayOrder}</td><td className="px-4 py-3"><span className={`px-2 py-1 text-[10px] font-bold uppercase ${slide.isActive ? "bg-brand" : "bg-canvas text-muted"}`}>{slide.isActive ? "Active" : "Inactive"}</span></td><td className="px-4 py-3"><div className="flex justify-end gap-2"><button aria-label={`Edit ${slide.heading}`} className="grid size-9 place-items-center border border-line" onClick={() => { setNotice(""); setEditor({ open: true, slide }); }} type="button"><Pencil size={15} /></button><button aria-label={`Delete ${slide.heading}`} className="grid size-9 place-items-center border border-line text-red-700" onClick={() => { setError(""); setDeleting(slide); }} type="button"><Trash2 size={15} /></button></div></td></tr>)}</tbody>
          </table>
        </div>
      )}
      {editor.open && <SlideEditor key={editor.slide?.id ?? "new"} onClose={() => setEditor({ open: false })} onSaved={saved} slide={editor.slide} />}
      {deleting && <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4"><section aria-modal="true" className="w-full max-w-sm bg-paper p-6" role="dialog"><p className="text-xs font-bold uppercase text-muted">Please confirm</p><h2 className="mt-2 font-display text-2xl font-semibold">Delete this slide?</h2><p className="mt-2 text-sm text-muted">“{deleting.heading}” and its ImageKit background will be removed.</p>{error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}<div className="mt-5 flex gap-3"><button className="min-h-11 bg-red-700 px-5 text-xs font-bold uppercase text-white disabled:opacity-60" disabled={busy} onClick={() => void removeSlide(deleting)} type="button">{busy ? "Deleting…" : "Delete slide"}</button><button className="min-h-11 border border-line px-5 text-xs font-bold uppercase" onClick={() => setDeleting(null)} type="button">Cancel</button></div></section></div>}
    </div>
  );
}
