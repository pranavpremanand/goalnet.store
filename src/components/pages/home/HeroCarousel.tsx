"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import {
  LuArrowDown as ArrowDown,
  LuArrowLeft as ArrowLeft,
  LuArrowRight as ArrowRight,
  LuPause as Pause,
  LuPlay as Play,
} from "react-icons/lu";
import { resolveHeroMediaType, type HeroMedia, type HeroSlide } from "@/lib/types/hero";

const DEFAULT_SLIDE: HeroSlide = {
  id: "default-home-hero",
  tagline: "Football is never just a game",
  heading: "Every legend has a beginning.",
  highlightedWord: "beginning.",
  description:
    "Wear the colors that carry a story. Find your team, your era, and the pieces that tell your story.",
  showContent: true,
  image: {
    url: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=2200&q=90",
    fileId: "default-home-hero",
    mediaType: "image",
    alt: "Football match in a packed stadium",
  },
  buttons: [
    { label: "Shop now", href: "/shop", style: "primary" },
    { label: "Our story", href: "/about-us", style: "secondary" },
  ],
  isActive: true,
  displayOrder: 0,
};

function HeroMediaLayer({
  media,
  mobileImage,
  desktopImage,
  alt,
  className,
  showContent,
  decorative = false,
}: {
  media: HeroMedia;
  mobileImage?: HeroMedia | null;
  desktopImage?: HeroMedia | null;
  alt: string;
  className: string;
  showContent: boolean;
  decorative?: boolean;
}) {
  if (resolveHeroMediaType(media) === "video") {
    return (
      <div className={`absolute inset-0 z-0 ${className}`}>
        <video
          aria-hidden={decorative}
          autoPlay
          className="absolute inset-0 size-full object-cover object-center"
          key={media.fileId}
          loop
          muted
          playsInline
          preload="auto"
          src={media.url}
        />
        {mobileImage && (
          <Image
            alt={decorative ? "" : mobileImage.alt || alt}
            aria-hidden={decorative}
            className="object-cover md:hidden"
            fill
            quality={90}
            sizes="100vw"
            src={mobileImage.url}
          />
        )}
        {desktopImage && (
          <Image
            alt={decorative ? "" : desktopImage.alt || alt}
            aria-hidden={decorative}
            className="hidden object-cover md:block"
            fill
            quality={90}
            sizes="100vw"
            src={desktopImage.url}
          />
        )}
      </div>
    );
  }

  return (
    <div className={`absolute inset-0 z-0 ${className}`}>
      <picture className="absolute inset-0">
        {mobileImage && <source media="(max-width: 767px)" srcSet={mobileImage.url} />}
        {desktopImage && <source media="(min-width: 768px)" srcSet={desktopImage.url} />}
        <Image
          alt={decorative ? "" : alt}
          aria-hidden={decorative}
          className={`object-cover ${showContent ? "object-right lg:object-center" : "object-center"}`}
          fill
          key={media.fileId}
          priority
          quality={90}
          sizes="100vw"
          src={media.url}
        />
      </picture>
    </div>
  );
}

