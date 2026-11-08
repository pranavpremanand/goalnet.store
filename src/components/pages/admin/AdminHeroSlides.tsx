"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LuCheck as Check, LuChevronDown as ChevronDown, LuChevronUp as ChevronUp, LuGripVertical as GripVertical, LuMonitor as Monitor, LuPencil as Pencil, LuPlus as Plus, LuSmartphone as Smartphone, LuTrash2 as Trash2, LuX as X } from "react-icons/lu";
import { LoadingSpinner } from "@/components/common/Loading";
import { SortableTable, SortableTableRow } from "@/components/pages/admin/SortableTable";
import { moveItem } from "@/lib/reorder";
import { ApiError, apiRequest } from "@/lib/api-client";
import { showApiError } from "@/lib/form-errors";
import type { ImageAsset } from "@/lib/types/catalog";
import { resolveHeroMediaType, type HeroMedia } from "@/lib/types/hero";
import { heroSlideInputSchema, type HeroSlideInput, type HeroSlideOutput } from "@/lib/validation/hero";
import { Field, FormError, adminInputClass } from "@/components/pages/admin/FormFields";
import { ImageUploader } from "@/components/pages/admin/ImageUploader";
import { HeroMediaUploader } from "@/components/pages/admin/HeroMediaUploader";
import { useUploadSession } from "@/components/pages/admin/useUploadSession";

type HeroResponsiveMedia = Omit<HeroMedia, "mediaType"> & { mediaType: "image" };
type HeroSlide = Omit<HeroSlideOutput, "mobileImage" | "desktopImage"> & {
  id: string;
  createdAt: string;
  updatedAt: string;
  mobileImage?: HeroResponsiveMedia | null;
  desktopImage?: HeroResponsiveMedia | null;
};

const emptySlide: HeroSlideInput = {
  tagline: "", heading: "", highlightedWord: "", description: "", showContent: true, image: { url: "", fileId: "", alt: "", mediaType: "image" }, mobileImage: null, desktopImage: null, buttons: [], isActive: true, displayOrder: 0,
};

type PreviewDevice = "small" | "large";

