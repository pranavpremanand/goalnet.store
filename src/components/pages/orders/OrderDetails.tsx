"use client";

import Image from "next/image";
import { useState } from "react";
import { LuCheck as Check } from "react-icons/lu";
import { formatRupees } from "@/lib/format";
import { LoadingSpinner } from "@/components/common/Loading";
import {
  ORDER_STATUS_LABELS,
  type OrderDto,
  type OrderStatus,
} from "@/lib/types/orders";

const steps: OrderStatus[] = ["confirmed", "packed", "shipped", "delivered"];

export function OrderTimeline({ status }: { status: OrderStatus }) {
  if (status === "cancelled")
    return (
      <p className="bg-canvas p-3 text-center text-sm font-semibold text-red-700">
        This order was cancelled.
      </p>
    );
  const current = steps.indexOf(status);
  return (
    <ol aria-label="Order progress" className="flex">
      {steps.map((step, index) => (
        <li
          aria-current={index === current ? "step" : undefined}
          className="relative flex flex-1 flex-col items-center text-center"
          key={step}
        >
          {index > 0 && (
            <span
              aria-hidden="true"
              className={`absolute left-0 right-1/2 top-3.5 h-0.5 ${index <= current ? currentOrderLine(status) : "bg-line"}`}
            />
          )}
          {index < steps.length - 1 && (
            <span
              aria-hidden="true"
              className={`absolute left-1/2 right-0 top-3.5 h-0.5 ${index < current ? currentOrderLine(status) : "bg-line"}`}
            />
          )}
          <span
            className={`relative isolate grid size-7 place-items-center rounded-full ${index === current && status !== "delivered" ? "before:absolute before:inset-0 before:rounded-full before:bg-brand/60 before:content-[''] before:motion-safe:animate-ping motion-reduce:before:animate-none" : ""}`}
          >
            <span
              className={`relative z-10 grid size-7 place-items-center rounded-full text-xs font-bold transition-colors ${status === "delivered" && step === "delivered" ? "bg-green-600 text-white" : index <= current ? "bg-brand text-ink" : "bg-canvas text-muted"}`}
            >
              {index <= current ? <Check size={14} /> : index + 1}
            </span>
          </span>
          <span
            className={`mt-2 text-[10px] sm:text-xs ${status === "delivered" && step === "delivered" ? "font-bold text-green-700" : index === current ? "font-semibold text-ink" : "text-muted"}`}
          >
            {ORDER_STATUS_LABELS[step]}
          </span>
        </li>
      ))}
    </ol>
  );
}

function currentOrderLine(status: OrderStatus) {
  return status === "delivered" ? "bg-green-600" : "bg-brand";
}

