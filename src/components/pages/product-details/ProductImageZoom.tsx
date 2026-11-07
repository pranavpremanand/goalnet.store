"use client";

import { useRef, useState, type PointerEvent, type ReactNode } from "react";
import Image from "next/image";

const ZOOM = 2.5;
const PANE_GAP = 56;
const MIN_PANE = 280;

type Zoom = { x: number; y: number; lens: number; pane: number; width: number; height: number };
type ProductImage = { src: string; alt: string };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Hover a square lens over the image; the lens area appears magnified in a pane on the right.
export function ProductImageZoom({
  images,
  activeIndex,
  onActiveIndexChange,
  children,
}: {
  images: ProductImage[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
  children?: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const pointerStart = useRef<{ x: number; y: number } | null>(null);
  const [zoom, setZoom] = useState<Zoom | null>(null);
  const currentImage = images[activeIndex];

  function track(event: React.MouseEvent) {
    const frame = frameRef.current;
    if (!frame) return;
    const rect = frame.getBoundingClientRect();
    // The pane sits over the product details, so it can only be as wide as the room to the right of the image.
    const pane = Math.min(rect.width, window.innerWidth - rect.right - PANE_GAP - 24);
    if (pane < MIN_PANE) {
      setZoom(null);
      return;
    }
    const lens = pane / ZOOM;
    setZoom({
      x: clamp(event.clientX - rect.left - lens / 2, 0, rect.width - lens),
      y: clamp(event.clientY - rect.top - lens / 2, 0, rect.height - lens),
      lens,
      pane,
      width: rect.width,
      height: rect.height,
    });
  }

  function startSwipe(event: PointerEvent<HTMLDivElement>) {
    pointerStart.current = event.pointerType === "touch"
      ? { x: event.clientX, y: event.clientY }
      : null;
    if (event.pointerType === "touch") event.currentTarget.setPointerCapture(event.pointerId);
  }

  function endSwipe(event: PointerEvent<HTMLDivElement>) {
    const start = pointerStart.current;
    pointerStart.current = null;
    if (!start) return;

    const deltaX = event.clientX - start.x;
    const deltaY = event.clientY - start.y;
    if (Math.abs(deltaX) < 45 || Math.abs(deltaX) <= Math.abs(deltaY)) return;

    setZoom(null);
    onActiveIndexChange(clamp(activeIndex + (deltaX < 0 ? 1 : -1), 0, images.length - 1));
  }

  return (
    <div className="relative">
      <div
        className="relative aspect-[4/5] overflow-hidden bg-canvas touch-pan-y lg:cursor-crosshair"
        onMouseEnter={track}
        onMouseLeave={() => setZoom(null)}
        onMouseMove={track}
        onPointerCancel={() => { pointerStart.current = null; }}
        onPointerDown={startSwipe}
        onPointerUp={endSwipe}
        ref={frameRef}
      >
        <div
          className="flex h-full transition-transform duration-300 ease-out motion-reduce:transition-none"
          style={{ transform: `translateX(-${activeIndex * 100}%)` }}
        >
          {images.map((image, index) => (
            <div className="relative h-full min-w-full" key={`${image.src}-${index}`}>
              <Image
                alt={image.alt}
                className="object-cover"
                fill
                priority={index === 0}
                quality={90}
                sizes="(max-width: 1024px) 100vw, 55vw"
                src={image.src}
              />
            </div>
          ))}
        </div>
        {children}
        {zoom && currentImage && <div aria-hidden="true" className="pointer-events-none absolute z-20 hidden border border-ink bg-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.7)] lg:block" style={{ left: zoom.x, top: zoom.y, width: zoom.lens, height: zoom.lens }} />}
      </div>
      {zoom && currentImage && (
         <div aria-hidden="true" className="zoom-pane-enter pointer-events-none absolute top-1/2 -translate-y-1/2 z-30 hidden overflow-hidden border border-line bg-paper shadow-2xl lg:block" style={{ left: zoom.width + PANE_GAP, width: zoom.pane, height: zoom.pane}}>
          <div className="absolute left-0 top-0" style={{ width: zoom.width * ZOOM, height: zoom.height * ZOOM, transform: `translate(${-zoom.x * ZOOM}px, ${-zoom.y * ZOOM}px)` }}>
            <Image alt="" className="object-cover" fill quality={90} sizes="1600px" src={currentImage.src} />
          </div>
        </div>
      )}
    </div>
  );
}
