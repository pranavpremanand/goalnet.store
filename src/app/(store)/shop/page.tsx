import { Suspense } from "react";
import { ShopPage } from "@/components/pages/shop/ShopPage";

export const metadata = { title: "Shop Jerseys | Play On" };

export default function Page() {
  return <Suspense fallback={<main className="mx-auto min-h-[60vh] max-w-[1440px] px-5 py-12 text-sm text-muted">Loading collection…</main>}><ShopPage /></Suspense>;
}