"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuMinus as Minus, LuPlus as Plus, LuTrash2 as Trash2 } from "react-icons/lu";
import { formatRupees } from "@/lib/format";
import { useLocalCart } from "@/components/common/LocalCartProvider";
import { useDemoStore, type OrderAddress } from "@/lib/demo-store";
import { apiRequest } from "@/lib/api-client";
import { signOutUser } from "@/lib/auth-client";
import { createCheckoutSession, openRazorpayCheckout, verifyPayment } from "@/lib/razorpay-client";
import { CheckoutMethodSelection } from "./CheckoutMethodSelection";

type PincodeLookup = { status: "idle" | "loading" | "success" | "error" | "blocked"; message: string };
type SavedCheckoutAddress = OrderAddress & { id: string };

const inputClass = "mt-1.5 w-full border border-line p-3 text-sm outline-none focus:border-ink";

export function CheckoutPage() {
  const { items, total, updateQuantity, removeItem, clearCart, refreshCart, isLoading: cartLoading, isPending: cartPending, error: cartError } = useLocalCart();
  const { session } = useDemoStore();
  const [guest, setGuest] = useState(false);
  const [placedRef, setPlacedRef] = useState("");
  const [paying, setPaying] = useState(false);
  const [payError, setPayError] = useState("");
  const [draft, setDraft] = useState<Partial<OrderAddress>>({});
  const [choice, setChoice] = useState<number | "new">(0);
  const [savedAddressState, setSavedAddressState] = useState<{ email: string; addresses: SavedCheckoutAddress[] } | null>(null);
  const [savedAddressError, setSavedAddressError] = useState<{ email: string; message: string } | null>(null);
  const [savedAddressReload, setSavedAddressReload] = useState(0);
  const [billingDifferent, setBillingDifferent] = useState(false);
  const [billing, setBilling] = useState("");
  const [saveForLater, setSaveForLater] = useState(true);
  const [pincodeLookup, setPincodeLookup] = useState<PincodeLookup>({ status: "idle", message: "" });
  const [shippingQuote, setShippingQuote] = useState<{ pin: string; quantity: number; fee: number } | null>(null);
  const lookupRequestId = useRef(0);

  const saved = session && savedAddressState?.email === session.email ? savedAddressState.addresses : [];
  const savedAddressesError = session && savedAddressError?.email === session.email ? savedAddressError.message : "";
  const hasLoadedSavedAddresses = Boolean(session && savedAddressState?.email === session.email);
  const savedAddressesLoading = Boolean(session && !hasLoadedSavedAddresses && !savedAddressesError);
  const savedChoice = typeof choice === "number" ? saved[choice] : undefined;
  const useSaved = Boolean(savedChoice);
  const prefill: Partial<OrderAddress> = session ? { name: session.name, email: session.email, phone: session.phone } : {};
  const stage = session || guest ? "details" : "method";
  const quantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const hasUnavailableItems = items.some((item) => !item.available);

  useEffect(() => {
    const email = session?.email ?? "";
    if (!email) return;

    let active = true;
    async function fetchAddresses() {
      try {
        const result = await apiRequest<{ addresses: SavedCheckoutAddress[] }>("/api/account/addresses");
        if (!active) return;
        setSavedAddressState({ email, addresses: result.addresses });
        setSavedAddressError(null);
        setChoice(result.addresses.length ? 0 : "new");
      } catch (error) {
        if (!active) return;
        setSavedAddressError({ email, message: error instanceof Error ? error.message : "Saved addresses could not be loaded." });
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

  const shipping: OrderAddress = savedChoice ?? {
    name: value("name"), email: value("email"), phone: value("phone"), pin: value("pin"),
    state: value("state"), city: value("city"), address: value("address"), apartment: value("apartment"),
  };

  const currentPin = useSaved ? savedChoice?.pin ?? "" : String(draft.pin ?? prefill.pin ?? "");
  const quoteIsCurrent = shippingQuote?.pin === currentPin && shippingQuote.quantity === quantity;
  const shippingFee = shippingQuote?.fee ?? null;
  const totalDue = total + (shippingFee ?? 0);
  const quoteActionLabel = quoteIsCurrent
    ? `Pay ${formatRupees(totalDue)}`
    : pincodeLookup.status === "loading"
      ? "Updating shipping…"
      : pincodeLookup.status === "error"
        ? "Shipping quote unavailable"
        : pincodeLookup.status === "blocked"
          ? "Delivery unavailable"
          : /^\d{6}$/.test(currentPin)
            ? "Checking delivery…"
            : "Enter PIN for delivery quote";

  const checkPincode = useCallback(async (pin: string) => {
    const requestId = ++lookupRequestId.current;
    setPincodeLookup({ status: "loading", message: "Checking delivery availability…" });
    try {
      const response = await fetch("/api/delivery/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pincode: pin, quantity }),
        cache: "no-store",
      });
      const result = await response.json() as { serviceable?: boolean; shippingFee?: number | null; city?: string; district?: string; state?: string; error?: string };
      if (requestId !== lookupRequestId.current) return;

      if (!response.ok) {
        setPincodeLookup({ status: "error", message: result.error ?? "Delivery availability could not be checked." });
        return;
      }
      if (!result.serviceable) {
        setPincodeLookup({ status: "blocked", message: "India Post does not list a delivery post office for this PIN code." });
        return;
      }

      if (typeof result.shippingFee !== "number" || !Number.isFinite(result.shippingFee)) {
        setPincodeLookup({ status: "error", message: "The shipping charge could not be calculated. Please try again." });
        return;
      }

      setShippingQuote({ pin, quantity, fee: result.shippingFee });
      const city = result.city || result.district;
      if (!useSaved) {
        setDraft((current) => (current.pin === pin ? { ...current, city: city ?? current.city, state: result.state ?? current.state } : current));
      }
      const locality = [city, result.state].filter(Boolean).join(", ");
      setPincodeLookup({ status: "success", message: `Delivery available${locality ? ` to ${locality}` : ""}.` });
    } catch {
      if (requestId === lookupRequestId.current) {
        setPincodeLookup({ status: "error", message: "The delivery service could not be reached. Please try again." });
      }
    }
  }, [quantity, useSaved]);

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
  }

  function selectAddress(nextChoice: number | "new") {
    const nextAddress = typeof nextChoice === "number" ? saved[nextChoice] : undefined;
    const nextPin = nextAddress?.pin ?? String(draft.pin ?? prefill.pin ?? "");
    if (nextPin !== currentPin) {
      lookupRequestId.current += 1;
      setPincodeLookup({ status: "idle", message: "" });
      setShippingQuote(null);
    }
    setChoice(nextChoice);
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (paying) return;
    if (pincodeLookup.status !== "success" || !quoteIsCurrent) {
      setPayError("Check a deliverable PIN code and shipping charge before continuing.");
      return;
    }
    setPaying(true);
    setPayError("");

    if (session && saveForLater && !useSaved) {
      try {
        const result = await apiRequest<{ addresses: SavedCheckoutAddress[]; savedAddressId: string }>("/api/account/addresses", {
          method: "POST",
          body: JSON.stringify(shipping),
        });
        setSavedAddressState({ email: session.email, addresses: result.addresses });
        const savedAddressIndex = result.addresses.findIndex((address) => address.id === result.savedAddressId);
        if (savedAddressIndex < 0) {
          throw new Error("The address was saved, but checkout could not select it. Reload checkout to refresh your saved addresses.");
        }
        setChoice(savedAddressIndex);
      } catch (error) {
        setPayError(error instanceof Error ? error.message : "The address could not be saved to your account.");
        setPaying(false);
        return;
      }
    }

    // The server reads the persisted cart and reprices it from the current catalog.
    const created = await createCheckoutSession({
      shipping,
      billingAddress: billingDifferent ? billing.trim() : null,
    });
    if (!created.ok) {
      setPayError(created.error);
      setPaying(false);
      return;
    }

    const checkoutSession = created.data;
    async function finish() {
      setPlacedRef(checkoutSession.orderNumber);
      await clearCart();
      window.location.replace(`/order-confirmation/${checkoutSession.accessToken}`);
    }

    await openRazorpayCheckout({
      session: checkoutSession,
      prefill: { name: shipping.name, email: shipping.email, contact: shipping.phone },
      onDismiss: () => setPaying(false),
      onFailure: setPayError,
      onSuccess: async (response) => {
        const verified = await verifyPayment(checkoutSession.accessToken, response);
        // A network or server hiccup still lands on the confirmation page, which keeps checking until the payment is confirmed.
        if (verified.ok || verified.status === 0 || verified.status >= 500) {
          finish();
          return;
        }
        setPayError(`${verified.error} Reference: ${checkoutSession.orderNumber}.`);
        setPaying(false);
      },
    });
  }

  if (placedRef) {
    return <main className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-5 text-center"><p aria-live="polite" className="font-display text-2xl font-semibold">Payment received. Preparing your confirmation…</p></main>;
  }

  if (!items.length && cartLoading) {
    return <main className="mx-auto grid min-h-[65vh] max-w-3xl place-items-center px-5 text-center"><p className="text-sm text-muted">Loading your bag…</p></main>;
  }

  if (!items.length && cartError) {
    return <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 text-center"><p className="text-sm text-red-700">{cartError}</p><button className="mt-4 border border-ink px-5 py-3 text-sm font-bold uppercase" onClick={() => void refreshCart()} type="button">Try again</button></main>;
  }

  if (!items.length) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
        <p className="mt-6 text-xs font-bold uppercase text-muted">Your next favorite is waiting</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Your bag is empty.</h1>
        <p className="mt-3 max-w-md font-copy text-sm leading-6 text-muted">Explore the collection and add an item to get matchday ready.</p>
        <Link className="mt-7 inline-flex min-h-12 items-center bg-brand px-6 text-sm font-bold uppercase" href="/shop">Explore products</Link>
      </main>
    );
  }

  const pincodeTone = pincodeLookup.status === "success" ? "text-[#16812c]" : pincodeLookup.status === "idle" || pincodeLookup.status === "loading" ? "text-muted" : "text-red-700";

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <p className="text-xs font-semibold uppercase text-muted"><Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / Checkout</p>
      <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Almost yours.</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <section>
          {stage === "method" ? (
            <CheckoutMethodSelection onGuest={() => setGuest(true)} />
          ) : (
            <form id="checkout-form" onSubmit={submit}>
              <div className="flex items-center justify-between border-b border-line pb-4"><h2 className="font-display text-2xl font-semibold">Delivery information</h2></div>
              <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                {session ? <>Signed in as <span className="font-semibold text-ink">{session.name}</span> ({session.email})<button className="font-bold uppercase underline" onClick={() => void signOutUser()} type="button">Sign out</button></> : <>Checking out as a guest. No account or password needed.<button className="font-bold uppercase underline" onClick={() => setGuest(false)} type="button">Change</button></>}
              </p>

              {savedAddressesLoading && <p className="mt-5 text-sm text-muted" role="status">Loading your saved delivery addresses…</p>}
              {savedAddressesError && (
                <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-red-700" role="alert">
                  <span>{savedAddressesError}</span>
                  <button className="font-bold underline" onClick={() => setSavedAddressReload((current) => current + 1)} type="button">Try again</button>
                </div>
              )}
              {saved.length > 0 && (
                <fieldset className="mt-5 grid gap-3">
                  <legend className="sr-only">Saved addresses</legend>
                  {saved.map((address, index) => (
                    <label className={`flex cursor-pointer items-start gap-3 border p-4 ${choice === index ? "border-ink bg-canvas" : "border-line"}`} key={address.id}>
                      <input checked={choice === index} className="mt-1 accent-[#f2fa18]" name="saved-address" onChange={() => selectAddress(index)} type="radio" />
                      <span className="text-sm"><span className="block font-semibold">{address.name}{index === 0 && <span className="ml-2 text-[10px] font-bold uppercase text-muted">Default address</span>}</span><span className="mt-1 block text-muted">{[address.apartment, address.address].filter(Boolean).join(", ")}, {address.city}, {address.state} {address.pin}</span><span className="mt-1 block text-muted">{address.phone} · {address.email}</span></span>
                    </label>
                  ))}
                  <label className={`flex cursor-pointer items-center gap-3 border p-4 text-sm font-semibold ${choice === "new" ? "border-ink bg-canvas" : "border-line"}`}>
                    <input checked={choice === "new"} className="accent-[#f2fa18]" name="saved-address" onChange={() => selectAddress("new")} type="radio" />
                    Use a new address
                  </label>
                </fieldset>
              )}

              {!useSaved && !(session && savedAddressesLoading) && (
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <label className="text-xs font-semibold">Full name<input autoComplete="name" className={inputClass} onChange={(event) => setField("name", event.target.value)} required value={value("name")} /></label>
                  <label className="text-xs font-semibold">Mobile number<input autoComplete="tel" className={inputClass} inputMode="tel" onChange={(event) => setField("phone", event.target.value)} pattern="[+0-9 ()\-]{10,15}" required title="Enter a valid mobile number" value={value("phone")} /></label>
                  <label className="text-xs font-semibold sm:col-span-2">Email address<input autoComplete="email" className={inputClass} onChange={(event) => setField("email", event.target.value)} required type="email" value={value("email")} /><span className="mt-1 block text-[11px] font-normal text-muted">Your order confirmation will be sent here.</span></label>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold">PIN code<input autoComplete="postal-code" className={inputClass} inputMode="numeric" maxLength={6} onChange={(event) => changePin(event.target.value)} pattern="\d{6}" required title="Enter a 6-digit PIN code" value={value("pin")} /></label>
                    {pincodeLookup.message && <p aria-live="polite" className={`mt-2 text-xs ${pincodeTone}`}>{pincodeLookup.message}</p>}
                  </div>
                  <label className="text-xs font-semibold">State<input autoComplete="address-level1" className={inputClass} readOnly={shippingQuote?.pin === currentPin} onChange={(event) => setField("state", event.target.value)} required value={value("state")} /></label>
                  <label className="text-xs font-semibold">City<input autoComplete="address-level2" className={inputClass} readOnly={shippingQuote?.pin === currentPin} onChange={(event) => setField("city", event.target.value)} required value={value("city")} /></label>
                  <label className="text-xs font-semibold sm:col-span-2">Full delivery address<textarea autoComplete="street-address" className={inputClass} onChange={(event) => setField("address", event.target.value)} required rows={3} value={value("address")} /></label>
                  <label className="text-xs font-semibold sm:col-span-2">Apartment / house name <span className="font-normal text-muted">(optional)</span><input className={inputClass} onChange={(event) => setField("apartment", event.target.value)} value={value("apartment")} /></label>
                  {session && <label className="flex items-center gap-2 text-xs text-muted sm:col-span-2"><input checked={saveForLater} className="size-4 accent-[#f2fa18]" onChange={(event) => setSaveForLater(event.target.checked)} type="checkbox" />Save this address to my account</label>}
                </div>
              )}

              <div className="mt-5 border-t border-line pt-5">
                <label className="flex items-center gap-2 text-sm"><input checked={billingDifferent} className="size-4 accent-[#f2fa18]" onChange={(event) => setBillingDifferent(event.target.checked)} type="checkbox" />Billing address is different from delivery address</label>
                {billingDifferent && <label className="mt-3 block text-xs font-semibold">Billing address<textarea className={inputClass} onChange={(event) => setBilling(event.target.value)} required rows={3} value={billing} /></label>}
              </div>
            </form>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between border-b border-line pb-4"><h2 className="font-display text-2xl font-semibold">Review your order</h2><span className="text-xs text-muted">{items.reduce((sum, item) => sum + item.quantity, 0)} items</span></div>
          <div className="divide-y divide-line">{items.map((item) => <div className="flex gap-4 py-5" key={`${item.id}-${item.size}`}><div className="relative aspect-4/5 w-20.5 shrink-0 bg-canvas"><Image alt={item.imageAlt} className="object-cover" fill sizes="82px" src={item.image} /></div><div className="min-w-0 flex-1"><Link className="font-semibold" href={`/product-info/${item.slug}`}>{item.name}</Link><p className="mt-1 text-xs text-muted">Size {item.size}</p>{!item.available && <p className="mt-1 text-xs text-red-700">This item is no longer available. Remove it to continue.</p>}<div className="mt-3 flex items-center gap-2"><button aria-label="Decrease quantity" className="grid size-7 place-items-center border border-line disabled:opacity-50" disabled={cartPending || !item.available} onClick={() => { void updateQuantity(item.id, item.size, item.quantity - 1); }} type="button"><Minus size={13} /></button><span className="w-5 text-center text-sm">{item.quantity}</span><button aria-label="Increase quantity" className="grid size-7 place-items-center border border-line disabled:opacity-50" disabled={cartPending || !item.available} onClick={() => { void updateQuantity(item.id, item.size, item.quantity + 1); }} type="button"><Plus size={13} /></button><button aria-label="Remove item" className="ml-2 text-muted hover:text-red-600 disabled:opacity-50" disabled={cartPending} onClick={() => { void removeItem(item.id, item.size); }} type="button"><Trash2 size={15} /></button></div></div><p className="shrink-0 text-sm font-bold">{formatRupees(item.price * item.quantity)}</p></div>)}</div>
          <div className="space-y-3 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatRupees(total)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Shipping</span><span className="inline-flex items-center gap-2">{shippingFee === null ? (pincodeLookup.status === "loading" ? "Calculating…" : "Enter a PIN to calculate") : formatRupees(shippingFee)}{!quoteIsCurrent && shippingFee !== null && <span className="text-xs text-muted">{pincodeLookup.status === "loading" ? "Updating…" : "Previous quote"}</span>}</span></div>
            <div className="flex justify-between border-t border-line pt-4 text-base font-bold"><span>Total</span><span>{formatRupees(totalDue)}</span></div>
          </div>
          {/* <p className="mt-3 text-xs leading-5 text-muted">Orders with multiple items may have an additional shipping charge. Any applicable charge will be shown before confirmation.</p> */}
          {(cartError || hasUnavailableItems) && <p aria-live="polite" className="mt-3 text-sm text-red-700" role="alert">{cartError || "Remove unavailable items before placing your order."}</p>}
          {cartError && <button className="mt-2 text-xs font-bold uppercase underline" disabled={cartLoading} onClick={() => void refreshCart()} type="button">{cartLoading ? "Refreshing bag…" : "Refresh bag"}</button>}
          <button className="mt-6 min-h-12 w-full bg-brand text-sm font-bold uppercase transition hover:bg-[#d8df0d] disabled:cursor-not-allowed disabled:opacity-50" disabled={paying || cartPending || cartLoading || Boolean(cartError) || hasUnavailableItems || stage === "method" || pincodeLookup.status !== "success" || !quoteIsCurrent} form="checkout-form" type="submit">{paying ? "Processing…" : quoteActionLabel}</button>
          {payError && <p aria-live="polite" className="mt-3 text-sm text-red-700" role="alert">{payError}</p>}
          {stage === "method" && <p className="mt-2 text-center text-xs text-muted">Choose how to continue to enter your delivery details.</p>}
          <p className="mt-3 text-center text-[11px] text-muted">Secure payment by Razorpay. UPI, cards, net banking and wallets accepted.</p>
        </section>
      </div>
    </main>
  );
}
