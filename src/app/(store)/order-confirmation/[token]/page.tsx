import { Suspense } from "react";
import { OrderLoadingSkeleton } from "@/components/common/Loading";
import { OrderConfirmationPage } from "@/components/pages/orders/OrderConfirmationPage";
import { getOrderByToken } from "@/server/services/order.service";

export const metadata = { title: "Order Confirmed | GoalNet", robots: { index: false } };

async function Confirmation({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const order = await getOrderByToken(token);
  return <OrderConfirmationPage order={order} token={token} />;
}

export default function Page({ params }: { params: Promise<{ token: string }> }) {
  return <Suspense fallback={<OrderLoadingSkeleton />}><Confirmation params={params} /></Suspense>;
}
