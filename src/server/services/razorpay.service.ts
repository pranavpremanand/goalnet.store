import { createHmac, timingSafeEqual } from "node:crypto";
import { getRazorpayConfig } from "@/server/config/env";
import { ServiceUnavailableError, UpstreamError } from "@/server/errors";

export type RazorpayPayment = {
  id: string;
  order_id: string | null;
  amount: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "refunded" | "failed";
};

function requireCredentials() {
  const { keyId, keySecret, baseUrl } = getRazorpayConfig();
  if (!keyId || !keySecret) throw new ServiceUnavailableError("Online payments are not available right now. Please try again later.");
  return { keyId, keySecret, baseUrl };
}

export function getPublicKeyId() {
  return requireCredentials().keyId;
}

async function razorpayRequest<T>(path: string, init?: { method: "POST"; body: unknown }): Promise<T> {
  const { keyId, keySecret, baseUrl } = requireCredentials();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}${path}`, {
      method: init?.method ?? "GET",
      headers: {
        Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        ...(init ? { "Content-Type": "application/json" } : {}),
      },
      body: init ? JSON.stringify(init.body) : undefined,
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
  } catch {
    throw new UpstreamError("We couldn't reach the payment provider. Please try again.");
  }
  if (!response.ok) {
    console.error("Razorpay request failed", path, response.status, await response.text().catch(() => ""));
    throw new UpstreamError("The payment provider rejected the request. Please try again.");
  }
  return (await response.json()) as T;
}

export async function createRazorpayOrder(input: { amountPaise: number; receipt: string; notes: Record<string, string> }) {
  const order = await razorpayRequest<{ id: string }>("/v1/orders", {
    method: "POST",
    body: { amount: input.amountPaise, currency: "INR", receipt: input.receipt, notes: input.notes },
  });
  return order.id;
}

export function fetchRazorpayPayment(paymentId: string) {
  return razorpayRequest<RazorpayPayment>(`/v1/payments/${encodeURIComponent(paymentId)}`);
}

export function captureRazorpayPayment(paymentId: string, amountPaise: number) {
  return razorpayRequest<RazorpayPayment>(`/v1/payments/${encodeURIComponent(paymentId)}/capture`, {
    method: "POST",
    body: { amount: amountPaise, currency: "INR" },
  });
}

function safeEqualHex(expected: string, received: string) {
  const a = Buffer.from(expected);
  const b = Buffer.from(received);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function verifyCheckoutSignature(orderId: string, paymentId: string, signature: string) {
  const { keySecret } = requireCredentials();
  const expected = createHmac("sha256", keySecret).update(`${orderId}|${paymentId}`).digest("hex");
  return safeEqualHex(expected, signature);
}

export function verifyWebhookSignature(rawBody: string, signature: string) {
  const { webhookSecret } = getRazorpayConfig();
  if (!webhookSecret) throw new ServiceUnavailableError("Webhook secret is not configured.");
  const expected = createHmac("sha256", webhookSecret).update(rawBody).digest("hex");
  return safeEqualHex(expected, signature);
}