function HeroBannerPreview({
  device,
  image,
  mobileImage,
  desktopImage,
  tagline,
  heading,
  highlightedWord,
  description,
  showContent,
  buttons,
  onDeviceChange,
  onClose,
}: {
  device: PreviewDevice;
  image: HeroMedia;
  mobileImage?: HeroMedia | null;
  desktopImage?: HeroMedia | null;
  tagline: string;
  heading: string;
  highlightedWord: string;
  description: string;
  showContent: boolean;
  buttons: HeroSlideInput["buttons"];
  onDeviceChange: (device: PreviewDevice) => void;
  onClose: () => void;
}) {
  const responsiveImage = device === "small" ? mobileImage : desktopImage;
  const media = responsiveImage ?? image;
  const highlightIndex = heading.toLocaleLowerCase().indexOf(highlightedWord.toLocaleLowerCase());
  const hasHighlight = Boolean(highlightedWord) && highlightIndex >= 0;
  const isVideo = resolveHeroMediaType(media) === "video";

  return (
    <div className="fixed inset-0 z-[60] grid place-items-center overflow-y-auto bg-black/70 p-4">
      <section
        aria-labelledby="hero-preview-title"
        aria-modal="true"
        className="my-auto w-full max-w-5xl bg-paper p-4 sm:p-6"
        role="dialog"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase text-muted">Homepage</p>
            <h2 className="mt-1 font-display text-xl font-semibold" id="hero-preview-title">Banner preview</h2>
          </div>
          <button aria-label="Close preview" className="grid size-10 place-items-center border border-line" onClick={onClose} type="button"><X size={18} /></button>
        </div>
        <div className="my-4 flex gap-2">
          <button aria-pressed={device === "small"} className={`inline-flex min-h-10 items-center gap-2 border px-3 text-xs font-bold uppercase ${device === "small" ? "border-ink bg-brand" : "border-line"}`} onClick={() => onDeviceChange("small")} type="button"><Smartphone size={15} /> Small device</button>
          <button aria-pressed={device === "large"} className={`inline-flex min-h-10 items-center gap-2 border px-3 text-xs font-bold uppercase ${device === "large" ? "border-ink bg-brand" : "border-line"}`} onClick={() => onDeviceChange("large")} type="button"><Monitor size={15} /> Large device</button>
        </div>
        <div className={`relative mx-auto overflow-hidden bg-charcoal text-white ${device === "small" ? "aspect-[9/16] w-full max-w-[320px]" : "aspect-[16/7] w-full"}`}>
          {isVideo ? (
            <video
              aria-hidden="true"
              autoPlay
              className="absolute inset-0 size-full object-cover"
              key={media.fileId}
              loop
              muted
              playsInline
              preload="metadata"
              src={media.url}
            />
          ) : (
            <Image alt={media.alt || "Hero banner preview"} className="object-cover" fill priority sizes={device === "small" ? "320px" : "100vw"} src={media.url} />
          )}
          {showContent && (
            <>
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-black/10" />
              <div className={`absolute inset-0 flex flex-col justify-center ${device === "small" ? "items-center px-5 text-center" : "items-start px-[8%] text-left"}`}>
                <p className={`font-bold uppercase text-brand ${device === "small" ? "text-[9px]" : "text-xs sm:text-sm"}`}>{tagline || "Your tagline"}</p>
                <h3 className={`mt-3 max-w-[85%] font-display font-semibold leading-tight ${device === "small" ? "text-3xl" : "text-4xl sm:text-6xl"}`}>
                  {hasHighlight ? (
                    <>
                      {heading.slice(0, highlightIndex)}
                      <span className="inline-block bg-brand px-1.5 py-0.5 text-ink">{heading.slice(highlightIndex, highlightIndex + highlightedWord.length)}</span>
                      {heading.slice(highlightIndex + highlightedWord.length)}
                    </>
                  ) : heading || "Your heading"}
                </h3>
                <p className={`mt-3 max-w-md text-white/90 ${device === "small" ? "line-clamp-4 text-xs leading-5" : "text-sm leading-6 sm:text-base"}`}>{description || "Your banner description"}</p>
                {buttons.length > 0 && (
                  <div className={`mt-5 flex flex-wrap gap-2 ${device === "small" ? "justify-center" : ""}`}>
                    {buttons.map((button, index) => (
                      <span className={`inline-flex min-h-9 items-center px-3 text-[10px] font-bold uppercase ${button.style === "primary" ? "bg-brand text-ink" : "border border-white/65 text-white"}`} key={`${button.label}-${index}`}>{button.label}</span>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
        <p className="mt-3 text-center text-xs text-muted">
          {responsiveImage ? `Showing the uploaded ${device === "small" ? "small-device" : "large-device"} image.` : `No ${device === "small" ? "small" : "large"}-device override uploaded; showing the background media fallback.`}
        </p>
      </section>
    </div>
  );
}

function SlideEditor({ slide, onClose, onSaved }: { slide: HeroSlide | null; onClose: () => void; onSaved: (message: string) => void }) {
  const uploads = useUploadSession();
  const [previewDevice, setPreviewDevice] = useState<PreviewDevice | null>(null);
  const [showMobileUploader, setShowMobileUploader] = useState(
    Boolean(slide?.mobileImage && resolveHeroMediaType(slide.image) === "image"),
  );
  const { register, control, handleSubmit, setError, setValue, formState: { errors, isSubmitting } } = useForm<HeroSlideInput, unknown, HeroSlideOutput>({
    resolver: zodResolver(heroSlideInputSchema),
    defaultValues: slide ? {
      tagline: slide.tagline, heading: slide.heading, highlightedWord: slide.highlightedWord, description: slide.description,
      showContent: slide.showContent ?? true,
      image: slide.image,
      mobileImage: resolveHeroMediaType(slide.image) === "image" ? slide.mobileImage ?? null : null,
      desktopImage: resolveHeroMediaType(slide.image) === "image"
        ? slide.desktopImage ?? { ...slide.image, mediaType: "image" }
        : null,
      buttons: slide.buttons, isActive: slide.isActive, displayOrder: slide.displayOrder,
    } : emptySlide,
  });
  const { fields, append, remove } = useFieldArray({ control, name: "buttons" });
  const heading = useWatch({ control, name: "heading" }) ?? "";
  const highlightedWord = useWatch({ control, name: "highlightedWord" }) ?? "";
  const image = useWatch({ control, name: "image" });
  const mobileImage = useWatch({ control, name: "mobileImage" });
  const desktopImage = useWatch({ control, name: "desktopImage" });
  const description = useWatch({ control, name: "description" }) ?? "";
  const tagline = useWatch({ control, name: "tagline" }) ?? "";
  const showContent = useWatch({ control, name: "showContent" }) ?? true;
  const buttons = useWatch({ control, name: "buttons" }) ?? [];
  const previewMedia = image && resolveHeroMediaType(image) === "video"
    ? image.url ? image : null
    : desktopImage ?? (image?.url ? image : null);
  const highlightIndex = heading.toLocaleLowerCase().indexOf(highlightedWord.toLocaleLowerCase());
  const hasHighlight = Boolean(highlightedWord) && highlightIndex >= 0;

  async function onSubmit(values: HeroSlideOutput) {
    try {
      const normalizedValues = {
        ...values,
        image: { ...values.image, mediaType: resolveHeroMediaType(values.image) },
        mobileImage: values.mobileImage ? { ...values.mobileImage, mediaType: "image" as const } : null,
        desktopImage: values.desktopImage ? { ...values.desktopImage, mediaType: "image" as const } : null,
      };
      if (slide) await apiRequest(`/api/admin/hero-slides/${slide.id}`, { method: "PUT", body: JSON.stringify(normalizedValues) });
      else await apiRequest("/api/admin/hero-slides", { method: "POST", body: JSON.stringify(normalizedValues) });
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
          <Field error={errors.displayOrder?.message} hint="Lower numbers appear first." label="Display order"><input {...register("displayOrder", { valueAsNumber: true })} aria-invalid={Boolean(errors.displayOrder)} className={adminInputClass} min="0" type="number" /></Field>
          <label className="flex items-center gap-2 text-sm">
            <input {...register("showContent")} className="size-4 accent-[#f2fa18]" type="checkbox" />
            Show text content on this slide
          </label>
          <p className="-mt-5 text-xs text-muted">Turn this off for a banner-only slide. The text overlay will be removed from the preview and homepage.</p>
          {showContent && (
            <>
              <Field error={errors.tagline?.message} label="Tagline"><input {...register("tagline")} aria-invalid={Boolean(errors.tagline)} className={adminInputClass} placeholder="e.g. Made for matchday" /></Field>
              <Field error={errors.heading?.message} label="Heading"><input {...register("heading")} aria-invalid={Boolean(errors.heading)} className={adminInputClass} placeholder="Every legend has a beginning." /></Field>
              <div>
                <Field error={errors.highlightedWord?.message} label="Highlighted word or phrase"><input {...register("highlightedWord")} aria-invalid={Boolean(errors.highlightedWord)} className={adminInputClass} placeholder="beginning" /></Field>
                <p aria-live="polite" className="mt-1.5 text-xs text-muted">Preview: {hasHighlight ? <>{heading.slice(0, highlightIndex)}<span className="bg-brand px-1 text-ink">{heading.slice(highlightIndex, highlightIndex + highlightedWord.length)}</span>{heading.slice(highlightIndex + highlightedWord.length)}</> : heading}</p>
              </div>
              <Field error={errors.description?.message} label="Description"><textarea {...register("description")} aria-invalid={Boolean(errors.description)} className={adminInputClass} rows={3} /></Field>
            </>
          )}
          <div>
            <p className="text-xs font-semibold">Background media</p>
            <p className="mt-1 text-[11px] text-muted">Choose an image or a short video for this slide.</p>
            <div className="mt-2">
              <Controller control={control} name="image" render={({ field }) => (
                <div>
                  <Field label="Media type">
                    <select
                      className={adminInputClass}
                      onChange={(event) => {
                        const mediaType: HeroMedia["mediaType"] = event.target.value === "video" ? "video" : "image";
                        if (field.value.fileId) uploads.release(field.value.fileId);
                        if (mediaType === "video") {
                          if (mobileImage?.fileId) uploads.release(mobileImage.fileId);
                          if (desktopImage?.fileId) uploads.release(desktopImage.fileId);
                          setValue("mobileImage", null);
                          setValue("desktopImage", null);
                          setShowMobileUploader(false);
                        }
                        field.onChange({ url: "", fileId: "", alt: "", mediaType });
                      }}
                      value={resolveHeroMediaType(field.value)}
                    >
                      <option value="image">Image</option>
                      <option value="video">Video</option>
                    </select>
                  </Field>
                  {resolveHeroMediaType(field.value) === "video" && (
                    <div className="mt-3">
                      <HeroMediaUploader onChange={field.onChange} session={uploads} value={{ ...field.value, mediaType: "video" }} />
                    </div>
                  )}
                  {errors.image?.message && <p className="mt-2 text-xs text-red-700" role="alert">{errors.image.message}</p>}
                </div>
              )} />
            </div>
          </div>
          {resolveHeroMediaType(image) === "image" && <div className="space-y-4 border-t border-line pt-5">
            <div>
              <p className="text-xs font-semibold">Large-device banner</p>
              <p className="mt-1 text-[11px] leading-5 text-muted">
                Upload the large banner first. It will be used on small devices too unless you add a separate small-device image.
              </p>
            </div>
            <Controller control={control} name="desktopImage" render={({ field }) => (
              <div>
                <p className="mb-2 text-sm font-medium">Large device banner (16:9)</p>
                <ImageUploader
                  error={errors.desktopImage?.message ?? errors.desktopImage?.url?.message}
                  max={1}
                  onChange={(images: ImageAsset[]) => field.onChange(images[0] ? { ...images[0], mediaType: "image" } : null)}
                  session={uploads}
                  target="hero"
                  showPreview={false}
                  value={field.value ? [{ ...field.value, alt: field.value.alt }] : []}
                />
                {field.value?.url && (
                  <div className="mt-4 grid max-w-3xl items-start gap-4 sm:grid-cols-[minmax(0,1fr)_180px]">
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase text-muted">Large-device preview (16:9)</p>
                      <div className="relative aspect-video overflow-hidden border border-line bg-canvas">
                        <Image alt={field.value.alt || "Large-device banner preview"} className="object-cover" fill sizes="(max-width: 672px) 100vw, 672px" src={field.value.url} />
                      </div>
                    </div>
                    <div>
                      <p className="mb-1 text-[10px] font-bold uppercase text-muted">Small-device fallback (4:5)</p>
                      <div className="relative aspect-[4/5] overflow-hidden border border-line bg-canvas">
                        <Image alt={field.value.alt || "Small-device banner fallback preview"} className="object-cover" fill sizes="180px" src={field.value.url} />
                      </div>
                    </div>
                  </div>
                )}
                {field.value?.url && (
                  <div className="mt-5 border-t border-line pt-4">
                    <p className="text-sm font-medium">Need a different small-device image?</p>
                    {!showMobileUploader && (
                      <button className="mt-2 inline-flex min-h-10 items-center gap-2 border border-ink px-3 text-xs font-bold uppercase" onClick={() => setShowMobileUploader(true)} type="button">
                        <Smartphone size={15} /> Upload small-device banner
                      </button>
                    )}
                  </div>
                )}
              </div>
            )} />
            {desktopImage?.url && showMobileUploader && (
              <Controller control={control} name="mobileImage" render={({ field }) => (
                <div>
                  <p className="mb-2 text-sm font-medium">Optional small-device banner (4:5)</p>
                  <ImageUploader
                    error={errors.mobileImage?.message ?? errors.mobileImage?.url?.message}
                    max={1}
                    onChange={(images: ImageAsset[]) => field.onChange(images[0] ? { ...images[0], mediaType: "image" } : null)}
                    session={uploads}
                    target="hero"
                    showPreview={false}
                    value={field.value ? [{ ...field.value, alt: field.value.alt }] : []}
                  />
                  {field.value?.url && (
                    <div className="mt-3 max-w-[180px]">
                      <p className="mb-1 text-[10px] font-bold uppercase text-muted">Small-device preview (4:5)</p>
                      <div className="relative aspect-[4/5] overflow-hidden border border-line bg-canvas">
                        <Image alt={field.value.alt || "Small-device banner preview"} className="object-cover" fill sizes="180px" src={field.value.url} />
                      </div>
                    </div>
                  )}
                </div>
              )} />
            )}
          </div>}
          {showContent && <div>
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
          </div>}
          <label className="flex items-center gap-2 text-sm"><input {...register("isActive")} className="size-4 accent-[#f2fa18]" type="checkbox" />Active (shown in the carousel)</label>
          <div className="flex flex-wrap gap-3">
            <button className="inline-flex min-h-11 items-center gap-2 border border-ink px-5 text-xs font-bold uppercase hover:bg-canvas disabled:opacity-50" disabled={!previewMedia} onClick={() => setPreviewDevice("large")} type="button"><Monitor size={15} /> Preview banner</button>
            <button aria-busy={isSubmitting} className="inline-flex min-h-11 items-center justify-center bg-brand px-6 text-xs font-bold uppercase disabled:opacity-60" disabled={isSubmitting} type="submit">{isSubmitting ? <LoadingSpinner label="Saving…" /> : slide ? "Save slide" : "Add slide"}</button>
            <button className="min-h-11 border border-line px-6 text-xs font-bold uppercase" onClick={onClose} type="button">Cancel</button>
          </div>
        </form>
      </section>
        {previewDevice && previewMedia && (
        <HeroBannerPreview
          buttons={buttons}
          description={description}
          desktopImage={desktopImage}
          device={previewDevice}
          heading={heading}
          highlightedWord={highlightedWord}
          showContent={showContent}
          image={{ ...previewMedia, mediaType: resolveHeroMediaType(previewMedia) }}
          mobileImage={mobileImage}
          onClose={() => setPreviewDevice(null)}
          onDeviceChange={setPreviewDevice}
          tagline={tagline}
        />
      )}
    </div>
  );
}

export function AdminHeroSlides({ slides }: { slides: HeroSlide[] }) {
  const router = useRouter();
  const [orderedSlides, setOrderedSlides] = useState<HeroSlide[] | null>(null);
  const [editor, setEditor] = useState<{ open: false } | { open: true; slide: HeroSlide | null }>({ open: false });
  const [deleting, setDeleting] = useState<HeroSlide | null>(null);
  const [busy, setBusy] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const displayedSlides = orderedSlides ?? slides;

  function saved(message: string) {
    setOrderedSlides(null);
    setEditor({ open: false });
    setNotice(message);
    router.refresh();
  }

  async function saveSlideOrder(ids: string[]) {
    if (reordering) return;
    const slidesById = new Map(displayedSlides.map((slide) => [slide.id, slide]));
    const reordered = ids.flatMap((id) => {
      const slide = slidesById.get(id);
      return slide ? [slide] : [];
    });
    if (reordered.length !== displayedSlides.length) return;
    setOrderedSlides(reordered.map((slide, displayOrder) => ({ ...slide, displayOrder })));
    setReordering(true);
    setError("");
    try {
      await apiRequest("/api/admin/hero-slides/reorder", {
        method: "PATCH",
        body: JSON.stringify({ ids: reordered.map((slide) => slide.id) }),
      });
      setNotice("Slide order updated.");
      router.refresh();
    } catch (failure) {
      setOrderedSlides(null);
      setError(failure instanceof ApiError ? failure.message : "Could not save the new slide order.");
      router.refresh();
    } finally {
      setReordering(false);
    }
  }

  function reorderSlides(fromId: string, toId: string) {
    const reordered = moveItem(displayedSlides, fromId, toId);
    if (reordered !== displayedSlides) void saveSlideOrder(reordered.map((slide) => slide.id));
  }

  function moveSlideBy(slideId: string, offset: number) {
    const index = displayedSlides.findIndex((slide) => slide.id === slideId);
    const target = displayedSlides[index + offset];
    if (target) void reorderSlides(slideId, target.id);
  }

  async function removeSlide(slide: HeroSlide) {
    setBusy(true);
    setError("");
    try {
      await apiRequest(`/api/admin/hero-slides/${slide.id}`, { method: "DELETE" });
      setOrderedSlides(null);
      setDeleting(null);
      setNotice("Slide deleted. Its media was removed from ImageKit.");
      router.refresh();
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-muted">Homepage</p><h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Hero carousel</h1><p className="mt-2 text-sm text-muted">Manage the slides shown at the top of the homepage. Drag rows or use the arrows to reorder.</p></div><button className="inline-flex min-h-11 items-center gap-2 bg-brand px-5 text-xs font-bold uppercase disabled:opacity-50" disabled={reordering} onClick={() => { setNotice(""); setEditor({ open: true, slide: null }); }} type="button"><Plus size={15} /> New slide</button></div>
      {notice && <p aria-live="polite" className="mt-5 flex items-center gap-2 bg-canvas p-3 text-sm"><Check size={15} />{notice}</p>}
      {displayedSlides.length === 0 ? <p className="mt-6 border border-dashed border-line p-8 text-center text-sm text-muted">No saved slides. The homepage is showing its default slide until you add one.</p> : (
        <SortableTable disabled={reordering} items={displayedSlides.map((slide) => slide.id)} onReorder={(ids) => void saveSlideOrder(ids)}>
          <div className="mt-6 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain no-scrollbar border border-line">
            <table className="w-full min-w-[820px] text-left text-sm">
              <thead className="bg-canvas text-[10px] font-bold uppercase text-muted"><tr><th className="px-2 py-3">Reorder</th><th className="px-4 py-3">Slide</th><th className="px-4 py-3">Tagline</th><th className="px-4 py-3">Media type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
              <tbody>{displayedSlides.map((slide, index) => (
                <SortableTableRow className="border-t border-line hover:bg-canvas/70" disabled={reordering} id={slide.id} key={slide.id}>
                {({ attributes, listeners, setActivatorNodeRef }) => <>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-1">
                    <button
                      {...attributes}
                      {...listeners}
                      className="grid size-9 place-items-center border border-line"
                      aria-label={`Drag to reorder ${slide.heading}`}
                      ref={setActivatorNodeRef}
                      style={{ touchAction: "none" }}
                      type="button"
                    ><GripVertical size={17} /></button>
                    <div className="flex flex-col">
                      <button aria-label={`Move ${slide.heading} up`} className="p-1 text-muted disabled:opacity-30" disabled={reordering || index === 0} onClick={() => moveSlideBy(slide.id, -1)} onPointerDown={(event) => event.stopPropagation()} type="button"><ChevronUp size={14} /></button>
                      <button aria-label={`Move ${slide.heading} down`} className="p-1 text-muted disabled:opacity-30" disabled={reordering || index === displayedSlides.length - 1} onClick={() => moveSlideBy(slide.id, 1)} onPointerDown={(event) => event.stopPropagation()} type="button"><ChevronDown size={14} /></button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="relative h-12 w-20 shrink-0 overflow-hidden bg-canvas">{resolveHeroMediaType(slide.image) === "video" ? <video aria-label={`${slide.heading} video thumbnail`} className="size-full object-cover" muted onLoadedData={(event) => { const video = event.currentTarget; if (Number.isFinite(video.duration) && video.duration > 0) video.currentTime = Math.min(1, video.duration / 2); }} playsInline preload="auto" src={slide.image.url} /> : <Image alt={slide.image.alt || slide.heading} className="object-cover" fill sizes="80px" src={slide.image.url} />}</div><div><p className="font-semibold">{slide.heading}</p><p className="text-xs text-muted">{slide.buttons.map((button) => button.label).join(" · ") || "No buttons"}</p></div></div></td>
                <td className="px-4 py-3">{slide.tagline}</td>
                <td className="px-4 py-3"><span className="text-xs font-semibold uppercase text-muted">{resolveHeroMediaType(slide.image)}</span></td>
                <td className="px-4 py-3"><span className={`px-2 py-1 text-[10px] font-bold uppercase ${slide.isActive ? "bg-brand" : "bg-canvas text-muted"}`}>{slide.isActive ? "Active" : "Inactive"}</span></td>
                <td className="px-4 py-3"><div className="flex justify-end gap-2"><button aria-label={`Edit ${slide.heading}`} className="grid size-9 place-items-center border border-line" disabled={reordering} onClick={() => { setNotice(""); setEditor({ open: true, slide }); }} type="button"><Pencil size={15} /></button><button aria-label={`Delete ${slide.heading}`} className="grid size-9 place-items-center border border-line text-red-700" disabled={reordering} onClick={() => { setError(""); setDeleting(slide); }} type="button"><Trash2 size={15} /></button></div></td>
                </>}
                </SortableTableRow>
            ))}</tbody>
            </table>
          </div>
        </SortableTable>
      )}
      {reordering && <p aria-live="polite" className="mt-3"><LoadingSpinner label="Saving slide order…" /></p>}
      {editor.open && <SlideEditor key={editor.slide?.id ?? "new"} onClose={() => setEditor({ open: false })} onSaved={saved} slide={editor.slide} />}
      {deleting && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <section aria-modal="true" className="w-full max-w-sm bg-paper p-6" role="dialog">
            <p className="text-xs font-bold uppercase text-muted">Please confirm</p>
            <h2 className="mt-2 font-display text-2xl font-semibold">Delete this slide?</h2>
            <p className="mt-2 text-sm text-muted">“{deleting.heading}” and its ImageKit background will be removed.</p>
            {error && <p className="mt-3 text-sm text-red-700" role="alert">{error}</p>}
            <div className="mt-5 flex gap-3">
              <button aria-busy={busy} className="inline-flex min-h-11 items-center justify-center bg-red-700 px-5 text-xs font-bold uppercase text-white disabled:opacity-60" disabled={busy} onClick={() => void removeSlide(deleting)} type="button">
                {busy ? <LoadingSpinner label="Deleting…" /> : "Delete slide"}
              </button>
              <button className="min-h-11 border border-line px-5 text-xs font-bold uppercase" onClick={() => setDeleting(null)} type="button">Cancel</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
