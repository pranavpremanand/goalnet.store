"use client";

import { useRef, useState, type ReactNode } from "react";
import Image from "next/image";

const ZOOM = 2.5;
const PANE_GAP = 56;
const MIN_PANE = 280;

type Zoom = { x: number; y: number; lens: number; pane: number; width: number; height: number };

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

// Hover a square lens over the image; the lens area appears magnified in a pane on the right.
export function ProductImageZoom({ src, alt, children }: { src: string; alt: string; children?: ReactNode }) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState<Zoom | null>(null);

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

  return (
    <div className="relative">
      <div className="relative aspect-[4/4.3] overflow-hidden bg-canvas sm:aspect-[1.05/1] lg:cursor-crosshair" onMouseEnter={track} onMouseLeave={() => setZoom(null)} onMouseMove={track} ref={frameRef}>
        <Image alt={alt} className="object-cover" fill priority sizes="(max-width: 1024px) 100vw, 55vw" src={src} />
        {children}
        {zoom && <div aria-hidden="true" className="pointer-events-none absolute z-20 hidden border border-ink bg-white/25 shadow-[0_0_0_1px_rgba(255,255,255,0.7)] lg:block" style={{ left: zoom.x, top: zoom.y, width: zoom.lens, height: zoom.lens }} />}
      </div>
      {zoom && (
        <div aria-hidden="true" className="zoom-pane-enter pointer-events-none absolute top-0 z-30 hidden overflow-hidden border border-line bg-paper shadow-2xl lg:block" style={{ left: zoom.width + PANE_GAP, width: zoom.pane, height: zoom.pane }}>
          <div className="absolute left-0 top-0" style={{ width: zoom.width * ZOOM, height: zoom.height * ZOOM, transform: `translate(${-zoom.x * ZOOM}px, ${-zoom.y * ZOOM}px)` }}>
            <Image alt="" className="object-cover" fill quality={90} sizes="1600px" src={src} />
          </div>
        </div>
      )}
    </div>
  );
}
