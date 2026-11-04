import type { QueryFilter, Types } from "mongoose";
import type { OrderDto, OrderStatus } from "@/lib/types/orders";
import { connectToDatabase } from "@/server/db/connect";
import { OrderModel, type OrderAttrs } from "@/server/models/order.model";

type OrderDoc = OrderAttrs & { _id: Types.ObjectId };

export type NewOrderData = Omit<OrderAttrs, "createdAt" | "updatedAt" | "userId" | "lines" | "razorpay" | "status" | "paymentStatus" | "tracking" | "paidAt"> & {
  userId?: string;
  lines: (Omit<OrderAttrs["lines"][number], "productId"> & { productId: string })[];
};

function toDto(doc: OrderDoc): OrderDto {
  return {
    id: doc._id.toString(),
    ref: doc.orderNumber,
    placedAt: (doc.paidAt ?? doc.createdAt).toISOString(),
    status: doc.status,
    paymentStatus: doc.paymentStatus,
    isAccountOrder: Boolean(doc.userId),
    shipping: { ...doc.shipping },
    billingAddress: doc.billingAddress ?? null,
    lines: doc.lines.map((line) => ({
      productId: line.productId.toString(),
      slug: line.slug,
      name: line.name,
      image: line.image,
      imageAlt: line.imageAlt,
      size: line.size,
      quantity: line.quantity,
      price: line.price,
    })),
    subtotal: doc.subtotal,
    shippingFee: doc.shippingFee,
    total: doc.total,
    paymentId: doc.razorpay?.paymentId ?? null,
    tracking: doc.tracking ? { carrier: doc.tracking.carrier, awb: doc.tracking.awb } : null,
  };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function createOrder(data: NewOrderData): Promise<OrderDto> {
  await connectToDatabase();
  const doc = await OrderModel.create(data);
  return toDto(doc.toObject() as OrderDoc);
}

export async function orderNumberExists(orderNumber: string) {
  await connectToDatabase();
  return (await OrderModel.exists({ orderNumber })) !== null;
}

export async function deleteUnpaidOrder(id: string) {
  await connectToDatabase();
  await OrderModel.deleteOne({ _id: id, paymentStatus: { $ne: "paid" } });
}

export async function setRazorpayOrderId(id: string, razorpayOrderId: string) {
  await connectToDatabase();
  await OrderModel.updateOne({ _id: id }, { $set: { "razorpay.orderId": razorpayOrderId } });
}

export async function findByTokenHash(accessTokenHash: string) {
  await connectToDatabase();
  const doc = await OrderModel.findOne({ accessTokenHash }).lean<OrderDoc>();
  return doc ? toDto(doc) : null;
}

export async function findByRazorpayOrderId(razorpayOrderId: string) {
  await connectToDatabase();
  const doc = await OrderModel.findOne({ "razorpay.orderId": razorpayOrderId }).lean<OrderDoc>();
  return doc ? toDto(doc) : null;
}

export async function findPaidByNumberAndEmail(orderNumber: string, email: string) {
  await connectToDatabase();
  const doc = await OrderModel.findOne({ orderNumber, "shipping.email": email, paymentStatus: "paid" }).lean<OrderDoc>();
  return doc ? toDto(doc) : null;
}

// Atomic, so a verify call and a webhook arriving together cannot both confirm the order.
export async function markPaid(id: string, paymentId: string) {
  await connectToDatabase();
  await OrderModel.updateOne(
    { _id: id, paymentStatus: { $ne: "paid" } },
    { $set: { paymentStatus: "paid", status: "confirmed", paidAt: new Date(), "razorpay.paymentId": paymentId } },
  );
  const doc = await OrderModel.findById(id).lean<OrderDoc>();
  return doc ? toDto(doc) : null;
}

export async function markPaymentFailed(id: string) {
  await connectToDatabase();
  await OrderModel.updateOne({ _id: id, paymentStatus: "created" }, { $set: { paymentStatus: "failed" } });
}

export async function listForUser(userId: string): Promise<OrderDto[]> {
  await connectToDatabase();
  const docs = await OrderModel.find({ userId, paymentStatus: "paid" }).sort({ paidAt: -1 }).lean<OrderDoc[]>();
  return docs.map(toDto);
}

export async function listOrders(filter: { page: number; limit: number; q: string; status: OrderStatus | "all" }) {
  await connectToDatabase();
  const query: QueryFilter<OrderAttrs> = filter.status === "all" ? { paymentStatus: "paid" } : { status: filter.status };
  if (filter.q) {
    const pattern = new RegExp(escapeRegex(filter.q), "i");
    query.$or = [
      { orderNumber: pattern },
      { "shipping.name": pattern },
      { "shipping.email": pattern },
      { billingAddress: pattern },
    ];
  }
  const [docs, total] = await Promise.all([
    OrderModel.find(query)
      .sort({ createdAt: -1 })
      .skip((filter.page - 1) * filter.limit)
      .limit(filter.limit)
      .lean<OrderDoc[]>(),
    OrderModel.countDocuments(query),
  ]);
  return { items: docs.map(toDto), total };
}

export async function countOrdersNeedingAttention() {
  await connectToDatabase();
  return OrderModel.countDocuments({ status: { $in: ["confirmed", "packed"] } });
}

export async function findById(id: string) {
  await connectToDatabase();
  const doc = await OrderModel.findById(id).lean<OrderDoc>();
  return doc ? toDto(doc) : null;
}

export async function updateFulfilment(id: string, data: { status: OrderStatus; tracking: { carrier: string; awb: string } | null }) {
  await connectToDatabase();
  const doc = await OrderModel.findOneAndUpdate({ _id: id }, { $set: data }, { returnDocument: "after" }).lean<OrderDoc>();
  return doc ? toDto(doc) : null;
}
