import { useSyncExternalStore } from "react";
import type { OrderAddress } from "@/lib/types/orders";

// Browser-side cache of the signed-in profile and saved addresses.

export type { OrderAddress } from "@/lib/types/orders";

export type Session = {
  name: string;
  email: string;
  phone: string;
  addresses: OrderAddress[];
};

type StoreState = { session: Session | null };


const STORAGE_KEY = "goalnet-demo-v1";
const EMPTY: StoreState = { session: null };

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

