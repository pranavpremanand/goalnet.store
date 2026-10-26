"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";
import { formatRupees, type Product } from "@/data/products";

export function ProductCard({ product }: { product: Product }) {
  const [liked, setLiked] = useState(false);

  return (
    <article className="group min-w-0">
      <div className="relative aspect-[4/5] overflow-hidden bg-canvas">
        <Link
          aria-label={`View ${product.name}`}
          className="absolute inset-0 z-0"
          href={`/product-info/${product.id}`}
        >
          <Image
            alt={product.imageAlt}
            className="object-cover transition duration-700 group-hover:scale-[1.04]"
            fill
            sizes="(max-width: 640px) 48vw, (max-width: 1024px) 30vw, 22vw"
            src={product.image}
          />
        </Link>
        {product.badge && (
          <span className="absolute left-3 top-3 z-10 bg-brand px-2.5 py-1 text-[10px] font-bold uppercase">
            {product.badge}
          </span>
        )}
        <button
          aria-label={liked ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
          aria-pressed={liked}
          className={`absolute right-3 top-3 z-10 grid size-9 place-items-center rounded-full bg-white/95 transition hover:bg-brand ${liked ? "text-red-600" : "text-ink"}`}
          onClick={() => setLiked(!liked)}
          type="button"
        >
          <Heart fill={liked ? "currentColor" : "none"} size={17} />
        </button>
        <Link
          aria-label={`View ${product.name}`}
          className="absolute bottom-3 right-3 z-10 grid size-10 translate-y-2 place-items-center bg-brand opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100 focus:translate-y-0 focus:opacity-100"
          href={`/product-info/${product.id}`}
        >
          <ArrowUpRight size={19} />
        </Link>
      </div>
      <div className="flex items-start justify-between gap-3 pt-3">
        <div className="min-w-0">
          <p className="text-[10px] font-semibold uppercase text-muted">{product.category}</p>
          <Link
            className="mt-1 block truncate font-display text-base font-semibold sm:text-lg"
            href={`/product-info/${product.id}`}
          >
            {product.name}
          </Link>
        </div>
        <p className="shrink-0 pt-3 text-sm font-bold">{formatRupees(product.price)}</p>
      </div>
      <p className="mt-1 text-xs font-medium text-[#16812c]">● In stock</p>
    </article>
  );
}