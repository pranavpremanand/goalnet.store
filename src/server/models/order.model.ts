import { Schema, model, models, type Model, type Types } from "mongoose";
import { ORDER_STATUSES, type OrderStatus } from "@/lib/types/orders";

export interface OrderAttrs {
  orderNumber: string;
  accessTokenHash: string;
  userId?: Types.ObjectId;
  shipping: { name: string; email: string; phone: string; pin: string; state: string; city: string; address: string; apartment: string };
  billingAddress?: string | null;
  lines: { productId: Types.ObjectId; slug: string; name: string; image: string; imageAlt: string; size: string; quantity: number; price: number }[];
  subtotal: number;
  shippingFee: number;
  /** Kept for backward-compatibility with existing orders; always 0 for new orders. */
  protection?: number;
  total: number;
  status: OrderStatus;
  paymentStatus: "created" | "paid" | "failed";
  razorpay: { orderId?: string; paymentId?: string };
  paidAt?: Date;
  tracking?: { carrier: string; awb: string } | null;
  createdAt: Date;
  updatedAt: Date;
}

const orderSchema = new Schema<OrderAttrs>(
  {
    orderNumber: { type: String, required: true, unique: true },
    accessTokenHash: { type: String, required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    shipping: {
      name: { type: String, required: true },
      email: { type: String, required: true, lowercase: true, index: true },
      phone: { type: String, required: true },
      pin: { type: String, required: true },
      state: { type: String, required: true },
      city: { type: String, required: true },
      address: { type: String, required: true },
      apartment: { type: String, default: "" },
    },
    billingAddress: { type: String, default: null },
    lines: [
      {
        _id: false,
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        slug: { type: String, required: true },
        name: { type: String, required: true },
        image: { type: String, default: "" },
        imageAlt: { type: String, default: "" },
        size: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        price: { type: Number, required: true, min: 0 },
      },
    ],
    subtotal: { type: Number, required: true, min: 0 },
    shippingFee: { type: Number, required: true, min: 0 },
    protection: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ORDER_STATUSES, default: "pending-payment", index: true },
    paymentStatus: { type: String, enum: ["created", "paid", "failed"], default: "created" },
    razorpay: {
      orderId: { type: String, unique: true, sparse: true },
      paymentId: { type: String },
    },
    paidAt: { type: Date },
    tracking: { type: { _id: false, carrier: String, awb: String }, default: null },
  },
  { timestamps: true },
);

orderSchema.index({ userId: 1, createdAt: -1 });

export const OrderModel = (models.Order as Model<OrderAttrs> | undefined) ?? model<OrderAttrs>("Order", orderSchema);
