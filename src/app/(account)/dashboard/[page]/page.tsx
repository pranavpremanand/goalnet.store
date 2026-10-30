import { Suspense } from "react";
import { notFound } from "next/navigation";
import { CustomerDashboard } from "@/components/pages/dashboard/CustomerDashboard";

const dashboardPages = ["dashboard", "my-orders", "favorites", "message", "settings", "edit-profile", "shipping", "support-ticket"];

export function generateStaticParams() {
  return dashboardPages.map((page) => ({ page }));
}

async function DashboardRoute({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (!dashboardPages.includes(page)) notFound();
  return <CustomerDashboard page={page} />;
}

export default function Page({ params }: { params: Promise<{ page: string }> }) {
  return <Suspense><DashboardRoute params={params} /></Suspense>;
}