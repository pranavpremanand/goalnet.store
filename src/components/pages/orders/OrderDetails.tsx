import Image from "next/image";
import { LuCheck as Check } from "react-icons/lu";
import { formatRupees } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/demo-store";

const steps: OrderStatus[] = ["Confirmed", "Packed", "Shipped", "Delivered"];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  const current = steps.indexOf(status);
  return (
    <ol className="flex justify-between gap-1">
      {steps.map((step, index) => (
        <li className="flex flex-1 flex-col items-center text-center" key={step}>
          <span className={`grid size-7 place-items-center rounded-full text-xs font-bold ${index <= current ? "bg-brand text-ink" : "bg-canvas text-muted"}`}>{index <= current ? <Check size={14} /> : index + 1}</span>
          <span className={`mt-2 text-[10px] sm:text-xs ${index === current ? "font-semibold text-ink" : "text-muted"}`}>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export function OrderDetails({ order }: { order: Order }) {
  const placed = new Date(order.placedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  const { shipping } = order;

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs text-muted">Order {order.ref} · Placed {placed}</p>
        <div className="mt-5"><OrderTimeline status={order.status} /></div>
        <p className="mt-6 border-l-4 border-brand bg-canvas p-4 font-copy text-sm leading-6 text-muted">
          {order.tracking
            ? <>Shipped with {order.tracking.carrier}. Tracking number: <span className="font-semibold text-ink">{order.tracking.awb}</span></>
            : "Tracking details will appear here once your order is dispatched. Orders are generally processed in 2–3 business days."}
        </p>
      </section>

      <section>
        <h3 className="border-b border-line pb-3 font-display text-xl font-semibold">Order summary</h3>
        <ul className="divide-y divide-line">
          {order.lines.map((line) => (
            <li className="flex gap-4 py-4" key={`${line.id}-${line.size}`}>
              <div className="relative aspect-4/5 w-16 shrink-0 bg-canvas"><Image alt={line.imageAlt} className="object-cover" fill sizes="64px" src={line.image} /></div>
              <div className="min-w-0 flex-1"><p className="font-semibold">{line.name}</p><p className="mt-1 text-xs text-muted">Size {line.size} · Qty {line.quantity}</p></div>
              <p className="shrink-0 text-sm font-bold">{formatRupees(line.price * line.quantity)}</p>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatRupees(order.subtotal)}</span></div>
          <div className="flex justify-between"><span className="text-muted">Shipping</span><span>{formatRupees(order.shippingFee)}</span></div>
          {order.protection > 0 && <div className="flex justify-between"><span className="text-muted">Product protection</span><span>{formatRupees(order.protection)}</span></div>}
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold"><span>Total paid</span><span>{formatRupees(order.total)}</span></div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold uppercase text-muted">Delivery address</h3>
          <p className="mt-2 font-semibold">{shipping.name}</p>
          <p className="mt-1 text-sm leading-6 text-muted">{[shipping.apartment, shipping.address].filter(Boolean).join(", ")}<br />{shipping.city}, {shipping.state} {shipping.pin}</p>
          <p className="mt-1 text-sm text-muted">{shipping.phone}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-muted">Billing address</h3>
          <p className="mt-2 text-sm leading-6 text-muted">{order.billingAddress ?? "Same as delivery address"}</p>
          <h3 className="mt-4 text-xs font-bold uppercase text-muted">Payment</h3>
          <p className="mt-2 break-all text-sm text-muted">Demo payment · {order.paymentId}</p>
        </div>
      </section>
    </div>
  );
}
