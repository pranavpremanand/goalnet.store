import { Suspense } from "react";
import { OrderLookupPage } from "@/components/pages/orders/OrderStatusPage";
import { getCurrentUser } from "@/server/auth/current-user";

export const metadata = { title: "Order Status | GoalNet" };

async function OrderStatusLookup() {
  const user = await getCurrentUser();
  return <OrderLookupPage isAuthenticated={Boolean(user)} />;
}

export default function Page() {
  return (
    <Suspense fallback={<main className="mx-auto min-h-[60vh] max-w-xl px-5 py-12 text-sm text-muted">Loading order tracking…</main>}>
      <OrderStatusLookup />
    </Suspense>
  );
}