export function OrderDetails({
  order,
  accessToken,
  allowAccountCancellation = false,
  onOrderUpdated,
}: {
  order: OrderDto;
  accessToken?: string;
  allowAccountCancellation?: boolean;
  onOrderUpdated?: (order: OrderDto) => void;
}) {
  const [currentOrder, setCurrentOrder] = useState(order);
  const [cancelling, setCancelling] = useState(false);
  const [showCancellationDialog, setShowCancellationDialog] = useState(false);
  const [cancellationError, setCancellationError] = useState("");
  const [cancellationNotice, setCancellationNotice] = useState("");
  const placed = new Date(currentOrder.placedAt).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
  const { shipping } = currentOrder;
  const paid = currentOrder.paymentStatus === "paid";

  async function cancelOrder() {
    setCancelling(true);
    setCancellationError("");
    setCancellationNotice("");
    try {
      const response = await fetch("/api/orders/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          accessToken ? { accessToken } : { orderId: currentOrder.id },
        ),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.error || "We couldn't cancel this order. Please try again.",
        );
      const updatedOrder = result.order as OrderDto;
      setCurrentOrder(updatedOrder);
      onOrderUpdated?.(updatedOrder);
      setShowCancellationDialog(false);
      setCancellationNotice(
        "Your order has been cancelled. Any applicable refund will be handled under our cancellation policy.",
      );
    } catch (error) {
      setCancellationError(
        error instanceof Error
          ? error.message
          : "We couldn't cancel this order. Please try again.",
      );
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="text-xs text-muted">
          Order {currentOrder.ref} · Placed {placed}
        </p>
        <div className="mt-5">
          <OrderTimeline status={currentOrder.status} />
        </div>
        {currentOrder.status !== "cancelled" && (
          <p className="mt-6 border-l-4 border-brand bg-canvas p-4 font-copy text-sm leading-6 text-muted">
            {currentOrder.tracking ? (
              <>
                Shipped with {currentOrder.tracking.carrier}. Tracking number:{" "}
                <span className="font-semibold text-ink">
                  {currentOrder.tracking.awb}
                </span>
              </>
            ) : (
              "Tracking details will appear here once your order is dispatched. Orders are generally processed in 2–3 business days."
            )}
          </p>
        )}
        {cancellationNotice && (
          <p aria-live="polite" className="mt-4 text-sm text-green-800">
            {cancellationNotice}
          </p>
        )}
        {cancellationError && (
          <p aria-live="polite" className="mt-4 text-sm text-red-700">
            {cancellationError}
          </p>
        )}
      </section>

      <section>
        <h3 className="border-b border-line pb-3 font-display text-xl font-semibold">
          Order summary
        </h3>
        <ul className="divide-y divide-line">
          {currentOrder.lines.map((line) => (
            <li
              className="flex gap-4 py-4"
              key={`${line.productId}-${line.size}`}
            >
              <div className="relative aspect-4/5 w-16 shrink-0 bg-canvas">
                {line.image && (
                  <Image
                    alt={line.imageAlt}
                    className="object-cover"
                    fill
                    sizes="64px"
                    src={line.image}
                  />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{line.name}</p>
                <p className="mt-1 text-xs text-muted">
                  Size {line.size} · Qty {line.quantity}
                </p>
              </div>
              <div className="shrink-0 text-right">
                {line.discountAmount ? (
                  <>
                    <p className="text-xs text-muted line-through">
                      {formatRupees(
                        (line.originalPrice ??
                          line.price + line.discountAmount) * line.quantity,
                      )}
                    </p>
                    <p className="text-sm font-bold">
                      {formatRupees(line.price * line.quantity)}
                    </p>
                    <p className="text-[10px] font-semibold text-green-800">
                      Saved {formatRupees(line.discountAmount * line.quantity)}
                    </p>
                  </>
                ) : (
                  <p className="text-sm font-bold">
                    {formatRupees(line.price * line.quantity)}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="space-y-2 border-t border-line pt-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted">Subtotal</span>
            <span>{formatRupees(currentOrder.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted">Shipping</span>
            <span>{formatRupees(currentOrder.shippingFee)}</span>
          </div>
          <div className="flex justify-between border-t border-line pt-3 text-base font-bold">
            <span>{paid ? "Total paid" : "Total"}</span>
            <span>{formatRupees(currentOrder.total)}</span>
          </div>
        </div>
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div>
          <h3 className="text-xs font-bold uppercase text-muted">
            Delivery address
          </h3>
          <p className="mt-2 font-semibold">{shipping.name}</p>
          <p className="mt-1 text-sm leading-6 text-muted">
            {[shipping.apartment, shipping.address].filter(Boolean).join(", ")}
            <br />
            {shipping.city}, {shipping.state} {shipping.pin}
          </p>
          <p className="mt-1 text-sm text-muted">{shipping.phone}</p>
        </div>
        <div>
          <h3 className="text-xs font-bold uppercase text-muted">
            Billing address
          </h3>
          <p className="mt-2 text-sm leading-6 text-muted">
            {currentOrder.billingAddress ?? "Same as delivery address"}
          </p>
          <h3 className="mt-4 text-xs font-bold uppercase text-muted">
            Payment
          </h3>
          <p className="mt-2 break-all text-sm text-muted">
            {paid
              ? `Paid online · ${currentOrder.paymentId ?? ""}`
              : "Awaiting payment confirmation"}
          </p>
        </div>
      </section>
      {/* {currentOrder.status === "confirmed" && paid && (accessToken || allowAccountCancellation) && (
          <button
            className="min-h-11 border border-red-700 px-5 text-xs font-bold uppercase text-red-700 hover:bg-red-50 disabled:opacity-50"
            onClick={() => {
              setCancellationError("");
              setShowCancellationDialog(true);
            }}
            type="button"
          >
            Cancel order
          </button>
        )} */}

      {showCancellationDialog && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/55 p-4 backdrop-blur-[2px]"
          onClick={() => {
            if (!cancelling) setShowCancellationDialog(false);
          }}
        >
          <section
            aria-labelledby="cancel-order-title"
            aria-modal="true"
            className="w-full max-w-md border border-line bg-paper p-6 shadow-2xl sm:p-8"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <span
              className="grid size-12 place-items-center bg-red-50 text-xl font-semibold text-red-700"
              aria-hidden="true"
            >
              !
            </span>
            <p className="mt-5 text-xs font-bold uppercase tracking-wider text-red-700">
              Order cancellation
            </p>
            <h2
              className="mt-2 font-display text-2xl font-semibold"
              id="cancel-order-title"
            >
              Cancel this order?
            </h2>
            <p className="mt-3 font-copy text-sm leading-6 text-muted">
              Your order {currentOrder.ref} will be cancelled. This can’t be
              undone. Any applicable refund will be handled under our
              cancellation policy.
            </p>
            {cancellationError && (
              <p
                aria-live="polite"
                className="mt-4 border-l-2 border-red-700 bg-red-50 p-3 text-sm text-red-800"
              >
                {cancellationError}
              </p>
            )}
            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                className="min-h-11 border border-line px-5 text-xs font-bold uppercase hover:border-ink disabled:opacity-50"
                disabled={cancelling}
                onClick={() => setShowCancellationDialog(false)}
                type="button"
              >
                Keep my order
              </button>
              <button
                className="min-h-11 bg-red-700 px-5 text-xs font-bold uppercase text-white hover:bg-red-800 disabled:opacity-50"
                disabled={cancelling}
                onClick={cancelOrder}
                type="button"
              >
                {cancelling ? (
                  <LoadingSpinner label="Cancelling…" />
                ) : (
                  "Yes, cancel order"
                )}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
