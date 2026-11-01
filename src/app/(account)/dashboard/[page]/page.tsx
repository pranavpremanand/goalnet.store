import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CustomerDashboard } from "@/components/pages/dashboard/CustomerDashboard";
import { listFeaturedProducts } from "@/server/services/storefront.service";

const dashboardPages = ["dashboard", "my-orders", "favorites", "message", "settings", "edit-profile", "shipping", "support-ticket"];

export function generateStaticParams() {
  return dashboardPages.map((page) => ({ page }));
}

async function DashboardRoute({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (!dashboardPages.includes(page)) notFound();
  // Suggestions are only a nicety, so a database hiccup must not break the account area.
  const suggestedProducts = await listFeaturedProducts(3).catch(() => []);
  return <CustomerDashboard page={page} suggestedProducts={suggestedProducts} />;
}

export default function Page({ params }: { params: Promise<{ page: string }> }) {
  return <Suspense><DashboardRoute params={params} /></Suspense>;
}