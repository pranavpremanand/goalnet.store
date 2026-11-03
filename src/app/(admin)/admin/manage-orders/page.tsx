import { AdminOrders } from "@/components/pages/admin/AdminOrders";
import { orderListQuerySchema } from "@/lib/validation/orders";
import { requireAdminPage } from "@/server/auth/current-user";
import { listAdminOrders } from "@/server/services/order.service";

export const metadata = { title: "Manage orders | GoalNet Admin" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage();
  const raw = await searchParams;
  const parsed = orderListQuerySchema.safeParse(Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])));
  const query = parsed.success ? parsed.data : orderListQuerySchema.parse({});
  return <AdminOrders filters={{ q: query.q, status: query.status }} result={await listAdminOrders(query)} />;
}
