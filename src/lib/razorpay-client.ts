import type { CheckoutSession, OrderDto } from "@/lib/types/orders";

type RazorpaySuccess = { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string };

type RazorpayOptions = {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { name: string; email: string; contact: string };
  theme: { color: string };
  handler: (response: RazorpaySuccess) => void;
  modal: { ondismiss: () => void };
};

type RazorpayInstance = {
  open: () => void;
  on: (event: "payment.failed", callback: (response: { error?: { description?: string } }) => void) => void;
};

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

const SCRIPT_URL = "https://checkout.razorpay.com/v1/checkout.js";

function loadCheckoutScript() {
  if (window.Razorpay) return Promise.resolve(true);
  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

async function postJson<T>(url: string, body: unknown): Promise<{ ok: true; data: T } | { ok: false; status: number; error: string }> {
  try {
    const response = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = (await response.json().catch(() => ({}))) as T & { error?: string };
    if (!response.ok) return { ok: false, status: response.status, error: data.error ?? "Something went wrong. Please try again." };
    return { ok: true, data };
  } catch {
    return { ok: false, status: 0, error: "We couldn't reach the server. Check your connection and try again." };
  }
}

export async function createCheckoutSession(payload: unknown) {
  return postJson<CheckoutSession>("/api/orders", payload);
}

export async function verifyPayment(accessToken: string, response: RazorpaySuccess) {
  return postJson<{ order: OrderDto }>("/api/orders/verify", { accessToken, ...response });
}

export async function lookupOrder(orderNumber: string, email: string) {
  return postJson<{ order: OrderDto }>("/api/orders/lookup", { orderNumber, email });
}

type OpenOptions = {
  session: CheckoutSession;
  prefill: { name: string; email: string; contact: string };
  onSuccess: (response: RazorpaySuccess) => void;
  onDismiss: () => void;
  onFailure: (message: string) => void;
};

export async function openRazorpayCheckout({ session, prefill, onSuccess, onDismiss, onFailure }: OpenOptions) {
  if (!(await loadCheckoutScript()) || !window.Razorpay) {
    onFailure("The payment window could not be loaded. Check your connection and try again.");
    return;
  }

  const checkout = new window.Razorpay({
    key: session.razorpay.keyId,
    amount: session.razorpay.amount,
    currency: session.razorpay.currency,
    name: "GOALNET",
    description: `Order ${session.orderNumber}`,
    order_id: session.razorpay.orderId,
    prefill,
    theme: { color: "#f2fa18" },
    handler: onSuccess,
    modal: { ondismiss: onDismiss },
  });
  checkout.on("payment.failed", (response) => onFailure(response.error?.description ?? "The payment failed. You can try again."));
  checkout.open();
}
