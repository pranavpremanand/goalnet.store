"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuArrowRight as ArrowRight, LuCheck as Check, LuHeart as Heart, LuShare2 as Share2, LuTruck as Truck, LuX as X } from "react-icons/lu";
import { ProductCard } from "@/components/common/ProductCard";
import { useLocalCart } from "@/components/common/LocalCartProvider";
import { ProductImageZoom } from "@/components/pages/product-details/ProductImageZoom";
import { PRODUCT_TYPE_LABELS } from "@/lib/catalog-constants";
import { formatRupees } from "@/lib/format";
import type { StoreProduct } from "@/lib/types/storefront";

const FALLBACK_DESCRIPTION = "Product material, fit and construction may vary by design. Please check the product details for the available information before ordering.";

export function ProductDetailsPage({ product, related }: { product: StoreProduct; related: StoreProduct[] }) {
  const [size, setSize] = useState("");
  const [liked, setLiked] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [deliveryCode, setDeliveryCode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [expanded, setExpanded] = useState("Description");
  const { addItem } = useLocalCart();
  const description = product.description || FALLBACK_DESCRIPTION;
  const selected = product.sizes.find((option) => option.size === size);
  const sizeLabel = product.sizeSystem === "one-size" ? "" : product.sizeSystem === "uk" ? "UK " : product.sizeSystem === "eu" ? "EU " : "";
  const details = [
    ["Type", PRODUCT_TYPE_LABELS[product.productType]],
    ["Brand", product.brand],
    ["Team", product.teamName],
    ["Season", product.season],
    ["Material", product.material],
  ].filter(([, value]) => value);

  function addToBag() {
    if (!size) {
      setNotice(product.sizeSystem === "one-size" ? "Select the option to add this item to your bag." : "Choose a size to add this item to your bag.");
      return;
    }
    addItem(product, size);
    setNotice(`${product.name}, ${sizeLabel}${product.sizeSystem === "one-size" ? "" : "size "}${size}, added to your bag.`);
  }

  function checkDelivery() {
    setDeliveryMessage(/^\d{6}$/.test(deliveryCode) ? "Pincode format is valid. Delivery availability depends on courier serviceability." : "Enter a valid 6-digit pincode.");
  }

  async function shareProduct() {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href });
    } else {
      await navigator.clipboard?.writeText(window.location.href);
      setNotice("Product link copied.");
    }
  }

  return (
    <main>
      <div className="mx-auto max-w-[1440px] px-5 pt-6 sm:px-8 lg:px-14">
        <p className="text-xs font-medium text-muted"><Link href="/">Home</Link> <span className="px-2">/</span> <Link href="/shop">Shop</Link> <span className="px-2">/</span> <span className="text-ink">{product.name}</span></p>
      </div>
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-14 lg:px-14 lg:py-10">
        <div>
          <ProductImageZoom alt={product.images[activeImage]?.alt ?? product.imageAlt} src={product.images[activeImage]?.url ?? product.image}>
            <span className="absolute left-4 top-4 bg-brand px-3 py-1.5 text-[10px] font-bold uppercase">GOALNET selection</span>
          </ProductImageZoom>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:max-w-[480px]">
              {product.images.map((image, index) => (
                <button aria-label={`Show product image ${index + 1}`} aria-pressed={activeImage === index} className={`relative aspect-[4/3] overflow-hidden bg-canvas ${activeImage === index ? "outline outline-2 outline-ink" : "opacity-70 hover:opacity-100"}`} key={`${image.url}-${index}`} onClick={() => setActiveImage(index)} type="button">
                  <Image alt="" className="object-cover" fill sizes="180px" src={image.url} />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="lg:pt-4">
          <p className="text-xs font-bold uppercase text-muted">{product.category.name}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight sm:text-5xl">{product.name}</h1>
          <p className="mt-5 flex items-baseline gap-3 font-display text-3xl font-medium">
            {formatRupees(product.price)}
            {product.compareAtPrice && <span className="text-lg text-muted line-through">{formatRupees(product.compareAtPrice)}</span>}
          </p>
          <p className="mt-5 max-w-lg font-copy text-sm leading-7 text-muted">{description.length > 220 ? `${description.slice(0, 217).trimEnd()}…` : description}</p>
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-xs font-bold uppercase">{product.sizeSystem === "one-size" ? "Option" : `Select ${sizeLabel}size`}</h2><button className="border-b border-muted text-xs text-muted" type="button" onClick={() => setNotice("Compare the product size information with a similar item you own. If you are unsure, contact contactgoalnet@gmail.com before ordering.")}>Size guide</button></div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((option) => {
                const unavailable = option.availability === "unavailable";
                return <button aria-pressed={size === option.size} className={`grid min-h-12 min-w-12 place-items-center border px-3 text-sm font-semibold transition ${size === option.size ? "border-ink bg-brand" : "border-line hover:border-ink"} ${unavailable ? "cursor-not-allowed text-muted line-through opacity-50 hover:border-line" : ""}`} disabled={unavailable} key={option.size} onClick={() => { setSize(option.size); setNotice(""); }} type="button">{option.size}</button>;
              })}
            </div>
            {selected?.availability === "supplier-confirmation-required" && <p className="mt-3 text-xs text-muted">Availability for this {product.sizeSystem === "one-size" ? "option" : "size"} is confirmed with our supplier after you order.</p>}
          </div>
          <div className="mt-7 grid grid-cols-[1fr_auto] gap-2">
            <button className="min-h-12 bg-brand px-5 text-sm font-bold uppercase transition hover:bg-[#d8df0d]" onClick={addToBag} type="button">Add to bag</button>
            <button aria-label={liked ? "Remove from favorites" : "Add to favorites"} aria-pressed={liked} className={`grid size-12 place-items-center border border-line ${liked ? "text-red-600" : "hover:border-ink"}`} onClick={() => setLiked(!liked)} type="button"><Heart fill={liked ? "currentColor" : "none"} size={19} /></button>
          </div>
          <button className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 border border-ink text-sm font-semibold" onClick={shareProduct} type="button"><Share2 size={16} /> Share</button>
          {notice && <p aria-live="polite" className="mt-3 flex items-center gap-2 bg-canvas p-3 text-sm"><Check className="shrink-0 text-[#16812c]" size={16} />{notice}<button aria-label="Dismiss message" className="ml-auto" onClick={() => setNotice("")} type="button"><X size={15} /></button></p>}
          <div className="mt-8 border-y border-line py-5">
            <div className="flex items-center gap-2 text-sm font-semibold"><Truck size={18} /> Check delivery availability</div>
            <div className="mt-3 flex max-w-sm border-b border-ink"><input aria-label="Delivery pincode" className="min-w-0 flex-1 py-2 text-sm outline-none" inputMode="numeric" maxLength={6} onChange={(event) => setDeliveryCode(event.target.value.replace(/\D/g, ""))} placeholder="Enter 6-digit pincode" value={deliveryCode} /><button className="text-xs font-bold uppercase" onClick={checkDelivery} type="button">Check</button></div>
            {deliveryMessage && <p aria-live="polite" className="mt-2 text-xs text-muted">{deliveryMessage}</p>}
            <p className="mt-3 text-xs text-muted">Processing generally takes 2–3 business days. Delivery is estimated at 5–10 business days after dispatch; serviceability varies by location.</p>
          </div>
          <div className="divide-y divide-line">
            {["Description", "Details", "Shipping and delivery"].filter((title) => title !== "Details" || details.length > 0).map((title) => (
              <div key={title}>
                <button aria-expanded={expanded === title} className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold" onClick={() => setExpanded(expanded === title ? "" : title)} type="button">{title}<span>{expanded === title ? "−" : "+"}</span></button>
                {expanded === title && title === "Description" && <p className="whitespace-pre-line pb-4 font-copy text-xs leading-6 text-muted">{description}</p>}
                {expanded === title && title === "Details" && <dl className="grid grid-cols-[110px_1fr] gap-y-2 pb-4 font-copy text-xs leading-6">{details.map(([label, value]) => <div className="contents" key={label}><dt className="text-muted">{label}</dt><dd>{value}</dd></div>)}</dl>}
                {expanded === title && title === "Shipping and delivery" && <p className="pb-4 font-copy text-xs leading-6 text-muted">Standard shipping is ₹80 per order. Additional shipping may apply to multi-item orders and will be shown before confirmation. Orders are generally processed in 2–3 business days; delivery is estimated at 5–10 business days after dispatch.</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="bg-canvas py-14 sm:py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14"><div className="mb-8 flex items-end justify-between"><h2 className="font-display text-3xl font-semibold">You may also like</h2><Link className="flex items-center gap-2 text-xs font-bold uppercase" href="/shop">Shop all <ArrowRight size={15} /></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">{related.map((item) => <ProductCard key={item.id} product={item} />)}</div></div></section>
      )}
    </main>
  );
}
