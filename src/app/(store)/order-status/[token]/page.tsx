import { Suspense } from "react";
import { OrderStatusPage } from "@/components/pages/orders/OrderStatusPage";

export const metadata = { title: "Order Status | GoalNet", robots: { index: false } };

async function Status({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  return <OrderStatusPage token={token} />;
}

export default function Page({ params }: { params: Promise<{ token: string }> }) {
  return <Suspense><Status params={params} /></Suspense>;
}
