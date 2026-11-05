import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { CustomerDashboard } from "@/components/pages/dashboard/CustomerDashboard";
import { getCurrentUser } from "@/server/auth/current-user";
import { findUserById } from "@/server/repositories/user.repository";
import { listCustomerTickets } from "@/server/services/ticket.service";
import { listMyOrders } from "@/server/services/order.service";
import { listFeaturedProducts, listStoreProductsByIds } from "@/server/services/storefront.service";

const dashboardPages = ["dashboard", "my-orders", "favorites", "settings", "edit-profile", "shipping", "support-ticket"];

export function generateStaticParams() {
  return dashboardPages.map((page) => ({ page }));
}

async function DashboardRoute({ params }: { params: Promise<{ page: string }> }) {
  const { page } = await params;
  if (!dashboardPages.includes(page)) notFound();

  const auth = await getCurrentUser();
  if (!auth) redirect("/login");

  const [user, placedOrders, tickets, suggestedProducts] = await Promise.all([
    findUserById(auth.id),
    listMyOrders(auth.id),
    listCustomerTickets(auth.id),
    listFeaturedProducts(4).catch(() => []),
  ]);

  const resolvedUser = user ?? {
    id: auth.id,
    name: auth.name,
    email: auth.email,
    phone: auth.phone ?? "",
    role: auth.role,
    hasPassword: auth.hasPassword ?? true,
    isGoogleUser: auth.isGoogleUser ?? false,
    addresses: auth.addresses ?? [],
    favorites: auth.favorites ?? [],
    createdAt: auth.createdAt ?? new Date().toISOString(),
  };

  const favoriteProducts = resolvedUser.favorites.length > 0
    ? await listStoreProductsByIds(resolvedUser.favorites).catch(() => [])
    : [];

  return (
    <CustomerDashboard
      favoriteProducts={favoriteProducts}
      initialTickets={tickets}
      key={page}
      page={page}
      placedOrders={placedOrders}
      suggestedProducts={suggestedProducts}
      user={resolvedUser}
    />
  );
}

export default function Page({ params }: { params: Promise<{ page: string }> }) {
  return (
    <Suspense>
      <DashboardRoute params={params} />
    </Suspense>
  );
}
