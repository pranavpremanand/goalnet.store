"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LuCircleAlert as CircleAlert,
  LuArrowRight as ArrowRight,
  LuCheck as Check,
  LuShare2 as Share2,
  LuTruck as Truck,
  LuX as X,
} from "react-icons/lu";
import { ProductCard } from "@/components/common/ProductCard";
import { useLocalCart } from "@/components/common/LocalCartProvider";
import { ProductImageZoom } from "@/components/pages/product-details/ProductImageZoom";
import { PRODUCT_TYPE_LABELS, type JerseyType } from "@/lib/catalog-constants";
import { formatRupees } from "@/lib/format";
import type { StoreProduct } from "@/lib/types/storefront";

const FALLBACK_DESCRIPTION =
  "Product material, fit and construction may vary by design. Please check the product details for the available information before ordering.";

type PincodeLookup = {
  status: "idle" | "loading" | "success" | "error" | "blocked";
  message: string;
};

type Notice = { type: "success" | "error"; message: string };

const SIZE_CHARTS: Record<JerseyType, { label: string; image: string }> = {
  "half-sleeve": {
    label: "Half Sleeve",
    image: "/images/size-charts/half-sleeve.png",
  },
  "five-sleeve": {
    label: "Five Sleeve",
    image: "/images/size-charts/five-sleeve.png",
  },
  "full-sleeve": {
    label: "Full Sleeve",
    image: "/images/size-charts/full-sleeve.png",
  },
};

