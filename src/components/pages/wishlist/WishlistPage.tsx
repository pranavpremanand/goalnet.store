"use client";

import Link from "next/link";
import { LuHeart as Heart, LuRefreshCw as RefreshCw } from "react-icons/lu";
import { ProductCard } from "@/components/common/ProductCard";
import { useWishlist } from "@/components/common/WishlistProvider";

export function WishlistPage() {
  const { products, isLoading, isPending, isSignedIn, error, refreshWishlist } = useWishlist();

  return (
    <main className="mx-auto min-h-[55vh] max-w-[1440px] px-5 py-10 sm:px-8 lg:px-14 lg:py-14">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-5">
        <div>
          <p className="text-xs font-bold uppercase text-muted">Saved for later</p>
          <h1 className="mt-1 font-display text-3xl font-semibold sm:text-4xl">Your wishlist</h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            {isSignedIn
              ? "Your saved products stay with your account across devices."
              : "Your saved products are stored on this device. Sign in to sync them with your account."}
          </p>
        </div>
        {!isSignedIn && (
          <Link className="bg-brand px-5 py-3 text-xs font-bold uppercase" href="/login">
            Sign in to sync
          </Link>
        )}
      </div>

      {error && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          <p>{error}</p>
          <button
            className="inline-flex items-center gap-2 font-semibold underline disabled:opacity-60"
            disabled={isLoading || isPending}
            onClick={() => void refreshWishlist()}
            type="button"
          >
            <RefreshCw size={15} /> Try again
          </button>
        </div>
      )}

      {isLoading ? (
        <div aria-label="Loading wishlist" className="grid grid-cols-2 gap-3 py-8 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }, (_, index) => (
            <div className="animate-pulse" key={index}>
              <div className="aspect-[4/5] bg-canvas" />
              <div className="mt-3 h-4 w-3/4 bg-canvas" />
              <div className="mt-2 h-3 w-1/3 bg-canvas" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 gap-3 py-8 sm:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => <ProductCard key={product.id} product={product} />)}
        </div>
      ) : (
        <div className="mt-8 border border-line p-8 text-center">
          <Heart aria-hidden="true" className="mx-auto mb-3 text-muted" size={32} />
          <p className="font-semibold">Your wishlist is empty</p>
          <p className="mt-1 text-sm text-muted">Tap the heart on a product to save it here.</p>
          <Link className="mt-5 inline-flex min-h-11 items-center justify-center bg-brand px-5 text-xs font-bold uppercase" href="/shop">
            Explore products
          </Link>
        </div>
      )}

    </main>
  );
}
