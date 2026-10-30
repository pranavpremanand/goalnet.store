"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { findOrderByContact, findOrderByToken, useDemoStore } from "@/lib/demo-store";
import { OrderDetails } from "@/components/pages/orders/OrderDetails";

export function OrderLookupPage() {
  const router = useRouter();
  const { orders } = useDemoStore();
  const [error, setError] = useState("");

  function lookup(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const order = findOrderByContact(orders, String(data.get("ref")), String(data.get("email")));
    if (!order) {
      setError("We couldn’t match that order number and email. Check both and try again.");
      return;
    }
    router.push(`/order-status/${order.accessToken}`);
  }

  return (
    <main className="mx-auto max-w-xl px-5 py-12 sm:px-8 lg:py-16">
      <p className="text-xs font-bold uppercase text-muted">Order status</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Where’s my order?</h1>
      <p className="mt-3 font-copy text-sm leading-6 text-muted">No account needed. Enter the order number from your confirmation and the email used at checkout.</p>
      <form className="mt-8 space-y-5" onSubmit={lookup}>
        <label className="block text-xs font-semibold">Order number<input autoComplete="off" className="mt-2 w-full border border-line px-4 py-3 text-sm uppercase outline-none focus:border-ink" name="ref" onChange={() => setError("")} placeholder="GN-XXXXXXXX" required /></label>
        <label className="block text-xs font-semibold">Email address<input autoComplete="email" className="mt-2 w-full border border-line px-4 py-3 text-sm outline-none focus:border-ink" name="email" onChange={() => setError("")} placeholder="you@example.com" required type="email" /></label>
        {error && <p aria-live="polite" className="text-sm text-red-700">{error}</p>}
        <button className="min-h-12 w-full bg-brand text-sm font-bold uppercase transition hover:bg-[#d8df0d]" type="submit">View order</button>
      </form>
      <p className="mt-6 text-xs leading-5 text-muted">Have an account? <Link className="font-semibold text-ink underline" href="/dashboard/my-orders">Open My Orders</Link>. In this demo, lookups only find orders placed in this browser.</p>
    </main>
  );
}

export function OrderStatusPage({ token }: { token: string }) {
  const { orders } = useDemoStore();
  const order = findOrderByToken(orders, token);

  if (!order) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold">This order link isn’t valid.</h1>
        <p className="mt-3 font-copy text-sm leading-6 text-muted">The link may be incomplete or expired. You can look up your order with its number and email instead.</p>
        <Link className="mt-6 inline-flex min-h-12 items-center bg-brand px-6 text-sm font-bold uppercase" href="/order-status">Look up an order</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl px-5 py-10 sm:px-8 lg:py-14">
      <p className="text-xs font-bold uppercase text-muted">Order status</p>
      <h1 className="mt-2 font-display text-4xl font-semibold">Your GOALNET order</h1>
      <div className="mt-8 border border-line p-5 sm:p-8"><OrderDetails order={order} /></div>
      <p className="mt-6 text-xs leading-5 text-muted">Need help with this order? Email contactgoalnet@gmail.com and quote {order.ref}.</p>
    </main>
  );
}
