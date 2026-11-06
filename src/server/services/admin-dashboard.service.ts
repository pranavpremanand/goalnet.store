import { connectToDatabase } from "@/server/db/connect";
import { OrderModel } from "@/server/models/order.model";
import { ProductModel } from "@/server/models/product.model";
import { UserModel } from "@/server/models/user.model";
import { countOrdersNeedingAttention, listOrders } from "@/server/repositories/order.repository";

type PopularProduct = {
  id: string;
  name: string;
  unitsSold: number;
  revenue: number;
};

function getCurrentMonthBounds() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "numeric",
  }).formatToParts(new Date());
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  const start = new Date(Date.UTC(year, month - 1, 1) - 330 * 60 * 1000);
  const end = new Date(Date.UTC(year, month, 1) - 330 * 60 * 1000);
  return { start, end };
}

export async function getAdminDashboardData() {
  await connectToDatabase();
  const { start, end } = getCurrentMonthBounds();

  const [productCount, activeProductCount, customerCount, ordersToPack, sales, recentOrders, popularProducts] = await Promise.all([
    ProductModel.countDocuments({}),
    ProductModel.countDocuments({ isActive: true }),
    UserModel.countDocuments({ role: "customer" }),
    countOrdersNeedingAttention(),
    OrderModel.aggregate<{ total: number }>([
      { $match: { paymentStatus: "paid", paidAt: { $gte: start, $lt: end } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]),
    listOrders({ page: 1, limit: 5, q: "", status: "all" }),
    OrderModel.aggregate<PopularProduct>([
      { $match: { paymentStatus: "paid" } },
      { $unwind: "$lines" },
      {
        $group: {
          _id: "$lines.productId",
          name: { $first: "$lines.name" },
          unitsSold: { $sum: "$lines.quantity" },
          revenue: { $sum: { $multiply: ["$lines.quantity", "$lines.price"] } },
        },
      },
      { $sort: { unitsSold: -1, revenue: -1 } },
      { $limit: 4 },
      { $project: { _id: 0, id: { $toString: "$_id" }, name: 1, unitsSold: 1, revenue: 1 } },
    ]),
  ]);

  return {
    productCount,
    activeProductCount,
    customerCount,
    ordersToPack,
    monthlySales: sales[0]?.total ?? 0,
    recentOrders: recentOrders.items,
    popularProducts,
    generatedAt: new Date().toISOString(),
  };
}
