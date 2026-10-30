import { useSyncExternalStore } from "react";

// Browser-only stand-in for the auth session and orders API. Replace the exported functions with real calls.

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
  id: string;
  name: string;
  image: string;
  imageAlt: string;
  size: string;
  quantity: number;
  price: number;
};

export type OrderStatus = "Confirmed" | "Packed" | "Shipped" | "Delivered";

export type Order = {
  ref: string;
  accessToken: string;
  placedAt: string;
  userEmail: string | null;
  shipping: OrderAddress;
  billingAddress: string | null;
  lines: OrderLine[];
  subtotal: number;
  shippingFee: number;
  protection: number;
  total: number;
  status: OrderStatus;
  paymentId: string;
  tracking: { carrier: string; awb: string } | null;
};

export type Session = {
  name: string;
  email: string;
  phone: string;
  addresses: OrderAddress[];
};

type StoreState = { session: Session | null; orders: Order[] };

export type NewOrderInput = Pick<Order, "shipping" | "billingAddress" | "lines" | "subtotal" | "shippingFee" | "protection" | "total">;

const STORAGE_KEY = "goalnet-demo-v1";
const EMPTY: StoreState = { session: null, orders: [] };

let state: StoreState = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) state = { ...EMPTY, ...(JSON.parse(raw) as Partial<StoreState>) };
  } catch {
    state = EMPTY;
  }
}

function commit(next: StoreState) {
  state = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // Storage may be unavailable (private mode); state still lives in memory.
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  load();
  return state;
}

function getServerSnapshot() {
  return EMPTY;
}

export function useDemoStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

function randomToken(length: number, alphabet: string) {
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
}

export function signIn(profile: { name: string; email: string }) {
  load();
  const email = profile.email.trim().toLowerCase();
  const existing = state.session && state.session.email === email ? state.session : null;
  if (existing && existing.name === profile.name) return;
  commit({ ...state, session: existing ? { ...existing, name: profile.name } : { name: profile.name.trim() || email.split("@")[0], email, phone: "", addresses: [] } });
}

export function signOut() {
  load();
  if (!state.session) return;
  commit({ ...state, session: null });
}

export function addSavedAddress(address: OrderAddress) {
  load();
  if (!state.session) return;
  commit({ ...state, session: { ...state.session, addresses: [...state.session.addresses, address] } });
}

export function removeSavedAddress(index: number) {
  load();
  if (!state.session) return;
  commit({ ...state, session: { ...state.session, addresses: state.session.addresses.filter((_, itemIndex) => itemIndex !== index) } });
}

export function createOrder(input: NewOrderInput, options: { saveAddress: boolean }): Order {
  load();
  const order: Order = {
    ...input,
    ref: `GN-${randomToken(8, "ABCDEFGHJKLMNPQRSTUVWXYZ23456789")}`,
    accessToken: randomToken(32, "abcdefghijklmnopqrstuvwxyz0123456789"),
    placedAt: new Date().toISOString(),
    userEmail: state.session?.email ?? null,
    status: "Confirmed",
    paymentId: `pay_demo_${randomToken(10, "abcdefghijklmnopqrstuvwxyz0123456789")}`,
    tracking: null,
  };
  let session = state.session;
  if (session && options.saveAddress) {
    const duplicate = session.addresses.some((saved) => saved.pin === input.shipping.pin && saved.address === input.shipping.address);
    session = {
      ...session,
      phone: session.phone || input.shipping.phone,
      addresses: duplicate ? session.addresses : [...session.addresses, input.shipping],
    };
  }
  commit({ session, orders: [order, ...state.orders] });
  return order;
}

export function findOrderByRef(orders: Order[], ref: string) {
  return orders.find((order) => order.ref === ref);
}

export function findOrderByToken(orders: Order[], token: string) {
  return orders.find((order) => order.accessToken === token);
}

// Verified-contact lookup: the order number and the email used at checkout must both match.
export function findOrderByContact(orders: Order[], ref: string, email: string) {
  const wantedRef = ref.trim().toUpperCase();
  const wantedEmail = email.trim().toLowerCase();
  return orders.find((order) => order.ref === wantedRef && order.shipping.email.toLowerCase() === wantedEmail);
}
