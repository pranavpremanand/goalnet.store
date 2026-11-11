"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LuCircleAlert as CircleAlert,
  LuArrowRight as ArrowRight,
  LuCheck as Check,
  LuHeart as Heart,
  LuShare2 as Share2,
  LuTruck as Truck,
  LuX as X,
} from "react-icons/lu";
import { ProductCard } from "@/components/common/ProductCard";
import { ScrollReveal } from "@/components/common/ScrollReveal";
import { LoadingSpinner } from "@/components/common/Loading";
import { useLocalCart } from "@/components/common/LocalCartProvider";
import { useWishlist } from "@/components/common/WishlistProvider";
import { ProductImageZoom } from "@/components/pages/product-details/ProductImageZoom";
import { FIT_TYPE_LABELS, PRODUCT_TYPE_LABELS, type JerseyType } from "@/lib/catalog-constants";
import { formatRupees } from "@/lib/format";
import type { StoreProduct } from "@/lib/types/storefront";

const FALLBACK_DESCRIPTION =
  "Product material, fit and construction may vary by design. Please check the product details for the available information before ordering.";

type PincodeLookup = {
  status: "idle" | "loading" | "success" | "error" | "blocked";
  message: string;
};
type DeliveryOffice = {
  key: string;
  name: string;
  branchType: string;
  division: string;
  district: string;
  state: string;
};

type Notice = { type: "success" | "error"; message: string };

