import Link from "next/link";
import { ArrowRight, Boxes, CircleDollarSign, Package, ShoppingBag, Users } from "lucide-react";
import { featuredProducts, formatRupees } from "@/data/products";

const metrics = [
  { label: "Products", value: "24", detail: "Across 4 collections", icon: Package },
  { label: "Active users", value: "150", detail: "+12 this month", icon: Users },
  { label: "Orders to pack", value: "08", detail: "Needs attention", icon: ShoppingBag },
  { label: "Gross sales", value: "₹48,250", detail: "This month", icon: CircleDollarSign },
];

const recentOrders = [
  { id: "PO-20481", customer: "Aarav Mehta", item: "Argentina Home Jersey", amount: 2500, status: "Out for delivery" },
  { id: "PO-20480", customer: "Mira Shah", item: "Brazil Classic 2002", amount: 2800, status: "Received" },
  { id: "PO-20479", customer: "Kabir Rao", item: "Barcelona Home Jersey", amount: 2200, status: "Packed" },
];

export function AdminDashboard() {
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase text-muted">Monday, 26 October 2026</p><h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Admin overview</h1></div><Link className="inline-flex items-center gap-2 bg-brand px-4 py-3 text-xs font-bold uppercase" href="/admin/products">Manage products <ArrowRight size={15} /></Link></div>
      <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">{metrics.map(({ label, value, detail, icon: Icon }, index) => <article className="border border-line p-4 sm:p-5" key={label}><div className="flex items-center justify-between"><span className="grid size-9 place-items-center" style={{ background: index % 2 ? "#f3f5f8" : "#f2fa18" }}><Icon size={18} /></span><span className="text-[10px] font-semibold uppercase text-[#16812c]">Live preview</span></div><p className="mt-5 text-xs uppercase text-muted">{label}</p><p className="mt-1 font-display text-2xl font-semibold sm:text-3xl">{value}</p><p className="mt-1 text-xs text-muted">{detail}</p></article>)}</div>
      <div className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="border border-line"><div className="flex items-center justify-between border-b border-line p-4 sm:p-5"><div><p className="text-xs font-bold uppercase text-muted">The latest</p><h2 className="mt-1 font-display text-xl font-semibold">Recent orders</h2></div><Link className="text-xs font-bold uppercase underline" href="/admin/manage-orders">All orders</Link></div><div className="overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="bg-canvas text-[10px] uppercase text-muted"><tr><th className="px-4 py-3">Order</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Item</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th></tr></thead><tbody>{recentOrders.map((order) => <tr className="border-t border-line" key={order.id}><td className="px-4 py-4 font-semibold">{order.id}</td><td className="px-4 py-4">{order.customer}</td><td className="px-4 py-4">{order.item}</td><td className="px-4 py-4">{formatRupees(order.amount)}</td><td className="px-4 py-4"><span className={`whitespace-nowrap px-2 py-1 text-[10px] font-bold uppercase ${order.status === "Received" ? "bg-brand" : "bg-canvas"}`}>{order.status}</span></td></tr>)}</tbody></table></div></section>
        <section className="border border-line p-4 sm:p-5"><div className="flex items-center gap-3"><span className="grid size-9 place-items-center bg-brand"><Boxes size={18} /></span><div><p className="text-xs font-bold uppercase text-muted">Inventory focus</p><h2 className="font-display text-xl font-semibold">Popular products</h2></div></div><div className="mt-5 divide-y divide-line">{featuredProducts.slice(0, 4).map((product, index) => <div className="flex items-center justify-between gap-3 py-3" key={product.id}><div><p className="text-sm font-semibold">{product.name}</p><p className="mt-0.5 text-xs text-muted">{index % 2 === 0 ? 14 : 8} units available</p></div><p className="text-sm font-semibold">{formatRupees(product.price)}</p></div>)}</div></section>
      </div>
      <p className="mt-6 text-xs text-muted">Admin data is illustrative and resets when the page reloads.</p>
    </div>
  );
}