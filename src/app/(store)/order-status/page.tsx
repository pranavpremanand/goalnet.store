import { Suspense } from "react";
import { ContentLoadingSkeleton } from "@/components/common/Loading";
import { OrderLookupPage } from "@/components/pages/orders/OrderStatusPage";
import { getCurrentUser } from "@/server/auth/current-user";

export const metadata = { title: "Order Status | GoalNet" };

async function OrderStatusLookup() {
  const user = await getCurrentUser();
  return <OrderLookupPage isAuthenticated={Boolean(user)} />;
}

export default function Page() {
  return (
    <Suspense fallback={<ContentLoadingSkeleton />}>
      <OrderStatusLookup />
    </Suspense>
  );
}
