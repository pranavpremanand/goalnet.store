"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { CartProduct } from "@/lib/types/storefront";
import { ApiError, apiRequest } from "@/lib/api-client";
import { useDemoStore } from "@/lib/demo-store";

export type CartLine = CartProduct & {
  size: string;
  quantity: number;
  available: boolean;
};

type CartResult = { items: CartLine[] };
type CartActionResult = { ok: true } | { ok: false; error: string };

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  total: number;
  isLoading: boolean;
  isPending: boolean;
  error: string;
  refreshCart: () => Promise<void>;
  addItem: (product: CartProduct, size: string) => Promise<CartActionResult>;
  updateQuantity: (productId: string, size: string, quantity: number) => Promise<CartActionResult>;
  removeItem: (productId: string, size: string) => Promise<CartActionResult>;
  clearCart: () => Promise<CartActionResult>;
};

const CartContext = createContext<CartContextValue | null>(null);

function getErrorMessage(error: unknown) {
  return error instanceof ApiError || error instanceof Error
    ? error.message
    : "Your bag could not be updated. Please try again.";
}

export function LocalCartProvider({ children }: { children: ReactNode }) {
  const { session } = useDemoStore();
  const [items, setItems] = useState<CartLine[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const pendingRef = useRef(false);
  const loadRequest = useRef(0);

  const refreshCart = useCallback(async () => {
    const requestId = ++loadRequest.current;
    setIsLoading(true);
    try {
      const cart = await apiRequest<CartResult>("/api/cart");
      if (requestId === loadRequest.current) {
        setItems(cart.items);
        setError("");
      }
    } catch (requestError) {
      if (requestId === loadRequest.current) setError(getErrorMessage(requestError));
    } finally {
      if (requestId === loadRequest.current) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return refreshCart();
    });
    return () => {
      active = false;
      loadRequest.current += 1;
    };
  }, [refreshCart, session?.email]);

  const mutate = useCallback(async (url: string, init: RequestInit): Promise<CartActionResult> => {
    if (pendingRef.current) return { ok: false, error: "Please wait for your bag to finish updating." };

    loadRequest.current += 1;
    setIsLoading(false);
    pendingRef.current = true;
    setIsPending(true);
    setError("");
    try {
      const cart = await apiRequest<CartResult>(url, init);
      setItems(cart.items);
      return { ok: true };
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      return { ok: false, error: message };
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  }, []);

  const addItem = useCallback(
    (product: CartProduct, size: string) =>
      mutate("/api/cart", {
        method: "POST",
        body: JSON.stringify({ productId: product.id, size }),
      }),
    [mutate],
  );

  const removeItem = useCallback(
    (productId: string, size: string) =>
      mutate("/api/cart/items", {
        method: "DELETE",
        body: JSON.stringify({ productId, size }),
      }),
    [mutate],
  );

  const updateQuantity = useCallback(
    (productId: string, size: string, quantity: number) => {
      if (quantity < 1) return removeItem(productId, size);
      return mutate("/api/cart/items", {
        method: "PATCH",
        body: JSON.stringify({ productId, size, quantity }),
      });
    },
    [mutate, removeItem],
  );

  const clearCart = useCallback(
    () => mutate("/api/cart", { method: "DELETE" }),
    [mutate],
  );

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const value = useMemo(
    () => ({ items, itemCount, total, isLoading, isPending, error, refreshCart, addItem, updateQuantity, removeItem, clearCart }),
    [items, itemCount, total, isLoading, isPending, error, refreshCart, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useLocalCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useLocalCart must be used inside LocalCartProvider");
  return context;
}