export function ProductDetailsPage({
  product,
  related,
}: {
  product: StoreProduct;
  related: StoreProduct[];
}) {
  const [size, setSize] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [deliveryCode, setDeliveryCode] = useState("");
  const [pincodeLookup, setPincodeLookup] = useState<PincodeLookup>({
    status: "idle",
    message: "",
  });
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [expanded, setExpanded] = useState("Description");
  const { addItem, isPending: cartPending } = useLocalCart();
  const sizeChart =
    product.productType === "jersey" && product.jerseyType
      ? SIZE_CHARTS[product.jerseyType]
      : null;
  const description = product.description || FALLBACK_DESCRIPTION;
  const selected = product.sizes.find((option) => option.size === size);
  const sizeLabel =
    product.sizeSystem === "one-size"
      ? ""
      : product.sizeSystem === "uk"
        ? "UK "
        : product.sizeSystem === "eu"
          ? "EU "
          : "";
  const details = [
    ["Type", PRODUCT_TYPE_LABELS[product.productType]],
    ["Brand", product.brand],
    ["Team", product.teamName],
    ["Season", product.season],
    ["Material", product.material],
  ].filter(([, value]) => value);

  async function addToBag() {
    if (!size) {
      setNotice({
        type: "error",
        message:
          product.sizeSystem === "one-size"
            ? "Select the option to add this item to your bag."
            : "Choose a size to add this item to your bag.",
      });
      return;
    }
    const result = await addItem(product, size);
    if (!result.ok) {
      setNotice({ type: "error", message: result.error });
      return;
    }
    setNotice({
      type: "success",
      message: `${product.name}, ${sizeLabel}${product.sizeSystem === "one-size" ? "" : "size "}${size}, added to your bag.`,
    });
  }

  async function checkPincode(pin: string) {
    setPincodeLookup({
      status: "loading",
      message: "Checking delivery availability…",
    });
    try {
      const response = await fetch(
        `/api/delivery/pincode?pincode=${encodeURIComponent(pin)}`,
        { cache: "no-store" },
      );
      const result = (await response.json()) as {
        serviceable?: boolean;
        city?: string;
        district?: string;
        state?: string;
        error?: string;
      };

      if (!response.ok) {
        setPincodeLookup({
          status: "error",
          message:
            result.error ?? "Delivery availability could not be checked.",
        });
        return;
      }
      if (!result.serviceable) {
        setPincodeLookup({
          status: "blocked",
          message: "India Post does not list a delivery post office for this PIN code.",
        });
        return;
      }

      const city = result.city || result.district;
      const locality = [city, result.state].filter(Boolean).join(", ");
      setPincodeLookup({
        status: "success",
        message: `Delivery available${locality ? ` to ${locality}` : ""}. Final serviceability is subject to courier confirmation.`,
      });
    } catch {
      setPincodeLookup({
        status: "error",
        message: "The delivery service could not be reached. Please try again.",
      });
    }
  }

  function changePin(next: string) {
    const pin = next.replace(/\D/g, "").slice(0, 6);
    setDeliveryCode(pin);
    setPincodeLookup({ status: "idle", message: "" });
    if (pin.length === 6) void checkPincode(pin);
  }

  function checkDelivery() {
    if (deliveryCode.length === 6) {
      void checkPincode(deliveryCode);
    } else {
      setPincodeLookup({
        status: "error",
        message: "Enter a valid 6-digit pincode.",
      });
    }
  }

  async function shareProduct() {
    if (navigator.share) {
      await navigator.share({ title: product.name, url: window.location.href });
    } else {
      await navigator.clipboard?.writeText(window.location.href);
      setNotice({ type: "success", message: "Product link copied." });
    }
  }

  const pincodeTone =
    pincodeLookup.status === "success"
      ? "text-[#16812c]"
      : pincodeLookup.status === "idle" || pincodeLookup.status === "loading"
        ? "text-muted"
        : "text-red-700";

  return (
    <main>
      <div className="mx-auto max-w-[1440px] px-5 pt-6 sm:px-8 lg:px-14">
        <p className="text-xs font-medium text-muted">
          <Link href="/">Home</Link> <span className="px-2">/</span>{" "}
          <Link href="/shop">Shop</Link> <span className="px-2">/</span>{" "}
          <span className="text-ink">{product.name}</span>
        </p>
      </div>
      {/* <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-14 lg:px-14 lg:py-10"> */}
      <div className="mx-auto grid max-w-[1440px] gap-8 px-5 py-7 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:px-14 lg:py-10">
        <div>
          <ProductImageZoom
            alt={product.images[activeImage]?.alt ?? product.imageAlt}
            src={product.images[activeImage]?.url ?? product.image}
          >
            <span className="absolute left-4 top-4 bg-brand px-3 py-1.5 text-[10px] font-bold uppercase">
              GOALNET selection
            </span>
          </ProductImageZoom>
          {product.images.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:max-w-[480px]">
              {product.images.map((image, index) => (
                <button
                  aria-label={`Show product image ${index + 1}`}
                  aria-pressed={activeImage === index}
                  className={`relative aspect-[4/5] overflow-hidden bg-canvas ${activeImage === index ? "outline outline-2 outline-brand" : "opacity-70 hover:opacity-100"}`}
                  key={`${image.url}-${index}`}
                  onClick={() => setActiveImage(index)}
                  type="button"
                >
                  <Image
                    alt=""
                    className="object-cover"
                    fill
                    sizes="180px"
                    src={image.url}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="lg:pt-4">
          <p className="text-xs font-bold uppercase text-muted">
            {product.category.name}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {product.name}
          </h1>
          <p className="mt-5 flex items-baseline gap-3 font-display text-3xl font-medium">
            {formatRupees(product.price)}
            {product.compareAtPrice && (
              <span className="text-lg text-muted line-through">
                {formatRupees(product.compareAtPrice)}
              </span>
            )}
          </p>
          <p className="mt-5 max-w-lg font-copy text-sm leading-7 text-muted">
            {description.length > 220
              ? `${description.slice(0, 217).trimEnd()}…`
              : description}
          </p>
          <div className="mt-7">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase">
                {product.sizeSystem === "one-size"
                  ? "Option"
                  : `Select ${sizeLabel}size`}
              </h2>
              {sizeChart && (
                <button
                  className="border-b border-muted text-xs text-muted hover:text-ink transition"
                  onClick={() => setShowSizeGuide(true)}
                  type="button"
                >
                  Size guide
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {product.sizes.map((option) => {
                const unavailable = option.availability === "unavailable";
                return (
                  <button
                    aria-pressed={size === option.size}
                    className={`grid min-h-12 min-w-12 place-items-center border px-3 text-sm font-semibold transition ${size === option.size ? "border-ink bg-brand" : "border-line hover:border-ink"} ${unavailable ? "cursor-not-allowed text-muted line-through opacity-50 hover:border-line" : ""}`}
                    disabled={unavailable}
                    key={option.size}
                    onClick={() => {
                      setSize(option.size);
                      setNotice(null);
                    }}
                    type="button"
                  >
                    {option.size}
                  </button>
                );
              })}
            </div>
            {selected?.availability === "supplier-confirmation-required" && (
              <p className="mt-3 text-xs text-muted">
                Availability for this{" "}
                {product.sizeSystem === "one-size" ? "option" : "size"} is
                confirmed with our supplier after you order.
              </p>
            )}
          </div>
          <div className="mt-7 grid sm:grid-cols-[1.3fr_0.7fr] gap-2">
            <button
              className="min-h-12 bg-brand px-5 text-sm font-bold uppercase transition hover:bg-[#d8df0d]"
              disabled={cartPending}
              onClick={addToBag}
              type="button"
            >
              {cartPending ? "Adding…" : "Add to bag"}
            </button>
            <button
              className="flex min-h-11 w-full items-center justify-center gap-2 border border-ink text-sm font-semibold"
              onClick={shareProduct}
              type="button"
            >
              <Share2 size={16} /> Share
            </button>
          </div>

          {/* <button
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 border border-ink text-sm font-semibold"
            onClick={shareProduct}
            type="button"
          >
            <Share2 size={16} /> Share
          </button> */}
          {notice && (
            <p
              aria-live={notice.type === "error" ? "assertive" : "polite"}
              className={`mt-3 flex items-center gap-2 bg-canvas p-3 text-sm ${notice.type === "error" ? "text-red-700" : "text-[#16812c]"}`}
              role={notice.type === "error" ? "alert" : "status"}
            >
              {notice.type === "error" ? (
                <CircleAlert className="shrink-0" size={16} />
              ) : (
                <Check className="shrink-0" size={16} />
              )}
              {notice.message}
              <button
                aria-label="Dismiss message"
                className="ml-auto"
                onClick={() => setNotice(null)}
                type="button"
              >
                <X size={15} />
              </button>
            </p>
          )}
          <div className="mt-8 border-y border-line py-5">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Truck size={18} /> Check delivery availability
            </div>
            <div className="mt-3 flex max-w-sm border-b border-ink">
              <input
                aria-label="Delivery pincode"
                className="min-w-0 flex-1 py-2 text-sm outline-none"
                inputMode="numeric"
                maxLength={6}
                onChange={(event) => changePin(event.target.value)}
                placeholder="Enter 6-digit pincode"
                value={deliveryCode}
              />
              <button
                className="text-xs font-bold uppercase disabled:opacity-50"
                disabled={pincodeLookup.status === "loading"}
                onClick={checkDelivery}
                type="button"
              >
                {pincodeLookup.status === "loading" ? "Checking…" : "Check"}
              </button>
            </div>
            {pincodeLookup.message && (
              <p aria-live="polite" className={`mt-2 text-xs ${pincodeTone}`}>
                {pincodeLookup.message}
              </p>
            )}
            <p className="mt-3 text-xs text-muted">
              Processing generally takes 2–3 business days. Delivery is
              estimated at 7–14 business days after dispatch; serviceability
              varies by location.
            </p>
          </div>
          <div className="divide-y divide-line">
            {["Description", "Details", "Shipping and delivery"]
              .filter((title) => title !== "Details" || details.length > 0)
              .map((title) => (
                <div key={title}>
                  <button
                    aria-expanded={expanded === title}
                    className="flex w-full items-center justify-between py-4 text-left text-sm font-semibold"
                    onClick={() => setExpanded(expanded === title ? "" : title)}
                    type="button"
                  >
                    {title}
                    <span>{expanded === title ? "−" : "+"}</span>
                  </button>
                  {expanded === title && title === "Description" && (
                    <p className="whitespace-pre-line pb-4 font-copy text-xs leading-6 text-muted">
                      {description}
                    </p>
                  )}
                  {expanded === title && title === "Details" && (
                    <dl className="grid grid-cols-[110px_1fr] gap-y-2 pb-4 font-copy text-xs leading-6">
                      {details.map(([label, value]) => (
                        <div className="contents" key={label}>
                          <dt className="text-muted">{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  )}
                  {expanded === title && title === "Shipping and delivery" && (
                    <p className="pb-4 font-copy text-xs leading-6 text-muted">
                      Delivery availability and shipping charges are confirmed
                      at checkout based on your delivery PIN and order. Orders
                      are generally processed in 2–3
                      business days; delivery is estimated at 7–14 business days
                      after dispatch.
                    </p>
                  )}
                </div>
              ))}
          </div>
        </div>
      </div>
      {related.length > 0 && (
        <section className="bg-canvas py-14 sm:py-20">
          <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
            <div className="mb-8 flex items-end justify-between">
              <h2 className="font-display text-3xl font-semibold">
                You may also like
              </h2>
              <Link
                className="flex items-center gap-2 text-xs font-bold uppercase"
                href="/shop"
              >
                Shop all <ArrowRight size={15} />
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Size Guide Modal */}
      {showSizeGuide && sizeChart && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-black/60 p-4"
          onClick={() => setShowSizeGuide(false)}
        >
          <div
            aria-modal="true"
            className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto bg-paper p-5 shadow-2xl border border-line"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
          >
            <div className="relative flex items-center justify-between border-b border-line pb-2">
              <div>
                <p className="text-xs font-bold uppercase text-muted">
                  GoalNet Fit Guide · {sizeChart.label}
                </p>
                {/* <h3 className="font-display text-2xl font-bold mt-0.5">
                  Jersey Size Chart
                </h3> */}
              </div>
              <button
                aria-label="Close size guide"
                className="cursor-pointer p-1 text-muted hover:text-ink transition z-10"
                onClick={() => setShowSizeGuide(false)}
                type="button"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mt-3 overflow-hidden rounded border border-line bg-white p-2">
              <div className="relative aspect-square w-full">
                <Image
                  alt={`${sizeChart.label} size chart`}
                  className="object-contain"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 680px"
                  src={sizeChart.image}
                />
              </div>
            </div>

            {/* <div className="mt-4 space-y-1 text-xs text-muted">
              <p>• All measurements are standard jersey sizing. Measurements may vary by ±0.5 inches.</p>
              <p>• For a looser, relaxed fit or when layering, we recommend choosing one size up.</p>
            </div> */}
          </div>
        </div>
      )}
    </main>
  );
}
