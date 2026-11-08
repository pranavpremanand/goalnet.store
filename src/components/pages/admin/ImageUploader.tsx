"use client";

import { useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import Image from "next/image";
import { LuImagePlus as ImagePlus, LuLoaderCircle as Loader, LuStar as Star, LuTrash2 as Trash2 } from "react-icons/lu";
import { IMAGE_MIME_TYPES } from "@/lib/catalog-constants";
import { uploadImage } from "@/lib/admin-api";
import type { CroppableImageAsset } from "@/lib/types/catalog";
import type { UploadTarget } from "@/lib/validation/catalog";
import type { UploadSession } from "@/components/pages/admin/useUploadSession";

type ImageUploaderProps = {
  target: UploadTarget;
  value: CroppableImageAsset[];
  onChange: (images: CroppableImageAsset[]) => void;
  max: number;
  session: UploadSession;
  error?: string;
  showCropPosition?: boolean;
  showPreview?: boolean;
};

function getCropSelection(imageAspect: number, x: number, y: number) {
  const imageWidth = imageAspect >= 1 ? 100 : imageAspect * 100;
  const imageHeight = imageAspect >= 1 ? 100 / imageAspect : 100;
  const imageLeft = (100 - imageWidth) / 2;
  const imageTop = (100 - imageHeight) / 2;
  const cropWidth = Math.min(imageWidth, imageHeight * 0.8);
  const cropHeight = cropWidth / 0.8;
  const horizontalTravel = imageWidth - cropWidth;
  const verticalTravel = imageHeight - cropHeight;

  return {
    left: imageLeft + horizontalTravel * x / 100,
    top: imageTop + verticalTravel * y / 100,
    width: cropWidth,
    height: cropHeight,
    horizontalTravel,
    verticalTravel,
  };
}

export function ImageUploader({ target, value, onChange, max, session, error, showCropPosition = false, showPreview = true }: ImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cropDragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startX: number;
    startY: number;
    horizontalTravel: number;
    verticalTravel: number;
    stageSize: number;
    index: number;
  } | null>(null);
  const [cropImageAspects, setCropImageAspects] = useState<Record<string, number>>({});
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

  function updateCropPosition(index: number, axis: "x" | "y", position: number) {
    onChange(value.map((image, imageIndex) => (
      imageIndex === index
        ? {
            ...image,
            cropPosition: {
              x: image.cropPosition?.x ?? 50,
              y: image.cropPosition?.y ?? 50,
              [axis]: position,
            },
          }
        : image
    )));
  }

  function startCropDrag(index: number, event: ReactPointerEvent<HTMLDivElement>) {
    if (!showCropPosition || event.button !== 0) return;
    const frame = event.currentTarget;
    const stage = frame.parentElement;
    const imageAspect = cropImageAspects[value[index].fileId];
    if (!stage || !imageAspect) return;
    const bounds = stage.getBoundingClientRect();
    const selection = getCropSelection(imageAspect, value[index].cropPosition?.x ?? 50, value[index].cropPosition?.y ?? 50);

    cropDragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startX: value[index].cropPosition?.x ?? 50,
      startY: value[index].cropPosition?.y ?? 50,
      horizontalTravel: selection.horizontalTravel,
      verticalTravel: selection.verticalTravel,
      stageSize: bounds.width,
      index,
    };
    frame.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function moveCrop(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = cropDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (drag.horizontalTravel > 0) {
      updateCropPosition(
        drag.index,
        "x",
        Math.max(0, Math.min(100, drag.startX + ((event.clientX - drag.startClientX) / (drag.stageSize * drag.horizontalTravel / 100)) * 100)),
      );
    }
    if (drag.verticalTravel > 0) {
      updateCropPosition(
        drag.index,
        "y",
        Math.max(0, Math.min(100, drag.startY + ((event.clientY - drag.startClientY) / (drag.stageSize * drag.verticalTravel / 100)) * 100)),
      );
    }
  }

  function endCropDrag(event: ReactPointerEvent<HTMLDivElement>) {
    if (cropDragRef.current?.pointerId === event.pointerId) cropDragRef.current = null;
  }

  function nudgeCrop(index: number, axis: "x" | "y", amount: number) {
    const current = value[index].cropPosition?.[axis] ?? 50;
    updateCropPosition(index, axis, Math.max(0, Math.min(100, current + amount)));
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
        {value.map((image, index) => {
          const imageAspect = cropImageAspects[image.fileId];
          const selection = showCropPosition && imageAspect
            ? getCropSelection(imageAspect, image.cropPosition?.x ?? 50, image.cropPosition?.y ?? 50)
            : null;
          return (
          <li className="border border-line p-2" key={image.fileId}>
            {showPreview && (
              <div className={`relative bg-canvas ${showCropPosition ? "mx-auto aspect-square w-full max-w-xs overflow-hidden" : "aspect-4/5 overflow-hidden"}`}>
                <Image
                  alt={image.alt || "Uploaded image"}
                  className={showCropPosition ? "object-contain" : "object-cover"}
                  fill
                  onLoad={(event) => {
                    if (showCropPosition) {
                      const { naturalHeight, naturalWidth } = event.currentTarget;
                      setCropImageAspects((current) => ({ ...current, [image.fileId]: naturalWidth / naturalHeight }));
                    }
                  }}
                  sizes="240px"
                  src={image.url}
                  style={!showCropPosition ? { objectPosition: `${image.cropPosition?.x ?? 50}% ${image.cropPosition?.y ?? 50}%` } : undefined}
                />
                {selection && (
                  <div
                    aria-label="Crop selection. The area outside this frame is dimmed. Drag the frame to change the crop."
                    className="absolute touch-none cursor-grab border-2 border-white shadow-[0_0_0_9999px_rgba(0,0,0,0.55)] outline-none active:cursor-grabbing"
                    onKeyDown={(event) => {
                      const step = event.shiftKey ? 5 : 1;
                      if (event.key === "ArrowLeft") nudgeCrop(index, "x", -step);
                      else if (event.key === "ArrowRight") nudgeCrop(index, "x", step);
                      else if (event.key === "ArrowUp") nudgeCrop(index, "y", -step);
                      else if (event.key === "ArrowDown") nudgeCrop(index, "y", step);
                      else return;
                      event.preventDefault();
                    }}
                    onLostPointerCapture={endCropDrag}
                    onPointerCancel={endCropDrag}
                    onPointerDown={(event) => startCropDrag(index, event)}
                    onPointerMove={moveCrop}
                    onPointerUp={endCropDrag}
                    role="group"
                    style={{
                      left: `${selection.left}%`,
                      top: `${selection.top}%`,
                      width: `${selection.width}%`,
                      height: `${selection.height}%`,
                    }}
                    tabIndex={0}
                  />
                )}
              </div>
            )}
            <input aria-label="Image description" className="mt-2 w-full border border-line px-2 py-1.5 text-xs outline-none focus:border-ink" maxLength={200} onChange={(event) => updateAlt(index, event.target.value)} placeholder="Short description (alt text)" value={image.alt} />
            {showCropPosition && (
              <p className="mt-2 text-[11px] text-muted">Drag the crop frame to position it. The bright area is saved as the cover. Use arrow keys for fine adjustments.</p>
            )}
            <div className="mt-2 flex items-center justify-between text-[10px] font-bold uppercase">
              {!single && (index === 0 ? <span className="inline-flex items-center gap-1 text-muted"><Star size={12} /> Main</span> : <button className="underline" onClick={() => makeMain(index)} type="button">Make main</button>)}
              <button aria-label="Remove image" className="ml-auto inline-flex items-center gap-1 text-red-700" onClick={() => removeImage(index)} type="button"><Trash2 size={13} /> Remove</button>
            </div>
          </li>
          );
        })}
        {showPreview && Array.from({ length: uploading }, (_, index) => (
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
