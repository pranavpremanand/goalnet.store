"use client";

import { useState } from "react";
import Link from "next/link";
import { LuCheck as Check, LuCopy as Copy, LuMail as Mail } from "react-icons/lu";
import { findOrderByRef, useDemoStore } from "@/lib/demo-store";
import { OrderDetails } from "@/components/pages/orders/OrderDetails";

export function OrderConfirmationPage({ orderRef }: { orderRef: string }) {
  const { orders } = useDemoStore();
  const [copied, setCopied] = useState(false);
  const order = findOrderByRef(orders, orderRef);

  if (!order) {
    return (
      <main className="mx-auto flex min-h-[55vh] max-w-xl flex-col items-center justify-center px-5 py-16 text-center">
        <h1 className="font-display text-3xl font-semibold">We couldn’t find this order here.</h1>
        <p className="mt-3 font-copy text-sm leading-6 text-muted">Order confirmations are shown on the device used at checkout. Use your order number and email to look it up.</p>
        <Link className="mt-6 inline-flex min-h-12 items-center bg-brand px-6 text-sm font-bold uppercase" href="/order-status">Check order status</Link>
      </main>
    );
  }

  const registered = order.userEmail !== null;
  const statusPath = `/order-status/${order.accessToken}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${statusPath}`);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-5 py-10 sm:px-8 lg:py-14">
      <div className="text-center">
        <span className="mx-auto grid size-14 place-items-center bg-brand"><Check size={26} /></span>
        <p className="mt-5 text-xs font-bold uppercase text-muted">Order confirmed</p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Thanks, {order.shipping.name.split(" ")[0]}.</h1>
        <p className="mt-4 text-sm text-muted">Your order number</p>
        <p className="mt-1 font-display text-3xl font-bold tracking-wide">{order.ref}</p>
        <p className="mx-auto mt-4 flex max-w-md items-start justify-center gap-2 font-copy text-sm leading-6 text-muted"><Mail className="mt-1 shrink-0" size={15} />A confirmation will be emailed to {order.shipping.email} once the email service is connected. Keep your order number handy.</p>
      </div>

      <div className="mt-10 border border-line p-5 sm:p-8"><OrderDetails order={order} /></div>

      {registered ? (
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 bg-canvas p-5 sm:p-6">
          <p className="text-sm">This order is saved to your account.</p>
          <Link className="inline-flex min-h-11 items-center bg-brand px-5 text-xs font-bold uppercase" href="/dashboard/my-orders">View in My Orders</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <div className="border border-line p-5 sm:p-6">
            <h2 className="font-display text-xl font-semibold">Check your order anytime</h2>
            <p className="mt-2 font-copy text-sm leading-6 text-muted">Use this private link to see your order status and tracking without an account. Anyone with the link can view the order, so keep it to yourself.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link className="inline-flex min-h-11 items-center border border-ink px-5 text-xs font-bold uppercase hover:bg-canvas" href={statusPath}>Open order status</Link>
              <button className="inline-flex min-h-11 items-center gap-2 border border-line px-5 text-xs font-bold uppercase hover:border-ink" onClick={copyLink} type="button"><Copy size={14} />{copied ? "Link copied" : "Copy link"}</button>
            </div>
          </div>
          <div className="bg-ink p-5 text-white sm:p-6">
            <p className="text-xs font-bold uppercase text-brand">Join the GOALNET community</p>
            <p className="mt-2 font-copy text-sm leading-6 text-white/70">Create an account to view your order history and make future purchases faster. We will verify your email before linking this order.</p>
            <Link className="mt-4 inline-flex min-h-11 items-center bg-brand px-5 text-xs font-bold uppercase text-ink" href="/signup">Create account</Link>
          </div>
        </div>
      )}

      <div className="mt-8 text-center"><Link className="text-xs font-bold uppercase underline underline-offset-4" href="/shop">Continue shopping</Link></div>
    </main>
  );
}
