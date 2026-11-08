"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  LuMinus as Minus,
  LuPlus as Plus,
  LuLoaderCircle as LoaderCircle,
  LuTrash2 as Trash2,
} from "react-icons/lu";
import { formatRupees } from "@/lib/format";
import {
  useLocalCart,
  type CartLine,
} from "@/components/common/LocalCartProvider";
import { useDemoStore, type OrderAddress } from "@/lib/demo-store";
import { apiRequest } from "@/lib/api-client";
import { signOutUser } from "@/lib/auth-client";
import type { StoreProduct } from "@/lib/types/storefront";
import {
  createCheckoutSession,
  openRazorpayCheckout,
  verifyPayment,
} from "@/lib/razorpay-client";
import {
  CheckoutLoadingSkeleton,
  LoadingSpinner,
} from "@/components/common/Loading";
import { CheckoutMethodSelection } from "./CheckoutMethodSelection";

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
type SavedCheckoutAddress = OrderAddress & { id: string };

const inputClass =
  "mt-1.5 w-full border border-line p-3 text-sm outline-none focus:border-ink";

export function CheckoutPage({
  buyNow,
}: {
  buyNow?: { productId: string; size: string };
}) {
  const {
    items,
    updateQuantity,
    removeItem,
    clearCart,
    refreshCart,
    isLoading: cartLoading,
    isPending: cartPending,
    error: cartError,
  } = useLocalCart();
  const { session } = useDemoStore();
  const [directResult, setDirectResult] = useState<{
    key: string;
    item: CartLine | null;
    error: string;
  } | null>(null);
  const [guest, setGuest] = useState(false);
  const [placedRef, setPlacedRef] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [updatingQuantityKey, setUpdatingQuantityKey] = useState<string | null>(
    null,
  );
  const [draft, setDraft] = useState<Partial<OrderAddress>>({});
  const [choice, setChoice] = useState<number | "new">(0);
  const [savedAddressState, setSavedAddressState] = useState<{
    email: string;
    addresses: SavedCheckoutAddress[];
  } | null>(null);
  const [savedAddressError, setSavedAddressError] = useState<{
    email: string;
    message: string;
  } | null>(null);
  const [savedAddressReload, setSavedAddressReload] = useState(0);
  const [billingDifferent, setBillingDifferent] = useState(false);
  const [billing, setBilling] = useState("");
  const [saveForLater, setSaveForLater] = useState(true);
  const [pincodeLookup, setPincodeLookup] = useState<PincodeLookup>({
    status: "idle",
    message: "",
  });
  const [deliveryOffices, setDeliveryOffices] = useState<DeliveryOffice[]>([]);
  const [selectedOfficeKey, setSelectedOfficeKey] = useState("");
  const [shippingQuote, setShippingQuote] = useState<{
    pin: string;
    quantity: number;
    fee: number;
  } | null>(null);
  const lookupRequestId = useRef(0);

  const directKey = buyNow
    ? JSON.stringify([buyNow.productId, buyNow.size])
    : "";
  const directItem = directResult?.key === directKey ? directResult.item : null;
  const directError = directResult?.key === directKey ? directResult.error : "";
  const directLoading = Boolean(buyNow && directResult?.key !== directKey);

  useEffect(() => {
    if (!buyNow) return;
    const directPurchase = buyNow;

    let active = true;
    async function loadDirectProduct() {
      try {
        const { products } = await apiRequest<{ products: StoreProduct[] }>(
          `/api/storefront/products/by-ids?id=${encodeURIComponent(directPurchase.productId)}`,
        );
        if (!active) return;
        const product = products.find(
          (candidate) => candidate.id === directPurchase.productId,
        );
        const selectedSize = product?.sizes.find(
          (option) => option.size === directPurchase.size,
        );
        if (!product || !selectedSize) {
          setDirectResult({
            key: JSON.stringify([
              directPurchase.productId,
              directPurchase.size,
            ]),
            item: null,
            error:
              "This product or size is no longer available. Please return to the product page and try again.",
          });
          return;
        }
        setDirectResult({
          key: JSON.stringify([directPurchase.productId, directPurchase.size]),
          item: {
            id: product.id,
            slug: product.slug,
            name: product.name,
            image: product.image,
            imageAlt: product.imageAlt,
            price: product.price,
            originalPrice: product.originalPrice,
            discountAmount: product.discountAmount,
            offerName: product.offerName,
            size: directPurchase.size,
            quantity: 1,
            available: selectedSize.availability !== "unavailable",
          },
          error: "",
        });
      } catch (error) {
        if (active) {
          setDirectResult({
            key: JSON.stringify([
              directPurchase.productId,
              directPurchase.size,
            ]),
            item: null,
            error:
              error instanceof Error
                ? error.message
                : "The product could not be loaded. Please try again.",
          });
        }
      }
    }

    void loadDirectProduct();

    return () => {
      active = false;
    };
  }, [buyNow]);

  const checkoutItems = buyNow ? (directItem ? [directItem] : []) : items;
  const checkoutTotal = checkoutItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  async function changeQuantity(
    productId: string,
    size: string,
    quantity: number,
  ) {
    const key = JSON.stringify([productId, size]);
    setUpdatingQuantityKey(key);
    try {
      await updateQuantity(productId, size, quantity);
    } finally {
      setUpdatingQuantityKey((current) => (current === key ? null : current));
    }
  }

  const saved =
    session && savedAddressState?.email === session.email
      ? savedAddressState.addresses
      : [];
  const savedAddressesError =
    session && savedAddressError?.email === session.email
      ? savedAddressError.message
      : "";
  const hasLoadedSavedAddresses = Boolean(
    session && savedAddressState?.email === session.email,
  );
  const savedAddressesLoading = Boolean(
    session && !hasLoadedSavedAddresses && !savedAddressesError,
  );
  const savedChoice = typeof choice === "number" ? saved[choice] : undefined;
  const useSaved = Boolean(savedChoice);
  const prefill: Partial<OrderAddress> = session
    ? { name: session.name, email: session.email, phone: session.phone }
    : {};
  const stage = session || guest ? "details" : "method";
  const quantity = checkoutItems.reduce((sum, item) => sum + item.quantity, 0);
  const hasUnavailableItems = checkoutItems.some((item) => !item.available);

  useEffect(() => {
    const email = session?.email ?? "";
    if (!email) return;

    let active = true;
    async function fetchAddresses() {
      try {
        const result = await apiRequest<{ addresses: SavedCheckoutAddress[] }>(
          "/api/account/addresses",
        );
        if (!active) return;
        setSavedAddressState({ email, addresses: result.addresses });
        setSavedAddressError(null);
        setChoice(result.addresses.length ? 0 : "new");
      } catch (error) {
        if (!active) return;
        setSavedAddressError({
          email,
          message:
            error instanceof Error
              ? error.message
              : "Saved addresses could not be loaded.",
        });
      }
    }

    void fetchAddresses();
    return () => {
      active = false;
    };
  }, [session?.email, savedAddressReload]);

  function value(field: keyof OrderAddress) {
    return draft[field] ?? prefill[field] ?? "";
  }

  function setField(field: keyof OrderAddress, next: string) {
    setDraft((current) => ({ ...current, [field]: next }));
  }

  const baseShipping: OrderAddress = savedChoice ?? {
    name: value("name"),
    email: value("email"),
    phone: value("phone"),
    pin: value("pin"),
    state: value("state"),
    city: value("city"),
    address: value("address"),
    apartment: value("apartment"),
  };
  const selectedOffice = deliveryOffices.find(
    (office) => office.key === selectedOfficeKey,
  );
  const shipping: OrderAddress = selectedOffice
    ? {
        ...baseShipping,
        city: selectedOffice.name,
        state: selectedOffice.state,
      }
    : baseShipping;

  const currentPin = useSaved
    ? (savedChoice?.pin ?? "")
    : String(draft.pin ?? prefill.pin ?? "");
  const quoteIsCurrent =
    shippingQuote?.pin === currentPin &&
    shippingQuote.quantity === quantity &&
    Boolean(selectedOffice);
  const shippingFee = shippingQuote?.fee ?? null;
  const totalDue = checkoutTotal + (shippingFee ?? 0);
  const quoteActionLabel = quoteIsCurrent
    ? `Pay ${formatRupees(totalDue)}`
    : pincodeLookup.status === "loading"
      ? "Updating shipping…"
      : pincodeLookup.status === "error"
        ? "Shipping quote unavailable"
        : pincodeLookup.status === "blocked"
          ? "Delivery unavailable"
            : deliveryOffices.length > 1 && !selectedOffice
              ? "Select a post office"
            : /^\d{6}$/.test(currentPin)
            ? "Checking delivery…"
            : "Enter PIN for delivery quote";

  const checkPincode = useCallback(
    async (pin: string) => {
      const requestId = ++lookupRequestId.current;
      setPincodeLookup({
        status: "loading",
        message: "Checking delivery availability…",
      });
      try {
        const response = await fetch("/api/delivery/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ pincode: pin, quantity }),
          cache: "no-store",
        });
        const result = (await response.json()) as {
          serviceable?: boolean;
          shippingFee?: number | null;
          district?: string;
          state?: string;
          offices?: DeliveryOffice[];
          error?: string;
        };
        if (requestId !== lookupRequestId.current) return;

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
            message:
              "India Post does not list a delivery post office for this PIN code.",
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

        if (
          typeof result.shippingFee !== "number" ||
          !Number.isFinite(result.shippingFee)
        ) {
          setPincodeLookup({
            status: "error",
            message:
              "The shipping charge could not be calculated. Please try again.",
          });
          return;
        }

        setShippingQuote({ pin, quantity, fee: result.shippingFee });
        setDeliveryOffices(offices);
        setSelectedOfficeKey((current) =>
          offices.some((office) => office.key === current)
            ? current
            : offices.length === 1
              ? offices[0].key
              : "",
        );
        const office = offices[0];
        const locality =
          offices.length === 1
            ? [office.name, office.district, office.state]
                .filter(Boolean)
                .join(", ")
            : [result.district, result.state].filter(Boolean).join(", ");
        setPincodeLookup({
          status: "success",
          message: `${offices.length === 1 ? "Delivery available through" : "Delivery available"}${locality ? ` ${locality}` : ""}.${offices.length > 1 ? " Select your post office to complete the delivery address." : ""}`,
        });
      } catch {
        if (requestId === lookupRequestId.current) {
          setPincodeLookup({
            status: "error",
            message:
              "The delivery service could not be reached. Please try again.",
          });
        }
      }
    },
    [quantity],
  );

  useEffect(() => {
    if (!/^\d{6}$/.test(currentPin)) {
      lookupRequestId.current += 1;
      return;
    }

    let active = true;
    void Promise.resolve().then(() => {
      if (active) return checkPincode(currentPin);
    });
    return () => {
      active = false;
      lookupRequestId.current += 1;
    };
  }, [checkPincode, currentPin]);

  function changePin(next: string) {
    const pin = next.replace(/\D/g, "").slice(0, 6);
    lookupRequestId.current += 1;
    setField("pin", pin);
    setPincodeLookup({ status: "idle", message: "" });
    setShippingQuote(null);
    setDeliveryOffices([]);
    setSelectedOfficeKey("");
  }

  function selectAddress(nextChoice: number | "new") {
    if (nextChoice === "new") {
      setDraft({
        name: "",
        email: "",
        phone: "",
        pin: "",
        state: "",
        city: "",
        address: "",
        apartment: "",
      });
      lookupRequestId.current += 1;
      setPincodeLookup({ status: "idle", message: "" });
      setShippingQuote(null);
      setDeliveryOffices([]);
      setSelectedOfficeKey("");
      setChoice("new");
      return;
    }

    const nextAddress =
      saved[nextChoice];
    const nextPin = nextAddress?.pin ?? String(draft.pin ?? prefill.pin ?? "");
    if (nextPin !== currentPin) {
      lookupRequestId.current += 1;
      setPincodeLookup({ status: "idle", message: "" });
      setShippingQuote(null);
    }
    const savedOffice = nextAddress
      ? deliveryOffices.find(
          (office) =>
            office.name.toLocaleLowerCase() ===
            nextAddress.city.trim().toLocaleLowerCase(),
        )
      : undefined;
    setSelectedOfficeKey(
      savedOffice?.key ??
        (deliveryOffices.length === 1 ? deliveryOffices[0].key : ""),
    );
    setChoice(nextChoice);
  }

  function selectPostOffice(key: string) {
    setSelectedOfficeKey(key);
    const office = deliveryOffices.find((candidate) => candidate.key === key);
    if (!useSaved && office) {
      setField("city", office.name);
      setField("state", office.state);
    }
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (paying) return;
    if (pincodeLookup.status !== "success" || !quoteIsCurrent) {
      setPayError(
        "Check a deliverable PIN code and shipping charge before continuing.",
      );
      return;
    }
    setPaying(true);
    setPayError("");

    if (session && saveForLater && !useSaved) {
      try {
        const result = await apiRequest<{
          addresses: SavedCheckoutAddress[];
          savedAddressId: string;
        }>("/api/account/addresses", {
          method: "POST",
          body: JSON.stringify(shipping),
        });
        setSavedAddressState({
          email: session.email,
          addresses: result.addresses,
        });
        const savedAddressIndex = result.addresses.findIndex(
          (address) => address.id === result.savedAddressId,
        );
        if (savedAddressIndex < 0) {
          throw new Error(
            "The address was saved, but checkout could not select it. Reload checkout to refresh your saved addresses.",
          );
        }
        setChoice(savedAddressIndex);
      } catch (error) {
        setPayError(
          error instanceof Error
            ? error.message
            : "The address could not be saved to your account.",
        );
        setPaying(false);
        return;
      }
    }

    // The server reprices the checkout lines from the current catalog.
    const created = await createCheckoutSession({
      shipping,
      postOffice: selectedOfficeKey,
      billingAddress: billingDifferent ? billing.trim() : null,
      ...(buyNow ? { buyNow } : {}),
    });
    if (!created.ok) {
      setPayError(created.error);
      setPaying(false);
      return;
    }

    const checkoutSession = created.data;
    async function finish() {
      setPlacedRef(checkoutSession.orderNumber);
      if (!buyNow) await clearCart();
      window.location.replace(
        `/order-confirmation/${checkoutSession.accessToken}`,
      );
    }

    await openRazorpayCheckout({
      session: checkoutSession,
      prefill: {
        name: shipping.name,
        email: shipping.email,
        contact: shipping.phone,
      },
      onDismiss: () => setPaying(false),
      onFailure: setPayError,
      onSuccess: async (response) => {
        const verified = await verifyPayment(
          checkoutSession.accessToken,
          response,
        );
        // A network or server hiccup still lands on the confirmation page, which keeps checking until the payment is confirmed.
        if (verified.ok || verified.status === 0 || verified.status >= 500) {
          finish();
          return;
        }
        setPayError(
          `${verified.error} Reference: ${checkoutSession.orderNumber}.`,
        );
        setPaying(false);
      },
    });
  }

  if (placedRef) {
    return (
      <main className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-5 text-center">
        <p aria-live="polite" className="font-display text-2xl font-semibold">
          Payment received. Preparing your confirmation…
        </p>
      </main>
    );
  }

  if (buyNow && directLoading) {
    return <CheckoutLoadingSkeleton />;
  }

  if (buyNow && (directError || !directItem)) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
        <p className="text-sm text-red-700">
          {directError || "This product could not be loaded."}
        </p>
        <Link
          className="mt-4 border border-ink px-5 py-3 text-sm font-bold uppercase"
          href="/shop"
        >
          Continue shopping
        </Link>
      </main>
    );
  }

  if (!buyNow && !items.length && cartLoading) {
    return <CheckoutLoadingSkeleton />;
  }

  if (!buyNow && !items.length && cartError) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 text-center">
        <p className="text-sm text-red-700">{cartError}</p>
        <button
          className="mt-4 border border-ink px-5 py-3 text-sm font-bold uppercase"
          onClick={() => void refreshCart()}
          type="button"
        >
          Try again
        </button>
      </main>
    );
  }

  if (!buyNow && !items.length) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
        <p className="mt-6 text-xs font-bold uppercase text-muted">
          Your next favorite is waiting
        </p>
        <h1 className="mt-2 font-display text-4xl font-semibold">
          Your bag is empty.
        </h1>
        <p className="mt-3 max-w-md font-copy text-sm leading-6 text-muted">
          Explore the collection and add an item to get matchday ready.
        </p>
        <Link
          className="mt-7 inline-flex min-h-12 items-center bg-brand px-6 text-sm font-bold uppercase"
          href="/shop"
        >
          Explore products
        </Link>
      </main>
    );
  }

  const pincodeTone =
    pincodeLookup.status === "success"
      ? "text-[#16812c]"
      : pincodeLookup.status === "idle" || pincodeLookup.status === "loading"
        ? "text-muted"
        : "text-red-700";

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <p className="text-xs font-semibold uppercase text-muted">
        <Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / Checkout
      </p>
      <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">
        Almost yours.
      </h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <section>
          {stage === "method" ? (
            <CheckoutMethodSelection onGuest={() => setGuest(true)} />
          ) : (
            <form id="checkout-form" onSubmit={submit}>
              <div className="flex items-center justify-between border-b border-line pb-4">
                <h2 className="font-display text-2xl font-semibold">
                  Delivery information
                </h2>
              </div>
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                {session ? (
                  <>
                    Signed in as{" "}
                    <span className="font-semibold text-ink">
                      {session.name}
                    </span>{" "}
                    ({session.email})
                    <button
                      className="font-bold uppercase underline"
                      onClick={() => void signOutUser()}
                      type="button"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    Checking out as a guest. No account or password needed.
                    <button
                      className="font-bold uppercase underline"
                      onClick={() => setGuest(false)}
                      type="button"
                    >
                      Change
                    </button>
                  </>
                )}
              </p>

              {savedAddressesLoading && (
                <p className="mt-5 text-sm text-muted" role="status">
                  Loading your saved delivery addresses…
                </p>
              )}
              {savedAddressesError && (
                <div
                  className="mt-5 flex flex-wrap items-center gap-3 text-sm text-red-700"
                  role="alert"
                >
                  <span>{savedAddressesError}</span>
                  <button
                    className="font-bold underline"
                    onClick={() =>
                      setSavedAddressReload((current) => current + 1)
                    }
                    type="button"
                  >
                    Try again
                  </button>
                </div>
              )}
              {saved.length > 0 && (
                <fieldset className="mt-5 grid gap-3">
                  <legend className="sr-only">Saved addresses</legend>
                  {saved.map((address, index) => (
                    <label
                      className={`flex cursor-pointer items-start gap-3 border p-4 ${choice === index ? "border-ink bg-canvas" : "border-line"}`}
                      key={address.id}
                    >
                      <input
                        checked={choice === index}
                        className="mt-1 accent-[#f2fa18]"
                        name="saved-address"
                        onChange={() => selectAddress(index)}
                        type="radio"
                      />
                      <span className="text-sm">
                        <span className="block font-semibold">
                          {address.name}
                          {index === 0 && (
                            <span className="ml-2 text-[10px] font-bold uppercase text-muted">
                              Default address
                            </span>
                          )}
                        </span>
                        <span className="mt-1 block text-muted">
                          {[address.apartment, address.address]
                            .filter(Boolean)
                            .join(", ")}
                          , {address.city}, {address.state} {address.pin}
                        </span>
                        <span className="mt-1 block text-muted">
                          {address.phone} · {address.email}
                        </span>
                      </span>
                    </label>
                  ))}
                  <label
                    className={`flex cursor-pointer items-center gap-3 border p-4 text-sm font-semibold ${choice === "new" ? "border-ink bg-canvas" : "border-line"}`}
                  >
                    <input
                      checked={choice === "new"}
                      className="accent-[#f2fa18]"
                      name="saved-address"
                      onChange={() => selectAddress("new")}
                      type="radio"
                    />
                    Use a new address
                  </label>
                </fieldset>
              )}

              {!useSaved && !(session && savedAddressesLoading) && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold">
                    Full name
                    <input
                      autoComplete="name"
                      className={inputClass}
                      onChange={(event) => setField("name", event.target.value)}
                      required
                      value={value("name")}
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    Mobile number
                    <input
                      autoComplete="tel"
                      className={inputClass}
                      inputMode="tel"
                      onChange={(event) =>
                        setField("phone", event.target.value)
                      }
                      pattern="[+0-9 ()\-]{10,15}"
                      required
                      title="Enter a valid mobile number"
                      value={value("phone")}
                    />
                  </label>
                  <label className="text-xs font-semibold sm:col-span-2">
                    Email address
                    <input
                      autoComplete="email"
                      className={inputClass}
                      onChange={(event) =>
                        setField("email", event.target.value)
                      }
                      required
                      type="email"
                      value={value("email")}
                    />
                    <span className="mt-1 block text-[11px] font-normal text-muted">
                      Your order confirmation will be sent here.
                    </span>
                  </label>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold">
                      PIN code
                      <input
                        autoComplete="postal-code"
                        className={inputClass}
                        inputMode="numeric"
                        maxLength={6}
                        onChange={(event) => changePin(event.target.value)}
                        pattern="\d{6}"
                        required
                        title="Enter a 6-digit PIN code"
                        value={value("pin")}
                      />
                    </label>
                    {pincodeLookup.message && (
                      <p
                        aria-live="polite"
                        className={`mt-2 text-xs ${pincodeTone}`}
                      >
                        {pincodeLookup.message}
                      </p>
                    )}
                    {deliveryOffices.length > 1 && (
                      <label className="mt-3 block text-xs font-semibold">
                        Post office
                        <select
                          className={inputClass}
                          onChange={(event) =>
                            selectPostOffice(event.target.value)
                          }
                          required
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
                  </div>
                  <label className="text-xs font-semibold">
                    State
                    <input
                      autoComplete="address-level1"
                      className={inputClass}
                      readOnly={shippingQuote?.pin === currentPin}
                      onChange={(event) =>
                        setField("state", event.target.value)
                      }
                      required
                      value={shipping.state}
                    />
                  </label>
                  <label className="text-xs font-semibold">
                    City
                    <input
                      autoComplete="address-level2"
                      className={inputClass}
                      readOnly={shippingQuote?.pin === currentPin}
                      onChange={(event) => setField("city", event.target.value)}
                      required
                      value={shipping.city}
                    />
                  </label>
                  <label className="text-xs font-semibold sm:col-span-2">
                    Full delivery address
                    <textarea
                      autoComplete="street-address"
                      className={inputClass}
                      onChange={(event) =>
                        setField("address", event.target.value)
                      }
                      required
                      rows={3}
                      value={value("address")}
                    />
                  </label>
                  <label className="text-xs font-semibold sm:col-span-2">
                    Apartment / house name{" "}
                    <span className="font-normal text-muted">(optional)</span>
                    <input
                      className={inputClass}
                      onChange={(event) =>
                        setField("apartment", event.target.value)
                      }
                      value={value("apartment")}
                    />
                  </label>
                  {session && (
                    <label className="flex items-center gap-2 text-xs text-muted sm:col-span-2">
                      <input
                        checked={saveForLater}
                        className="size-4 accent-[#f2fa18]"
                        onChange={(event) =>
                          setSaveForLater(event.target.checked)
                        }
                        type="checkbox"
                      />
                      Save this address to my account
                    </label>
                  )}
                </div>
              )}

              <div className="mt-5 border-t border-line pt-5">
                <label className="flex items-center gap-2 text-sm">
                  <input
                    checked={billingDifferent}
                    className="size-4 accent-[#f2fa18]"
                    onChange={(event) =>
                      setBillingDifferent(event.target.checked)
                    }
                    type="checkbox"
                  />
                  Billing address is different from delivery address
                </label>
                {billingDifferent && (
                  <label className="mt-3 block text-xs font-semibold">
                    Billing address
                    <textarea
                      className={inputClass}
                      onChange={(event) => setBilling(event.target.value)}
                      required
                      rows={3}
                      value={billing}
                    />
                  </label>
                )}
              </div>
            </form>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h2 className="font-display text-2xl font-semibold">
              Review your order
            </h2>
            <span className="text-xs text-muted">
              {quantity} {quantity === 1 ? "item" : "items"}
            </span>
          </div>
          <div className="divide-y divide-line">
            {checkoutItems.map((item) => {
              const quantityIsUpdating =
                updatingQuantityKey === JSON.stringify([item.id, item.size]);
              return (
                <div
                  className="flex gap-4 py-5"
                  key={`${item.id}-${item.size}`}
                >
                  <Link
                    aria-label={`View ${item.name}`}
                    className="relative aspect-4/5 w-20.5 shrink-0 bg-canvas"
                    href={`/product-info/${item.slug}`}
                  >
                    <Image
                      alt={item.imageAlt}
                      className="object-cover"
                      fill
                      sizes="82px"
                      src={item.image}
                    />
                  </Link>
                  <div className="min-w-0 flex-1">
                    <Link
                      className="font-semibold"
                      href={`/product-info/${item.slug}`}
                    >
                      {item.name}
                    </Link>
                    <p className="mt-1 text-xs text-muted">Size {item.size}</p>
                    {!item.available && (
                      <p className="mt-1 text-xs text-red-700">
                        This size is no longer available. Return to the product
                        page and select another size.
                      </p>
                    )}
                    {!buyNow && (
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          aria-label="Decrease quantity"
                          className="grid size-7 place-items-center border border-line disabled:opacity-50"
                          disabled={cartPending || !item.available}
                          onClick={() => {
                            void changeQuantity(
                              item.id,
                              item.size,
                              item.quantity - 1,
                            );
                          }}
                          type="button"
                        >
                          <Minus size={13} />
                        </button>
                        <span
                          aria-label={
                            quantityIsUpdating ? "Updating quantity" : undefined
                          }
                          className="inline-flex w-5 justify-center text-sm"
                          role={quantityIsUpdating ? "status" : undefined}
                        >
                          {quantityIsUpdating ? (
                            <LoaderCircle
                              aria-hidden="true"
                              className="animate-spin"
                              size={13}
                            />
                          ) : (
                            item.quantity
                          )}
                        </span>
                        <button
                          aria-label="Increase quantity"
                          className="grid size-7 place-items-center border border-line disabled:opacity-50"
                          disabled={cartPending || !item.available}
                          onClick={() => {
                            void changeQuantity(
                              item.id,
                              item.size,
                              item.quantity + 1,
                            );
                          }}
                          type="button"
                        >
                          <Plus size={13} />
                        </button>
                        <button
                          aria-label="Remove item"
                          className="ml-2 text-muted hover:text-red-600 disabled:opacity-50"
                          disabled={cartPending}
                          onClick={() => {
                            void removeItem(item.id, item.size);
                          }}
                          type="button"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="shrink-0 text-right">
                    {item.discountAmount ? (
                      <>
                        <p className="text-xs text-muted line-through">
                          {formatRupees((item.originalPrice ?? item.price + item.discountAmount) * item.quantity)}
                        </p>
                        <p className="text-sm font-bold">{formatRupees(item.price * item.quantity)}</p>
                        <p className="text-[10px] font-semibold text-green-800">
                          Save {formatRupees(item.discountAmount * item.quantity)}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm font-bold">{formatRupees(item.price * item.quantity)}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="space-y-3 border-t border-line pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Subtotal</span>
              <span>{formatRupees(checkoutTotal)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Shipping</span>
              <span className="inline-flex items-center gap-2">
                {shippingFee === null
                  ? pincodeLookup.status === "loading"
                    ? "Calculating…"
                    : "Enter a PIN to calculate"
                  : formatRupees(shippingFee)}
                {!quoteIsCurrent && shippingFee !== null && (
                  <span className="text-xs text-muted">
                    {pincodeLookup.status === "loading"
                      ? "Updating…"
                      : "Previous quote"}
                  </span>
                )}
              </span>
            </div>
            <div className="flex justify-between border-t border-line pt-4 text-base font-bold">
              <span>Total</span>
              <span>{formatRupees(totalDue)}</span>
            </div>
          </div>
          {/* <p className="mt-3 text-xs leading-5 text-muted">Orders with multiple items may have an additional shipping charge. Any applicable charge will be shown before confirmation.</p> */}
          {((!buyNow && cartError) || hasUnavailableItems) && (
            <p
              aria-live="polite"
              className="mt-3 text-sm text-red-700"
              role="alert"
            >
              {(!buyNow && cartError) ||
                "Remove unavailable items before placing your order."}
            </p>
          )}
          {!buyNow && cartError && (
            <button
              className="mt-2 text-xs font-bold uppercase underline"
              disabled={cartLoading}
              onClick={() => void refreshCart()}
              type="button"
            >
              {cartLoading ? "Refreshing bag…" : "Refresh bag"}
            </button>
          )}
          <button
            aria-busy={paying}
            className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-brand text-sm font-bold uppercase transition hover:bg-[#d8df0d] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={
              paying ||
              (!buyNow && cartPending) ||
              (!buyNow && cartLoading) ||
              (!buyNow && Boolean(cartError)) ||
              hasUnavailableItems ||
              stage === "method" ||
              pincodeLookup.status !== "success" ||
              !quoteIsCurrent
            }
            form="checkout-form"
            type="submit"
          >
            {paying ? <LoadingSpinner label="Processing…" /> : quoteActionLabel}
          </button>
          {payError && (
            <p
              aria-live="polite"
              className="mt-3 text-sm text-red-700"
              role="alert"
            >
              {payError}
            </p>
          )}
          {stage === "method" && (
            <p className="mt-2 text-center text-xs text-muted">
              Choose how to continue to enter your delivery details.
            </p>
          )}
          <p className="mt-3 text-center text-[11px] text-muted">
            Secure payment by Razorpay. UPI, cards, net banking and wallets
            accepted.
          </p>
        </section>
      </div>
    </main>
  );
}
