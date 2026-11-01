import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import type { HeroSlideRecord } from "@/server/repositories/hero-slide.repository";
import { HeroCarousel } from "@/components/pages/home/HeroCarousel";
import { listActiveHeroSlides } from "@/server/services/hero-slide.service";

async function HeroSlides() {
  let slides: HeroSlideRecord[] = [];
  try {
    slides = await listActiveHeroSlides();
  } catch (error) {
    unstable_rethrow(error);
    console.error("Could not load homepage hero slides", error);
  }
  return <HeroCarousel slides={slides} />;
}

export function HomeHero() {
  return (
    <Suspense fallback={<div aria-busy="true" className="min-h-[670px] bg-charcoal md:min-h-[760px]" />}>
      <HeroSlides />
    </Suspense>
  );
}
