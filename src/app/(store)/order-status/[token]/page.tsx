import { Suspense } from "react";
import { OrderLoadingSkeleton } from "@/components/common/Loading";
import { OrderStatusPage } from "@/components/pages/orders/OrderStatusPage";
import { getOrderByToken } from "@/server/services/order.service";

export const metadata = { title: "Order Status | GoalNet", robots: { index: false } };

async function Status({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <OrderStatusPage accessToken={token} order={await getOrderByToken(token)} />;
}

export default function Page({ params }: { params: Promise<{ token: string }> }) {
  return <Suspense fallback={<OrderLoadingSkeleton />}><Status params={params} /></Suspense>;
}