const SIZE_CHARTS: Record<JerseyType, { label: string; image: string }> = {
  "half-sleeve": {
    label: "Short Sleeves",
    image: "/images/size-charts/half-sleeve.png",
  },
  "five-sleeve": {
    label: "Five Sleeves",
    image: "/images/size-charts/five-sleeve.png",
  },
  "full-sleeve": {
    label: "Long Sleeves",
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
  const router = useRouter();
  const [size, setSize] = useState("");
  const [activeImage, setActiveImage] = useState(0);
  const [deliveryCode, setDeliveryCode] = useState("");
  const [pincodeLookup, setPincodeLookup] = useState<PincodeLookup>({
    status: "idle",
    message: "",
  });
  const [deliveryOffices, setDeliveryOffices] = useState<DeliveryOffice[]>([]);
  const [selectedOfficeKey, setSelectedOfficeKey] = useState("");
  const deliveryLookupId = useRef(0);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [expanded, setExpanded] = useState("Description");
  const { addItem, isPending: cartPending } = useLocalCart();
  const { isWishlisted, isLoading: wishlistLoading, isPending: wishlistPending, toggleWishlist } = useWishlist();
  const wishlisted = isWishlisted(product.id);
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
    ["Fit", product.fit ? FIT_TYPE_LABELS[product.fit] : ""],
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

  function buyNow() {
    if (!size) {
      setNotice({
        type: "error",
        message:
          product.sizeSystem === "one-size"
            ? "Select the option to continue."
            : "Choose a size to continue.",
      });
      return;
    }

    router.push(`/checkout?buyNow=${encodeURIComponent(product.id)}&size=${encodeURIComponent(size)}`);
  }

  async function toggleProductWishlist() {
    const result = await toggleWishlist(product);
    setNotice(result.ok
      ? { type: "success", message: wishlisted ? "Removed from your wishlist." : "Added to your wishlist." }
      : { type: "error", message: result.error });
  }

  async function checkPincode(pin: string) {
    const requestId = ++deliveryLookupId.current;
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
        district?: string;
        state?: string;
        offices?: DeliveryOffice[];
        error?: string;
      };
      if (requestId !== deliveryLookupId.current) return;

      if (!response.ok) {
        setPincodeLookup({
          status: "error",
          message:
            result.error ?? "Delivery availability could not be checked.",
        });
        return;
      }
      if (!result.serviceable) {
        setDeliveryOffices([]);
        setSelectedOfficeKey("");
        setPincodeLookup({
          status: "blocked",
          message: "India Post does not list a delivery post office for this PIN code.",
        });
        return;
      }

      const offices = result.offices ?? [];
      if (!offices.length) {
        setDeliveryOffices([]);
        setSelectedOfficeKey("");
        setPincodeLookup({
          status: "error",
          message: "No delivery post office details were returned for this PIN code.",
        });
        return;
      }
      setDeliveryOffices(offices);
      setSelectedOfficeKey((current) =>
        offices.some((office) => office.key === current)
          ? current
          : offices.length === 1
            ? offices[0].key
            : "",
      );
      const office = offices[0];
      const locality = offices.length === 1
        ? [office.name, office.district, office.state].filter(Boolean).join(", ")
        : [result.district, result.state].filter(Boolean).join(", ");
      setPincodeLookup({
        status: "success",
        message: `${offices.length === 1 ? "Delivery available through" : "Delivery available"}${locality ? ` ${locality}` : ""}.${offices.length > 1 ? " Select your post office to confirm the locality." : " Final serviceability is subject to courier confirmation."}`,
      });
    } catch {
      if (requestId === deliveryLookupId.current) {
        setPincodeLookup({
          status: "error",
          message: "The delivery service could not be reached. Please try again.",
        });
      }
    }
  }

  function changePin(next: string) {
    deliveryLookupId.current += 1;
    const pin = next.replace(/\D/g, "").slice(0, 6);
    setDeliveryCode(pin);
    setPincodeLookup({ status: "idle", message: "" });
    setDeliveryOffices([]);
    setSelectedOfficeKey("");
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
            activeIndex={activeImage}
            images={product.images.length
              ? product.images.map((image) => ({ src: image.url, alt: image.alt || product.name }))
              : [{ src: product.image, alt: product.imageAlt || product.name }]}
            onActiveIndexChange={setActiveImage}
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
                    quality={90}
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
            {product.categories.length > 0 ? product.categories.map((category) => category.name).join(" · ") : "Uncategorized"}
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold leading-tight sm:text-5xl">
            {product.name}
          </h1>
          <div className="mt-5">
            <p className="flex flex-wrap items-baseline gap-3 font-display text-3xl font-medium">
              {formatRupees(product.price)}
              {product.discountAmount ? (
                <span className="text-lg text-muted line-through">
                  {formatRupees(product.originalPrice ?? product.price + product.discountAmount)}
                </span>
              ) : product.compareAtPrice ? (
                <span className="text-lg text-muted line-through">{formatRupees(product.compareAtPrice)}</span>
              ) : null}
            </p>
            {product.discountAmount ? (
              <p className="mt-1 text-sm font-semibold text-green-800">
                {formatRupees(product.discountAmount)} off{product.offerName ? ` with ${product.offerName}` : ""}
              </p>
            ) : null}
          </div>
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
                We’ll confirm your selected{" "}
                {product.sizeSystem === "one-size" ? "option" : "size"} after
                checkout.
              </p>
            )}
          </div>
          <div className="mt-7 space-y-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                className="inline-flex min-h-14 w-full items-center justify-center bg-brand px-5 text-center text-xs font-bold uppercase transition hover:bg-[#d8df0d] disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                disabled={cartPending}
                onClick={addToBag}
                type="button"
              >
                {cartPending ? <LoadingSpinner label="Adding…" /> : "Add to bag"}
              </button>
              <button
                className="inline-flex min-h-14 w-full items-center justify-center border border-ink px-5 text-center text-xs font-bold uppercase transition hover:bg-canvas sm:text-sm"
                onClick={buyNow}
                type="button"
              >
                Buy now
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                aria-pressed={wishlisted}
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-line px-3 text-sm font-semibold transition hover:border-ink disabled:cursor-wait disabled:opacity-60"
                disabled={wishlistLoading || wishlistPending}
                onClick={() => void toggleProductWishlist()}
                type="button"
              >
                <Heart fill={wishlisted ? "currentColor" : "none"} size={16} />
                {wishlisted ? "Saved" : "Wishlist"}
              </button>
              <button
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 border border-line px-3 text-sm font-semibold transition hover:border-ink"
                onClick={shareProduct}
                type="button"
              >
                <Share2 size={16} /> Share
              </button>
            </div>
          </div>
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
                {pincodeLookup.status === "loading" ? <LoadingSpinner label="Checking…" /> : "Check"}
              </button>
            </div>
            {pincodeLookup.message && (
              <p aria-live="polite" className={`mt-2 text-xs ${pincodeTone}`}>
                {pincodeLookup.message}
              </p>
            )}
            {deliveryOffices.length > 1 && (
              <label className="mt-3 block max-w-sm text-xs font-semibold">
                Post office
                <select
                  className="mt-1.5 w-full border border-line bg-white p-2.5 text-sm font-normal"
                  onChange={(event) => {
                    const key = event.target.value;
                    setSelectedOfficeKey(key);
                    const office = deliveryOffices.find(
                      (candidate) => candidate.key === key,
                    );
                    if (office) {
                      setPincodeLookup({
                        status: "success",
                        message: `Delivery available through ${office.name}${office.district ? `, ${office.district}` : ""}${office.state ? `, ${office.state}` : ""}. Final serviceability is subject to courier confirmation.`,
                      });
                    } else {
                      setPincodeLookup({
                        status: "success",
                        message: "Delivery is available. Select a post office to confirm the locality.",
                      });
                    }
                  }}
                  value={selectedOfficeKey}
                >
                  <option value="">Select a post office</option>
                  {deliveryOffices.map((office) => (
                    <option key={office.key} value={office.key}>
                      {office.name} ({office.branchType})
                      {office.division ? ` — ${office.division}` : ""}
                    </option>
                  ))}
                </select>
              </label>
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
                <ScrollReveal className="min-w-0" key={item.id} variant="scale">
                  <ProductCard product={item} />
                </ScrollReveal>
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
                  quality={90}
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
