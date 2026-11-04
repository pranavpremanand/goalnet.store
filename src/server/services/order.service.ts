import { randomInt } from "node:crypto";
import type { CheckoutSession, OrderDto, OrderStatus } from "@/lib/types/orders";
import type { CreateOrderInput, OrderLookupInput, OrderListQuery, OrderUpdateInput, VerifyPaymentInput } from "@/lib/validation/orders";
import { BadRequestError, NotFoundError, UpstreamError } from "@/server/errors";
import { generateSessionToken, hashSessionToken } from "@/server/lib/token";
import * as categoryRepository from "@/server/repositories/category.repository";
import * as orderRepository from "@/server/repositories/order.repository";
import * as productRepository from "@/server/repositories/product.repository";
import type { AuthUser } from "@/server/services/auth.service";
import { getDeliveryQuote } from "@/server/services/delivery.service";
import * as razorpay from "@/server/services/razorpay.service";

const ORDER_NUMBER_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

async function generateOrderNumber() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const code = Array.from({ length: 8 }, () => ORDER_NUMBER_ALPHABET[randomInt(ORDER_NUMBER_ALPHABET.length)]).join("");
    const orderNumber = `GN-${code}`;
    if (!(await orderRepository.orderNumberExists(orderNumber))) return orderNumber;
  }
  throw new Error("Could not generate a unique order number");
}

// Prices always come from the database; the browser only says what it wants and in which size.
async function priceLines(items: CreateOrderInput["items"]) {
  const merged = new Map<string, CreateOrderInput["items"][number]>();
  for (const item of items) {
    const key = `${item.productId}:${item.size}`;
    const existing = merged.get(key);
    merged.set(key, { ...item, quantity: Math.min(10, (existing?.quantity ?? 0) + item.quantity) });
  }

  const categoryIds = (await categoryRepository.listCategories({ activeOnly: true })).map((category) => category.id);
  const products = await productRepository.listActiveProducts({ categoryIds, ids: [...new Set(items.map((item) => item.productId))], limit: 50 });
  const byId = new Map(products.map((product) => [product.id, product]));

  return [...merged.values()].map((item) => {
    const product = byId.get(item.productId);
    if (!product) throw new BadRequestError("An item in your bag is no longer available. Please review your bag.");
    const variant = product.variants.find((candidate) => candidate.size === item.size);
    if (!variant || variant.availabilityStatus === "unavailable") {
      throw new BadRequestError(`${product.name} in size ${item.size} is no longer available. Please review your bag.`);
    }
    const [image] = product.images;
    return {
      productId: product.id,
      slug: product.slug,
      name: product.name,
      image: image?.url ?? "",
      imageAlt: image?.alt || product.name,
      size: item.size,
      quantity: item.quantity,
      price: product.price,
    };
  });
}

export async function createCheckoutOrder(input: CreateOrderInput, user: AuthUser | null): Promise<CheckoutSession> {
  const lines = await priceLines(input.items);
  const quantity = lines.reduce((sum, line) => sum + line.quantity, 0);
  const deliveryQuote = await getDeliveryQuote(input.shipping.pin, quantity);
  if (!deliveryQuote.serviceable || deliveryQuote.shippingFee === null) {
    throw new BadRequestError("We can't deliver to this PIN code. Please check the PIN code or use another address.");
  }
  const verifiedCity = deliveryQuote.city || deliveryQuote.district;
  if (!verifiedCity || !deliveryQuote.state) {
    throw new UpstreamError("The pincode service did not return a verified city and state. Please try again.");
  }

  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const total = subtotal + deliveryQuote.shippingFee;

  const accessToken = generateSessionToken();
  const orderNumber = await generateOrderNumber();
  const order = await orderRepository.createOrder({
    orderNumber,
    accessTokenHash: hashSessionToken(accessToken),
    userId: user?.id,
    shipping: { ...input.shipping, city: verifiedCity, state: deliveryQuote.state },
    billingAddress: input.billingAddress,
    lines,
    subtotal,
    shippingFee: deliveryQuote.shippingFee,
    total,
  });

  const amount = Math.round(total * 100);
  try {
    const razorpayOrderId = await razorpay.createRazorpayOrder({ amountPaise: amount, receipt: orderNumber, notes: { orderNumber } });
    await orderRepository.setRazorpayOrderId(order.id, razorpayOrderId);
    return { orderNumber, accessToken, razorpay: { keyId: razorpay.getPublicKeyId(), orderId: razorpayOrderId, amount, currency: "INR" } };
  } catch (error) {
    await orderRepository.deleteUnpaidOrder(order.id);
    throw error;
  }
}

