"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LuSearch as Search, LuX as X } from "react-icons/lu";
import { LoadingSpinner } from "@/components/common/Loading";
import { formatRupees } from "@/lib/format";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, type OrderDto, type OrderStatus } from "@/lib/types/orders";

type Props = {
  result: { items: OrderDto[]; total: number; needAttention: number };
  filters: { q: string; status: OrderStatus | "all" };
};

const editableStatuses = ORDER_STATUSES.filter((status) => status !== "pending-payment");
const fieldClass = "mt-1.5 w-full border border-line p-3 text-sm outline-none focus:border-ink";

function badgeClass(status: OrderStatus) {
  if (status === "confirmed") return "bg-brand";
  if (status === "delivered") return "bg-[#16812c] text-white";
  if (status === "cancelled") return "bg-[#830000] text-white";
  return "bg-canvas";
}

export function AdminOrders({ result, filters }: Props) {
  const router = useRouter();
  const [editing, setEditing] = useState<OrderDto | null>(null);
  const [status, setStatus] = useState<OrderStatus>("confirmed");
  const [carrier, setCarrier] = useState("");
  const [awb, setAwb] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  function open(order: OrderDto) {
    setEditing(order);
    setStatus(order.status === "pending-payment" ? "confirmed" : order.status);
    setCarrier(order.tracking?.carrier ?? "");
    setAwb(order.tracking?.awb ?? "");
    setError("");
  }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError("");
    const hasTracking = carrier.trim() !== "" || awb.trim() !== "";
    try {
      const response = await fetch(`/api/admin/orders/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, tracking: hasTracking ? { carrier, awb } : null }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "The order could not be updated.");
        return;
      }
      setEditing(null);
      router.refresh();
    } catch {
      setError("The server could not be reached. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-muted">Fulfillment</p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Manage orders</h1>
        </div>
        <span className="bg-canvas px-3 py-2 text-xs font-semibold">{result.needAttention} need attention</span>
      </div>

      <form className="mt-6 flex flex-wrap items-end gap-3" method="get">
        <label className="flex min-w-60 max-w-sm flex-1 items-center gap-2 border-b border-line py-2">
          <Search className="text-muted" size={16} />
          <input
            aria-label="Search orders"
            className="min-w-0 flex-1 text-sm outline-none"
            defaultValue={filters.q}
            name="q"
            placeholder="Order, name, email or address"
          />
        </label>
        <select aria-label="Filter by status" className="border border-line px-3 py-2 text-xs font-semibold" defaultValue={filters.status} name="status">
          <option value="all">All paid orders</option>
          {ORDER_STATUSES.map((value) => <option key={value} value={value}>{ORDER_STATUS_LABELS[value]}</option>)}
        </select>
        <button className="bg-ink px-4 py-2.5 text-xs font-bold uppercase text-white" type="submit">Apply</button>
      </form>

      <div className="mt-5 w-full min-w-0 max-w-full overflow-x-auto overscroll-x-contain border border-line">
        <table className="w-full min-w-[960px] text-left text-xs">
          <thead className="bg-canvas font-bold uppercase text-muted">
            <tr>
              <th className="px-4 py-3">Order</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Delivery</th>
              <th className="px-4 py-3">Billing</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Total</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {result.items.length === 0 && (
              <tr>
                <td className="px-4 py-8 text-center text-muted" colSpan={8}>
                  No orders found.
                </td>
              </tr>
            )}
            {result.items.map((order) => (
              <tr className="border-t border-line align-top" key={order.id}>
                <td className="px-4 py-4 font-bold">
                  {order.ref}
                  <span className="mt-1 block font-normal text-muted">
                    {new Date(order.placedAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" })}
                    {order.isAccountOrder ? " · Account" : " · Guest"}
                  </span>
                </td>
                <td className="px-4 py-4">
                  {order.shipping.name}
                  <span className="mt-1 block text-muted">{order.shipping.email}</span>
                  <span className="block text-muted">{order.shipping.phone}</span>
                </td>
                <td className="px-4 py-4">
                  {[order.shipping.apartment, order.shipping.address].filter(Boolean).join(", ")}
                  <span className="block text-muted">{order.shipping.city}, {order.shipping.state} {order.shipping.pin}</span>
                </td>
                <td className="px-4 py-4 max-w-xs">
                  {order.billingAddress ? (
                    <span className="block whitespace-pre-line text-ink">{order.billingAddress}</span>
                  ) : (
                    <span className="inline-block rounded bg-canvas px-2 py-0.5 text-[11px] text-muted">Same as delivery</span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {order.lines.map((line) => (
                    <span className="block" key={`${line.productId}-${line.size}`}>
                      {line.name} · {line.size} × {line.quantity}
                    </span>
                  ))}
                </td>
                <td className="px-4 py-4 font-semibold">{formatRupees(order.total)}</td>
                <td className="px-4 py-4">
                  <span className={`inline-block px-2 py-1.5 text-[10px] font-bold uppercase ${badgeClass(order.status)}`}>
                    {ORDER_STATUS_LABELS[order.status]}
                  </span>
                  {order.tracking && (
                    <span className="mt-1 block text-muted">
                      {order.tracking.carrier} · {order.tracking.awb}
                    </span>
                  )}
                </td>
                <td className="px-4 py-4">
                  {order.paymentStatus === "paid" && (
                    <button
                      className="border border-line px-3 py-2 text-[10px] font-bold uppercase hover:border-ink disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:border-line"
                      disabled={order.status === "cancelled"}
                      onClick={() => open(order)}
                      title={order.status === "cancelled" ? "Cancelled orders cannot be updated." : undefined}
                      type="button"
                    >
                      Update
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-muted">Showing {result.items.length} of {result.total} orders.</p>

      {editing && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/45 p-4">
          <form aria-modal="true" className="w-full max-w-lg bg-paper p-6" onSubmit={save} role="dialog">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase text-muted">Update order</p>
                <h2 className="mt-1 font-display text-2xl font-semibold">{editing.ref}</h2>
              </div>
              <button aria-label="Close" onClick={() => setEditing(null)} type="button">
                <X size={18} />
              </button>
            </div>

            <div className="mt-4 space-y-2.5 rounded border border-line bg-canvas p-3.5 text-xs">
              <div>
                <p className="text-[10px] font-bold uppercase text-muted">Delivery address</p>
                <p className="mt-0.5 font-semibold text-ink">{editing.shipping.name} · {editing.shipping.phone}</p>
                <p className="text-muted">{[editing.shipping.apartment, editing.shipping.address].filter(Boolean).join(", ")}, {editing.shipping.city}, {editing.shipping.state} {editing.shipping.pin}</p>
              </div>
              <div className="border-t border-line/60 pt-2">
                <p className="text-[10px] font-bold uppercase text-muted">Billing address</p>
                <p className="mt-0.5 whitespace-pre-line text-ink">
                  {editing.billingAddress ? editing.billingAddress : "Same as delivery address"}
                </p>
              </div>
            </div>

            <label className="mt-5 block text-xs font-semibold">
              Status
              <select className={fieldClass} onChange={(event) => setStatus(event.target.value as OrderStatus)} value={status}>
                {editableStatuses.map((value) => (
                  <option key={value} value={value}>
                    {ORDER_STATUS_LABELS[value]}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <label className="text-xs font-semibold">
                Carrier
                <input className={fieldClass} onChange={(event) => setCarrier(event.target.value)} placeholder="Delhivery" value={carrier} />
              </label>
              <label className="text-xs font-semibold">
                Tracking number
                <input className={fieldClass} onChange={(event) => setAwb(event.target.value)} value={awb} />
              </label>
            </div>
            {error && <p aria-live="polite" className="mt-3 text-sm text-red-700">{error}</p>}
            <div className="mt-6 flex justify-end gap-2">
              <button className="border border-line px-4 py-2.5 text-xs font-bold uppercase" onClick={() => setEditing(null)} type="button">
                Cancel
              </button>
              <button className="bg-brand px-4 py-2.5 text-xs font-bold uppercase disabled:opacity-50" disabled={saving} type="submit">
                {saving ? <LoadingSpinner label="Saving…" /> : "Save"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
