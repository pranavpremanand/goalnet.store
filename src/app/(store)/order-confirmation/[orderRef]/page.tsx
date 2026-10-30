import { Suspense } from "react";
import { OrderConfirmationPage } from "@/components/pages/orders/OrderConfirmationPage";

export const metadata = { title: "Order Confirmed | GoalNet", robots: { index: false } };

async function Confirmation({ params }: { params: Promise<{ orderRef: string }> }) {
  const { orderRef } = await params;
  return <OrderConfirmationPage orderRef={orderRef} />;
}

export default function Page({ params }: { params: Promise<{ orderRef: string }> }) {
  return <Suspense><Confirmation params={params} /></Suspense>;
}
