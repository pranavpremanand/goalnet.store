import { Suspense } from "react";
import { AdminLoadingSkeleton } from "@/components/common/Loading";
import { AdminHeroSlides } from "@/components/pages/admin/AdminHeroSlides";
import { requireAdminPage } from "@/server/auth/current-user";
import * as heroSlideService from "@/server/services/hero-slide.service";

export const metadata = { title: "Hero carousel | GoalNet Admin" };

async function HeroSlidesPage() {
  await requireAdminPage();
  return <AdminHeroSlides slides={await heroSlideService.listHeroSlides()} />;
}

export default function Page() {
  return <Suspense fallback={<AdminLoadingSkeleton />}><HeroSlidesPage /></Suspense>;
}
