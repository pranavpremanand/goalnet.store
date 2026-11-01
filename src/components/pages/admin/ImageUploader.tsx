"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { LuImagePlus as ImagePlus, LuLoaderCircle as Loader, LuStar as Star, LuTrash2 as Trash2 } from "react-icons/lu";
import { IMAGE_MIME_TYPES } from "@/lib/catalog-constants";
import { uploadImage } from "@/lib/admin-api";
import type { ImageAsset } from "@/lib/types/catalog";
import type { UploadTarget } from "@/lib/validation/catalog";
import type { UploadSession } from "@/components/pages/admin/useUploadSession";

type ImageUploaderProps = {
  target: UploadTarget;
  value: ImageAsset[];
  onChange: (images: ImageAsset[]) => void;
  max: number;
  session: UploadSession;
  error?: string;
};

export function ImageUploader({ target, value, onChange, max, session, error }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState("");
  const single = max === 1;
  const full = value.length >= max;

  async function handleFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploadError("");

    const selected = Array.from(files).slice(0, max - value.length);
    setUploading(selected.length);
    const results = await Promise.allSettled(selected.map((file) => uploadImage(file, target)));
    setUploading(0);

    const uploaded = results.flatMap((result) => (result.status === "fulfilled" ? [result.value] : []));
    const failure = results.find((result): result is PromiseRejectedResult => result.status === "rejected");
    if (failure) setUploadError(failure.reason instanceof Error ? failure.reason.message : "The image upload failed. Please try again.");
    uploaded.forEach((image) => session.track(image.fileId));
    if (uploaded.length) onChange(single ? uploaded.slice(0, 1) : [...value, ...uploaded]);
    if (inputRef.current) inputRef.current.value = "";
  }

  function updateAlt(index: number, alt: string) {
    onChange(value.map((image, imageIndex) => (imageIndex === index ? { ...image, alt } : image)));
  }

  function removeImage(index: number) {
    session.release(value[index].fileId);
    onChange(value.filter((_, imageIndex) => imageIndex !== index));
  }

  function makeMain(index: number) {
    onChange([value[index], ...value.filter((_, imageIndex) => imageIndex !== index)]);
  }

  return (
    <div>
      <ul className={`grid gap-3 ${single ? "max-w-xs" : "grid-cols-2 sm:grid-cols-3"}`}>
        {value.map((image, index) => (
          <li className="border border-line p-2" key={image.fileId}>
            <div className="relative aspect-4/5 bg-canvas"><Image alt={image.alt || "Uploaded image"} className="object-cover" fill sizes="240px" src={image.url} /></div>
            <input aria-label="Image description" className="mt-2 w-full border border-line px-2 py-1.5 text-xs outline-none focus:border-ink" maxLength={200} onChange={(event) => updateAlt(index, event.target.value)} placeholder="Short description (alt text)" value={image.alt} />
            <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase">
              {!single && (index === 0 ? <span className="inline-flex items-center gap-1 text-muted"><Star size={12} /> Main</span> : <button className="underline" onClick={() => makeMain(index)} type="button">Make main</button>)}
              <button aria-label="Remove image" className="ml-auto inline-flex items-center gap-1 text-red-700" onClick={() => removeImage(index)} type="button"><Trash2 size={13} /> Remove</button>
            </div>
          </li>
        ))}
        {Array.from({ length: uploading }, (_, index) => (
          <li className="grid aspect-4/5 place-items-center border border-dashed border-line text-xs text-muted" key={`uploading-${index}`}><Loader className="animate-spin" size={20} /><span className="sr-only">Uploading</span></li>
        ))}
      </ul>
      {!full && (
        <label className={`mt-3 inline-flex min-h-11 cursor-pointer items-center gap-2 border border-ink px-4 text-xs font-bold uppercase hover:bg-canvas ${uploading ? "pointer-events-none opacity-60" : ""}`}>
          <ImagePlus size={16} />{single ? "Upload image" : "Upload images"}
          <input accept={IMAGE_MIME_TYPES.join(",")} className="sr-only" multiple={!single} onChange={(event) => void handleFiles(event.target.files)} ref={inputRef} type="file" />
        </label>
      )}
      <p className="mt-2 text-[11px] text-muted">JPG, PNG or WebP, up to 5 MB each{single ? "." : `, up to ${max} images. The first image is the main one.`}</p>
      {(uploadError || error) && <p className="mt-2 text-xs text-red-700" role="alert">{uploadError || error}</p>}
    </div>
  );
}
