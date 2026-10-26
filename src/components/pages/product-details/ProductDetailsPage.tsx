"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuArrowRight as ArrowRight, LuCheck as Check, LuHeart as Heart, LuShare2 as Share2, LuStar as Star, LuTruck as Truck, LuX as X } from "react-icons/lu";
import { ProductCard } from "@/components/common/ProductCard";
import { useLocalCart } from "@/components/common/LocalCartProvider";
import { featuredProducts, formatRupees, type Product } from "@/data/products";

const sizes = ["XS", "S", "M", "L", "XL"];

export function ProductDetailsPage({ product }: { product: Product }) {
  const [size, setSize] = useState("");
  const [liked, setLiked] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [deliveryCode, setDeliveryCode] = useState("");
  const [deliveryMessage, setDeliveryMessage] = useState("");
  const [notice, setNotice] = useState("");
  const [expanded, setExpanded] = useState("Description");
  const { addItem } = useLocalCart();
  const images = [product.image, featuredProducts[(featuredProducts.indexOf(product) + 1) % featuredProducts.length]?.image ?? product.image];

  function addToBag() {
    if (!size) {
      setNotice("Choose a size to add this jersey to your bag.");
      return;
    }
    addItem(product, size);
    setNotice(`${product.name}, size ${size}, added to your bag.`);
  }

  function checkDelivery() {
    setDeliveryMessage(/^\d{6}$/.test(deliveryCode) ? "Delivery available. Estimated arrival: 3–5 business days." : "Enter a valid 6-digit pincode.");
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
          <div className="relative aspect-[4/4.3] overflow-hidden bg-canvas sm:aspect-[1.05/1]">
            <Image alt={product.imageAlt} className="object-cover" fill priority sizes="(max-width: 1024px) 100vw, 55vw" src={images[activeImage]} />
            <span className="absolute left-4 top-4 bg-brand px-3 py-1.5 text-[10px] font-bold uppercase">Official collection</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:max-w-[360px]">
            {images.map((image, index) => (
              <button aria-label={`Show product image ${index + 1}`} aria-pressed={activeImage === index} className={`relative aspect-[4/3] overflow-hidden bg-canvas ${activeImage === index ? "outline outline-2 outline-ink" : "opacity-70 hover:opacity-100"}`} key={`${image}-${index}`} onClick={() => setActiveImage(index)} type="button">
                <Image alt="" className="object-cover" fill sizes="180px" src={image} />
              </button>
            ))}
          </div>
        </div>
        <div className="lg:pt-4">
          <p className="text-xs font-bold uppercase text-muted">{product.category}</p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight sm:text-5xl">{product.name}</h1>
          <div className="mt-4 flex items-center gap-2 text-sm"><span aria-label="Rated 5 out of 5" className="flex text-[#b77a00]">{Array.from({ length: 5 }, (_, index) => <Star fill="currentColor" key={index} size={15} />)}</span><span className="text-muted">5.0 · 24 reviews</span></div>
          <p className="mt-5 font-display text-3xl font-medium">{formatRupees(product.price)}</p>
          <p className="mt-5 max-w-lg font-copy text-sm leading-7 text-muted">A fan-first fit made for matchday and every day after. Breathable fabric, considered details, and colors that bring the whole story back.</p>
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between"><h2 className="text-xs font-bold uppercase">Select size</h2><button className="border-b border-muted text-xs text-muted" type="button" onClick={() => setNotice("Size guide: XS 34–36, S 36–38, M 38–40, L 40–42, XL 42–44 inches.")}>Size guide</button></div>
            <div className="flex gap-2">{sizes.map((option) => <button aria-pressed={size === option} className={`grid size-12 place-items-center border text-sm font-semibold transition ${size === option ? "border-ink bg-brand" : "border-line hover:border-ink"}`} key={option} onClick={() => { setSize(option); setNotice(""); }} type="button">{option}</button>)}</div>
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
            <p className="mt-3 text-xs text-muted">Free shipping. Delivered in 3–5 business days.</p>
          </div>
          <div className="divide-y divide-line">
            {["Description", "Shipping and taxes"].map((title) => <div key={title}><button aria-expanded={expanded === title} className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold" onClick={() => setExpanded(expanded === title ? "" : title)} type="button">{title}<span>{expanded === title ? "−" : "+"}</span></button>{expanded === title && <p className="pb-4 font-copy text-xs leading-6 text-muted">{title === "Description" ? "Designed for a comfortable fit with breathable sports fabric and durable finish. Please check the size guide before ordering." : "Free nationwide shipping on every order. Delivery timelines vary by pincode; taxes are included in the displayed price."}</p>}</div>)}
          </div>
        </div>
      </div>
      <section className="bg-canvas py-14 sm:py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14"><div className="mb-8 flex items-end justify-between"><h2 className="font-display text-3xl font-semibold">You may also like</h2><Link className="flex items-center gap-2 text-xs font-bold uppercase" href="/shop">Shop all <ArrowRight size={15} /></Link></div><div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">{featuredProducts.filter((item) => item.id !== product.id).slice(0, 4).map((item) => <ProductCard key={item.id} product={item} />)}</div></div></section>
    </main>
  );
}