export function HeroCarousel({ slides: savedSlides }: { slides: HeroSlide[] }) {
  const slides = savedSlides.length > 0 ? savedSlides : [DEFAULT_SLIDE];
  const [active, setActive] = useState(0);
  const [transition, setTransition] = useState<{
    previous: HeroSlide;
    direction: "left" | "right";
    id: number;
  } | null>(null);
  const [paused, setPaused] = useState(false);
  const transitionId = useRef(0);
  const [pointerStart, setPointerStart] = useState<{
    id: number;
    x: number;
    y: number;
  } | null>(null);
  const slide = slides[active] ?? slides[0];
  const highlightIndex = slide.heading
    .toLocaleLowerCase()
    .indexOf(slide.highlightedWord.toLocaleLowerCase());
  const hasHighlight = Boolean(slide.highlightedWord) && highlightIndex >= 0;

  const changeSlide = useCallback((index: number, direction: "left" | "right") => {
    if (index === active) return;
    setTransition({ previous: slide, direction, id: ++transitionId.current });
    setActive(index);
  }, [active, slide]);

  useEffect(() => {
    if (!transition) return;
    const timer = window.setTimeout(() => setTransition(null), 850);
    return () => window.clearTimeout(timer);
  }, [transition]);

  useEffect(() => {
    if (
      slides.length < 2 ||
      paused ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const timer = window.setInterval(
      () => changeSlide((active + 1) % slides.length, "left"),
      10000,
    );
    return () => window.clearInterval(timer);
  }, [active, changeSlide, paused, slides.length]);

  function move(direction: -1 | 1) {
    changeSlide(
      (active + direction + slides.length) % slides.length,
      direction === 1 ? "left" : "right",
    );
  }

  function chooseSlide(index: number) {
    const forward = (index - active + slides.length) % slides.length;
    const backward = (active - index + slides.length) % slides.length;
    changeSlide(index, forward <= backward ? "left" : "right");
  }

  function pointerDown(event: PointerEvent<HTMLElement>) {
    if (event.pointerType === "mouse" || slides.length < 2) return;
    setPointerStart({
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    });
  }

  function pointerUp(event: PointerEvent<HTMLElement>) {
    if (!pointerStart || pointerStart.id !== event.pointerId) return;
    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    if (Math.abs(deltaX) > 48 && Math.abs(deltaX) > Math.abs(deltaY) * 1.2)
      move(deltaX < 0 ? 1 : -1);
    setPointerStart(null);
  }

  return (
    <section
      aria-label="Featured stories"
      aria-roledescription="carousel"
      className="relative isolate min-h-[670px] touch-pan-y overflow-hidden bg-charcoal text-white md:min-h-[760px]"
      onPointerCancel={() => setPointerStart(null)}
      onPointerDown={pointerDown}
      onPointerUp={pointerUp}
    >
      {transition && (
        <HeroMediaLayer
          alt=""
          className={`hero-media-swipe-out-${transition.direction}`}
          decorative
          key={`${transition.id}-out`}
          media={transition.previous.image}
          mobileImage={transition.previous.mobileImage}
          desktopImage={transition.previous.desktopImage}
          showContent={transition.previous.showContent}
        />
      )}
      <HeroMediaLayer
        alt={slide.image.alt || ""}
        className={transition ? `hero-media-swipe-in-${transition.direction}` : ""}
        key={slide.id}
        media={slide.image}
        mobileImage={slide.mobileImage}
        desktopImage={slide.desktopImage}
        showContent={slide.showContent}
      />
      {slide.showContent && (
        <div
          aria-hidden="true"
          className="absolute inset-0 z-10 bg-gradient-to-r from-black/60 via-black/30 to-black/10"
        />
      )}
      <div className="relative z-20 mx-auto flex min-h-[670px] max-w-[1440px] flex-col justify-center px-5 pb-28 pt-16 sm:px-8 md:min-h-[760px] lg:px-14">
        {slide.showContent && (
          <div
            aria-live="polite"
            className={`relative z-10 max-w-[720px] ${transition ? `hero-content-swipe-in-${transition.direction}` : ""}`}
            key={slide.id}
          >
            {slide.tagline && (
              <p className="hero-text-stroke mb-6 flex items-center gap-3 text-xs font-bold uppercase text-brand sm:text-sm">
                <span className="h-px w-9 bg-brand" />
                {slide.tagline}
              </p>
            )}
            {slide.heading && (
              <h1 className="hero-text-stroke font-display text-[2.8rem] font-semibold !leading-[1.2] md:!leading-tight sm:text-6xl md:text-7xl">
                {hasHighlight ? (
                  <>
                    {slide.heading.slice(0, highlightIndex)}
                    <span className="inline-block bg-brand px-2 py-0.5 text-ink">
                      {slide.heading.slice(
                        highlightIndex,
                        highlightIndex + slide.highlightedWord.length,
                      )}
                    </span>
                    {slide.heading.slice(
                      highlightIndex + slide.highlightedWord.length,
                    )}
                  </>
                ) : (
                  slide.heading
                )}
              </h1>
            )}
            {slide.description && (
              <p className="hero-text-stroke mt-7 max-w-md font-copy text-sm leading-7 text-white/90 sm:text-base">
                {slide.description}
              </p>
            )}
            {slide.buttons.length > 0 && (
              <div className="mt-8 flex flex-wrap items-center gap-4">
                {slide.buttons.map((button, index) => (
                  <Link
                    className={
                      button.style === "primary"
                        ? "inline-flex min-h-12 items-center gap-3 bg-brand px-6 text-sm font-bold uppercase text-ink transition hover:bg-[#d8df0d]"
                        : "inline-flex min-h-12 items-center gap-2 border border-white/65 px-5 text-sm font-semibold text-white transition hover:border-brand hover:text-brand"
                    }
                    href={button.href}
                    key={`${button.href}-${index}`}
                  >
                    {button.label}
                    {button.style === "primary" ? (
                      <ArrowRight size={17} />
                    ) : (
                      <ArrowDown className="rotate-[-45deg]" size={16} />
                    )}
                  </Link>
                ))}
              </div>
            )}
            </div>
        )}
        <div className="absolute bottom-5 left-5 right-5 z-20 flex items-center justify-between gap-4 sm:left-8 sm:right-8 lg:left-14 lg:right-14">
          <div className="hidden items-center gap-3 text-[10px] font-semibold uppercase text-white/75 sm:flex">
            <ArrowDown aria-hidden="true" size={16} />
            Scroll to find your colors
          </div>
          {slides.length > 1 && (
            <div
              aria-label="Carousel controls"
              className="ml-auto flex items-center gap-2"
              role="group"
            >
              <button
                aria-label="Previous slide"
                className="grid size-10 place-items-center border border-white/45 bg-black/20 text-white transition hover:border-brand hover:bg-brand hover:text-ink"
                onClick={() => move(-1)}
                type="button"
              >
                <ArrowLeft size={18} />
              </button>
              <div
                className="flex items-center gap-1.5 px-1"
                role="group"
                aria-label="Choose a slide"
              >
                {slides.map((item, index) => (
                  <button
                    aria-current={active === index ? "true" : undefined}
                    aria-label={`Go to slide ${index + 1}: ${item.heading}`}
                    className={`h-2.5 transition-all ${active === index ? "w-8 bg-brand rounded-xl" : "w-2.5 rounded-full bg-white/60 hover:bg-white"}`}
                    key={item.id}
                    onClick={() => chooseSlide(index)}
                    type="button"
                  />
                ))}
              </div>
              <button
                aria-label={paused ? "Play carousel" : "Pause carousel"}
                aria-pressed={paused}
                className="grid size-10 place-items-center border border-white/45 bg-black/20 text-white transition hover:border-brand hover:bg-brand hover:text-ink"
                onClick={() => setPaused((value) => !value)}
                type="button"
              >
                {paused ? <Play size={16} /> : <Pause size={16} />}
              </button>
              <button
                aria-label="Next slide"
                className="grid size-10 place-items-center border border-white/45 bg-black/20 text-white transition hover:border-brand hover:bg-brand hover:text-ink"
                onClick={() => move(1)}
                type="button"
              >
                <ArrowRight size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
