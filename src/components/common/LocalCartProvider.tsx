"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import type { CartProduct } from "@/lib/types/storefront";

export type CartLine = CartProduct & {
  size: string;
  quantity: number;
};

type CartContextValue = {
  items: CartLine[];
  itemCount: number;
  total: number;
  addItem: (product: CartProduct, size: string) => void;
  updateQuantity: (productId: string, size: string, quantity: number) => void;
  removeItem: (productId: string, size: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

export function LocalCartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartLine[]>([]);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  function addItem(product: CartProduct, size: string) {
    setItems((current) => {
      const existing = current.find(
        (item) => item.id === product.id && item.size === size,
      );
      if (existing) {
        return current.map((item) =>
          item.id === product.id && item.size === size
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        );
      }
      return [...current, { id: product.id, slug: product.slug, name: product.name, image: product.image, imageAlt: product.imageAlt, price: product.price, size, quantity: 1 }];
    });
  }

  function updateQuantity(productId: string, size: string, quantity: number) {
    if (quantity < 1) {
      removeItem(productId, size);
      return;
    }
    setItems((current) =>
      current.map((item) =>
        item.id === productId && item.size === size
          ? { ...item, quantity }
          : item,
      ),
    );
  }

  function removeItem(productId: string, size: string) {
    setItems((current) =>
      current.filter((item) => !(item.id === productId && item.size === size)),
    );
  }

  return (
    <CartContext.Provider
      value={{ items, itemCount, total, addItem, updateQuantity, removeItem, clearCart: () => setItems([]) }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useLocalCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useLocalCart must be used inside LocalCartProvider");
  }
  return context;
}