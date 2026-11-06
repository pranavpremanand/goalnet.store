import Link from "next/link";
import {
  LuArrowRight as ArrowRight,
  LuBoxes as Boxes,
  LuCircleDollarSign as CircleDollarSign,
  LuPackage as Package,
  LuShoppingBag as ShoppingBag,
  LuUsers as Users,
} from "react-icons/lu";
import { formatRupees } from "@/lib/format";
import { ORDER_STATUS_LABELS } from "@/lib/types/orders";
import type { getAdminDashboardData } from "@/server/services/admin-dashboard.service";

type DashboardData = Awaited<ReturnType<typeof getAdminDashboardData>>;

export function AdminDashboard({ data }: { data: DashboardData }) {
  const metrics = [
    {
      label: "Products",
      value: data.productCount.toLocaleString("en-IN"),
      detail: `${data.activeProductCount.toLocaleString("en-IN")} active in catalog`,
      icon: Package,
    },
    {
      label: "Customers",
      value: data.customerCount.toLocaleString("en-IN"),
      detail: "Registered customer accounts",
      icon: Users,
    },
    {
      label: "Orders to pack",
      value: data.ordersToPack.toLocaleString("en-IN"),
      detail: "Confirmed or packed",
      icon: ShoppingBag,
    },
    {
      label: "Gross sales",
      value: formatRupees(data.monthlySales),
      detail: "Paid orders this month",
      icon: CircleDollarSign,
    },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase text-muted">
            Updated{" "}
            {new Date(data.generatedAt).toLocaleString("en-IN", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">
            Admin overview
          </h1>
        </div>
        <Link
          className="inline-flex items-center gap-2 bg-brand px-4 py-3 text-xs font-bold uppercase"
          href="/admin/products"
        >
          Manage products <ArrowRight size={15} />
        </Link>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-4">
        {metrics.map(({ label, value, detail, icon: Icon }, index) => (
          <article className="border border-line p-4 sm:p-5" key={label}>
            <div className="flex items-center justify-between">
              <span
                className="grid size-9 place-items-center"
                style={{ background: index % 2 ? "#f3f5f8" : "#f2fa18" }}
              >
                <Icon size={18} />
              </span>
            </div>
            <p className="mt-5 text-xs uppercase text-muted">{label}</p>
            <p className="mt-1 break-words font-display text-2xl font-semibold sm:text-3xl">
              {value}
            </p>
            <p className="mt-1 text-xs text-muted">{detail}</p>
          </article>
        ))}
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <section className="border border-line">
          <div className="flex items-center justify-between border-b border-line p-4 sm:p-5">
            <div>
              <p className="text-xs font-bold uppercase text-muted">
                The latest
              </p>
              <h2 className="mt-1 font-display text-xl font-semibold">
                Recent orders
              </h2>
            </div>
            <Link
              className="text-xs font-bold uppercase underline"
              href="/admin/manage-orders"
            >
              All orders
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="bg-canvas text-[10px] uppercase text-muted">
                <tr>
                  <th className="px-4 py-3">Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Item</th>
                  <th className="px-4 py-3">Total</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.length ? (
                  data.recentOrders.map((order) => (
                    <tr className="border-t border-line" key={order.id}>
                      <td className="px-4 py-4 font-semibold">{order.ref}</td>
                      <td className="px-4 py-4">{order.shipping.name}</td>
                      <td
                        className="max-w-52 truncate px-4 py-4"
                        title={order.lines.map((line) => line.name).join(", ")}
                      >
                        {order.lines.map((line) => line.name).join(", ")}
                      </td>
                      <td className="px-4 py-4">{formatRupees(order.total)}</td>
                      <td className="px-4 py-4">
                        <span className="whitespace-nowrap bg-canvas px-2 py-1 text-[10px] font-bold uppercase">
                          {ORDER_STATUS_LABELS[order.status]}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      className="px-4 py-8 text-center text-sm text-muted"
                      colSpan={5}
                    >
                      No paid orders yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="border border-line p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center bg-brand">
              <Boxes size={18} />
            </span>
            <div>
              <p className="text-xs font-bold uppercase text-muted">
                By paid quantity
              </p>
              <h2 className="font-display text-xl font-semibold">
                Top products
              </h2>
            </div>
          </div>
          {data.popularProducts.length ? (
            <div className="mt-5 divide-y divide-line">
              {data.popularProducts.map((product) => (
                <div
                  className="flex items-center justify-between gap-3 py-3"
                  key={product.id}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {product.name}
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      {product.unitsSold.toLocaleString("en-IN")}{" "}
                      {product.unitsSold === 1 ? "unit" : "units"} sold
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-semibold">
                    {formatRupees(product.revenue)}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-5 border-t border-line py-5 text-sm text-muted">
              Product sales will appear here after the first paid order.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
