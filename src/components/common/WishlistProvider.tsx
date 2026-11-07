"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ApiError, apiRequest } from "@/lib/api-client";
import { useDemoStore } from "@/lib/demo-store";
import type { StoreProduct } from "@/lib/types/storefront";

const STORAGE_KEY = "goalnet-wishlist-v1";
const PRODUCT_ID_PATTERN = /^[a-f\d]{24}$/i;
const MAX_GUEST_ITEMS = 500;
const LOOKUP_BATCH_SIZE = 100;

type WishlistResponse = { favorites: string[]; products: StoreProduct[] };
type WishlistActionResult = { ok: true } | { ok: false; error: string };
type WishlistContextValue = {
  productIds: string[];
  products: StoreProduct[];
  isLoading: boolean;
  isPending: boolean;
  isSignedIn: boolean;
  error: string;
  refreshWishlist: () => Promise<void>;
  isWishlisted: (productId: string) => boolean;
  toggleWishlist: (product: StoreProduct) => Promise<WishlistActionResult>;
};

const WishlistContext = createContext<WishlistContextValue | null>(null);

function getErrorMessage(error: unknown) {
  return error instanceof ApiError || error instanceof Error
    ? error.message
    : "Your wishlist could not be updated. Please try again.";
}

function readGuestIds() {
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];

  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value) || value.some((id) => typeof id !== "string")) {
    throw new Error("Your saved wishlist data is invalid. Clear it or contact support.");
  }

  return [...new Set(value.filter((id: string) => PRODUCT_ID_PATTERN.test(id)))].slice(0, MAX_GUEST_ITEMS);
}

function saveGuestIds(ids: string[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

async function loadGuestProducts(ids: string[]) {
  const batches = Array.from({ length: Math.ceil(ids.length / LOOKUP_BATCH_SIZE) }, (_, index) =>
    ids.slice(index * LOOKUP_BATCH_SIZE, (index + 1) * LOOKUP_BATCH_SIZE),
  );
  const results = await Promise.all(
    batches.map(async (batch) => {
      const params = new URLSearchParams();
      batch.forEach((id) => params.append("id", id));
      const response = await apiRequest<{ products: StoreProduct[] }>(`/api/storefront/products/by-ids?${params}`);
      return response.products;
    }),
  );
  const products = results.flat();
  const byId = new Map(products.map((product) => [product.id, product]));
  return {
    products: ids.flatMap((id) => {
      const product = byId.get(id);
      return product ? [product] : [];
    }),
    validIds: ids.filter((id) => byId.has(id)),
  };
}

export function WishlistProvider({ children }: { children: ReactNode }) {
  const { session } = useDemoStore();
  const sessionEmail = session?.email ?? null;
  const [productIds, setProductIds] = useState<string[]>([]);
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);
  const pendingRef = useRef(false);

  const refreshWishlist = useCallback(async () => {
    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setError("");
    setProductIds([]);
    setProducts([]);

    try {
      if (sessionEmail) {
        let guestIds: string[] = [];
        let storageError = "";
        try {
          guestIds = readGuestIds();
        } catch (storageFailure) {
          storageError = getErrorMessage(storageFailure);
        }
        if (guestIds.length > 0) {
          await apiRequest<{ favorites: string[] }>("/api/account/favorites", {
            method: "PUT",
            body: JSON.stringify({ productIds: guestIds }),
          });
        }
        const wishlist = await apiRequest<WishlistResponse>("/api/account/favorites");
        if (currentRequest !== requestId.current) return;
        if (guestIds.length > 0) {
          try {
            window.localStorage.removeItem(STORAGE_KEY);
          } catch (storageFailure) {
            storageError = getErrorMessage(storageFailure);
          }
        }
        setProductIds(wishlist.favorites);
        setProducts(wishlist.products);
        if (storageError) setError(storageError);
      } else {
        const guestIds = readGuestIds();
        setProductIds(guestIds);
        const result = await loadGuestProducts(guestIds);
        if (currentRequest !== requestId.current) return;
        setProductIds(result.validIds);
        setProducts(result.products);
        if (result.validIds.length !== guestIds.length) saveGuestIds(result.validIds);
      }
    } catch (requestError) {
      if (currentRequest === requestId.current) setError(getErrorMessage(requestError));
    } finally {
      if (currentRequest === requestId.current) setIsLoading(false);
    }
  }, [sessionEmail]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (active) return refreshWishlist();
    });
    return () => {
      active = false;
      requestId.current += 1;
    };
  }, [refreshWishlist]);

  useEffect(() => {
    if (sessionEmail) return;
    const handleStorage = (event: StorageEvent) => {
      if (event.key === STORAGE_KEY || event.key === null) void refreshWishlist();
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [refreshWishlist, sessionEmail]);

  const toggleWishlist = useCallback(async (product: StoreProduct): Promise<WishlistActionResult> => {
    if (pendingRef.current) return { ok: false, error: "Please wait for your wishlist to finish updating." };
    if (isLoading) return { ok: false, error: "Your wishlist is still loading. Please try again." };

    const shouldAdd = !productIds.includes(product.id);
    const nextIds = shouldAdd
      ? [...productIds, product.id]
      : productIds.filter((id) => id !== product.id);
    if (!sessionEmail && shouldAdd && nextIds.length > MAX_GUEST_ITEMS) {
      const message = `Guest wishlists can hold up to ${MAX_GUEST_ITEMS} products. Sign in to keep saving items.`;
      setError(message);
      return { ok: false, error: message };
    }

    pendingRef.current = true;
    const operationId = ++requestId.current;
    setIsPending(true);
    setError("");
    try {
      let updatedIds = nextIds;
      if (sessionEmail) {
        const response = shouldAdd
          ? await apiRequest<{ favorites: string[] }>("/api/account/favorites", {
              method: "POST",
              body: JSON.stringify({ productId: product.id }),
            })
          : await apiRequest<{ favorites: string[] }>("/api/account/favorites", {
              method: "DELETE",
              body: JSON.stringify({ productId: product.id }),
            });
        updatedIds = response.favorites;
      } else {
        saveGuestIds(nextIds);
      }
      if (operationId !== requestId.current) {
        return { ok: false, error: "Your account changed. Refresh the page and try again." };
      }
      setProductIds(updatedIds);
      setProducts((current) => shouldAdd
        ? [product, ...current.filter((item) => item.id !== product.id)]
        : current.filter((item) => item.id !== product.id));
      return { ok: true };
    } catch (requestError) {
      const message = getErrorMessage(requestError);
      setError(message);
      return { ok: false, error: message };
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  }, [isLoading, productIds, sessionEmail]);

  const value = useMemo<WishlistContextValue>(() => ({
    productIds,
    products,
    isLoading,
    isPending,
    isSignedIn: Boolean(sessionEmail),
    error,
    refreshWishlist,
    isWishlisted: (productId) => productIds.includes(productId),
    toggleWishlist,
  }), [productIds, products, isLoading, isPending, sessionEmail, error, refreshWishlist, toggleWishlist]);

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used inside WishlistProvider");
  return context;
}
