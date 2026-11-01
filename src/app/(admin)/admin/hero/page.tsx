import { Suspense } from "react";
import { AdminHeroSlides } from "@/components/pages/admin/AdminHeroSlides";
import { requireAdminPage } from "@/server/auth/current-user";
import * as heroSlideService from "@/server/services/hero-slide.service";

export const metadata = { title: "Hero carousel | GoalNet Admin" };

async function HeroSlidesPage() {
  await requireAdminPage();
  return <AdminHeroSlides slides={await heroSlideService.listHeroSlides()} />;
}

export default function Page() {
  return <Suspense fallback={<div aria-busy="true" className="min-h-[40vh] text-sm text-muted">Loading hero slides…</div>}><HeroSlidesPage /></Suspense>;
}
