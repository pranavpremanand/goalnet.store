export const ORDER_STATUSES = ["pending-payment", "confirmed", "packed", "shipped", "delivered", "cancelled"] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  "pending-payment": "Awaiting payment",
  confirmed: "Confirmed",
  packed: "Packed",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export type OrderAddress = {
  name: string;
  email: string;
  phone: string;
  pin: string;
  state: string;
  city: string;
  address: string;
  apartment: string;
};

export type OrderLine = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  imageAlt: string;
  size: string;
  quantity: number;
  price: number;
};

export type OrderTracking = { carrier: string; awb: string };

export type OrderDto = {
  id: string;
  ref: string;
  placedAt: string;
  status: OrderStatus;
  paymentStatus: "created" | "paid" | "failed";
  isAccountOrder: boolean;
  shipping: OrderAddress;
  billingAddress: string | null;
  lines: OrderLine[];
  subtotal: number;
  shippingFee: number;
  protection: number;
  total: number;
  paymentId: string | null;
  tracking: OrderTracking | null;
};

export type CheckoutSession = {
  orderNumber: string;
  accessToken: string;
  razorpay: { keyId: string; orderId: string; amount: number; currency: "INR" };
};
