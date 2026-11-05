import { Suspense } from "react";
import { unstable_rethrow } from "next/navigation";
import type { HeroSlideRecord } from "@/server/repositories/hero-slide.repository";
import { SkeletonBlock } from "@/components/common/Loading";
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
    <Suspense fallback={<section aria-busy="true" aria-label="Loading featured story" className="min-h-[670px] space-y-5 bg-charcoal px-5 py-40 md:min-h-[760px] md:px-14"><SkeletonBlock className="h-4 w-40 bg-white/15" /><SkeletonBlock className="h-16 w-full max-w-2xl bg-white/15" /><SkeletonBlock className="h-4 w-full max-w-md bg-white/15" /><SkeletonBlock className="h-12 w-36 bg-white/15" /></section>}>
      <HeroSlides />
    </Suspense>
  );
}