async function confirmPayment(order: OrderDto, paymentId: string) {
  const confirmed = await orderRepository.markPaid(order.id, paymentId);
  return confirmed ?? order;
}

export async function verifyPayment(input: VerifyPaymentInput): Promise<OrderDto> {
  const order = await orderRepository.findByTokenHash(hashSessionToken(input.accessToken));
  const razorpayOrder = order ? await orderRepository.findByRazorpayOrderId(input.razorpay_order_id) : null;
  if (!order || razorpayOrder?.id !== order.id) throw new NotFoundError("We couldn't find that order.");
  if (order.paymentStatus === "paid") return order;

  if (!razorpay.verifyCheckoutSignature(input.razorpay_order_id, input.razorpay_payment_id, input.razorpay_signature)) {
    throw new BadRequestError("We couldn't verify this payment. If money was deducted, it will be reconciled automatically.");
  }

  // Signature proves the payment belongs to this Razorpay order; the amount is double-checked with Razorpay itself.
  let payment = await razorpay.fetchRazorpayPayment(input.razorpay_payment_id);
  if (payment.order_id !== input.razorpay_order_id || payment.amount !== Math.round(order.total * 100)) {
    throw new BadRequestError("The payment amount does not match this order.");
  }
  if (payment.status === "authorized") payment = await razorpay.captureRazorpayPayment(payment.id, payment.amount);
  if (payment.status !== "captured") throw new BadRequestError("The payment has not been completed.");

  return confirmPayment(order, payment.id);
}

type WebhookEvent = {
  event?: string;
  payload?: { payment?: { entity?: { id?: string; order_id?: string; amount?: number; status?: string } } };
};

// Backup path: confirms orders even if the shopper closed the tab before the browser verification ran.
export async function handleWebhook(rawBody: string, signature: string | null) {
  if (!signature || !razorpay.verifyWebhookSignature(rawBody, signature)) throw new BadRequestError("Invalid webhook signature.");

  let event: WebhookEvent;
  try {
    event = JSON.parse(rawBody) as WebhookEvent;
  } catch {
    throw new BadRequestError("Invalid webhook body.");
  }
  const payment = event.payload?.payment?.entity;
  if (!payment?.id || !payment.order_id) return;

  const order = await orderRepository.findByRazorpayOrderId(payment.order_id);
  if (!order) return;

  if (event.event === "payment.captured" || event.event === "order.paid") {
    if (payment.amount !== Math.round(order.total * 100)) {
      console.error("Razorpay webhook amount mismatch", order.ref, payment.amount);
      return;
    }
    if (order.paymentStatus !== "paid") await orderRepository.markPaid(order.id, payment.id);
  } else if (event.event === "payment.failed") {
    await orderRepository.markPaymentFailed(order.id);
  }
}

export async function getOrderByToken(token: string) {
  return orderRepository.findByTokenHash(hashSessionToken(token));
}

export async function lookupOrder(input: OrderLookupInput) {
  const order = await orderRepository.findPaidByNumberAndEmail(input.orderNumber.toUpperCase(), input.email);
  if (!order) throw new NotFoundError("We couldn't find an order with those details. Check the order number and email.");
  return order;
}

export async function listMyOrders(userId: string) {
  return orderRepository.listForUser(userId);
}

export async function listAdminOrders(query: OrderListQuery) {
  const [{ items, total }, needAttention] = await Promise.all([orderRepository.listOrders(query), orderRepository.countOrdersNeedingAttention()]);
  return { items, total, needAttention };
}

export async function updateOrder(id: string, input: OrderUpdateInput) {
  const order = await orderRepository.findById(id);
  if (!order) throw new NotFoundError("Order not found.");
  if (order.paymentStatus !== "paid") throw new BadRequestError("Only paid orders can be updated.");
  const status: OrderStatus = input.status;
  if (status === "shipped" && !input.tracking && !order.tracking) throw new BadRequestError("Add tracking details before marking an order as shipped.");
  const updated = await orderRepository.updateFulfilment(id, { status, tracking: input.tracking ?? order.tracking });
  if (!updated) throw new NotFoundError("Order not found.");
  return updated;
}
