"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuCheck as Check, LuMinus as Minus, LuPlus as Plus, LuShieldCheck as ShieldCheck, LuTrash2 as Trash2, LuX as X } from "react-icons/lu";
import { formatRupees } from "@/data/products";
import { useLocalCart } from "@/components/common/LocalCartProvider";

type Address = { name: string; phone: string; email: string; pin: string; address: string };
type PincodeLookup = { status: "idle" | "loading" | "success" | "error"; message: string };

export function CheckoutPage() {
  const { items, total, updateQuantity, removeItem, clearCart } = useLocalCart();
  const [address, setAddress] = useState<Address>({ name: "Aarav Mehta", phone: "+91 98765 43210", email: "aarav@example.com", pin: "380001", address: "12 Riverfront Road, Ahmedabad, Gujarat" });
  const [addressFormOpen, setAddressFormOpen] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [protect, setProtect] = useState(false);
  const [draft, setDraft] = useState<Address>({ name: "", phone: "", email: "", pin: "", address: "" });
  const [pincodeLookup, setPincodeLookup] = useState<PincodeLookup>({ status: "idle", message: "" });
  const totalDue = total + 80 + (protect ? 499 : 0);

  function saveAddress(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddress(draft);
    setAddressFormOpen(false);
  }

  async function checkPincode() {
    if (!/^\d{6}$/.test(draft.pin)) {
      setPincodeLookup({ status: "error", message: "Enter a valid 6-digit pincode." });
      return;
    }

    setPincodeLookup({ status: "loading", message: "Checking delivery availability…" });
    try {
      const response = await fetch(`/api/delivery/pincode?pincode=${encodeURIComponent(draft.pin)}`, { cache: "no-store" });
      const result = await response.json() as {
        serviceable?: boolean;
        city?: string;
        district?: string;
        state?: string;
        error?: string;
      };

      if (!response.ok) {
        setPincodeLookup({ status: "error", message: result.error ?? "Delivery availability could not be checked." });
        return;
      }

      if (!result.serviceable) {
        setPincodeLookup({ status: "error", message: "This pincode is not listed for prepaid delivery." });
        return;
      }

      const locality = [result.city, result.district, result.state].filter(Boolean).join(", ");
      setPincodeLookup({
        status: "success",
        message: `Pincode listed for delivery${locality ? ` in ${locality}` : ""}. Final serviceability is subject to courier confirmation.`,
      });
    } catch {
      setPincodeLookup({ status: "error", message: "The delivery service could not be reached. Please try again." });
    }
  }

  function placeOrder() {
    setSuccessOpen(true);
  }

  function dismissSuccess() {
    setSuccessOpen(false);
    clearCart();
  }

  if (!items.length) {
    return (
      <main className="mx-auto flex min-h-[65vh] max-w-3xl flex-col items-center justify-center px-5 py-16 text-center">
        <div className="grid size-20 place-items-center bg-brand"><span className="font-display text-3xl font-black">0</span></div>
        <p className="mt-6 text-xs font-bold uppercase text-muted">Your next favorite is waiting</p>
        <h1 className="mt-2 font-display text-4xl font-semibold">Your bag is empty.</h1>
        <p className="mt-3 max-w-md font-copy text-sm leading-6 text-muted">Explore the collection and add a jersey to get matchday ready.</p>
        <Link className="mt-7 inline-flex min-h-12 items-center bg-brand px-6 text-sm font-bold uppercase" href="/shop">Explore jerseys</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[1280px] px-5 py-8 sm:px-8 lg:px-12 lg:py-12">
      <p className="text-xs font-semibold uppercase text-muted"><Link href="/">Home</Link> / <Link href="/shop">Shop</Link> / Checkout</p>
      <h1 className="mt-3 font-display text-4xl font-semibold sm:text-5xl">Almost yours.</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <section>
          <div className="flex items-center justify-between border-b border-line pb-4"><h2 className="font-display text-2xl font-semibold">Delivery information</h2><span className="text-xs font-bold uppercase text-muted">01 / 02</span></div>
          <div className="mt-5 border border-line p-4 sm:p-5"><div className="flex items-start justify-between gap-4"><div className="flex gap-3"><span className="mt-1 grid size-5 shrink-0 place-items-center border border-ink bg-brand"><Check size={13} /></span><div><p className="font-semibold">{address.name}</p><p className="mt-1 text-sm text-muted">{address.address}</p><p className="mt-1 text-sm text-muted">{address.phone} · {address.email}</p><p className="mt-1 text-sm text-muted">PIN {address.pin}</p></div></div><button className="text-xs font-bold uppercase underline" onClick={() => { setDraft(address); setAddressFormOpen(true); }} type="button">Edit</button></div></div>
          {!addressFormOpen ? (
            <button
              className="mt-4 text-xs font-bold uppercase underline decoration-brand decoration-2 underline-offset-4"
              onClick={() => {
                setDraft({ name: "", phone: "", email: "", pin: "", address: "" });
                setPincodeLookup({ status: "idle", message: "" });
                setAddressFormOpen(true);
              }}
              type="button"
            >
              + Add another address
            </button>
          ) : (
            <form className="mt-5 grid gap-3 border-t border-line pt-5 sm:grid-cols-2" onSubmit={saveAddress}>
              <label className="text-xs font-semibold">Full name<input className="mt-1.5 w-full border border-line p-3 text-sm" onChange={(event) => setDraft({ ...draft, name: event.target.value })} required value={draft.name} /></label>
              <label className="text-xs font-semibold">Phone<input className="mt-1.5 w-full border border-line p-3 text-sm" onChange={(event) => setDraft({ ...draft, phone: event.target.value })} required value={draft.phone} /></label>
              <label className="text-xs font-semibold">Email<input className="mt-1.5 w-full border border-line p-3 text-sm" onChange={(event) => setDraft({ ...draft, email: event.target.value })} required type="email" value={draft.email} /></label>
              <div>
                <div className="flex items-end gap-2">
                  <label className="min-w-0 flex-1 text-xs font-semibold">Pincode<input className="mt-1.5 w-full border border-line p-3 text-sm" inputMode="numeric" maxLength={6} onChange={(event) => { setDraft({ ...draft, pin: event.target.value.replace(/\D/g, "").slice(0, 6) }); setPincodeLookup({ status: "idle", message: "" }); }} required value={draft.pin} /></label>
                  <button className="mb-px min-h-[46px] shrink-0 border border-line px-3 text-xs font-bold uppercase disabled:opacity-50" disabled={pincodeLookup.status === "loading"} onClick={checkPincode} type="button">{pincodeLookup.status === "loading" ? "Checking" : "Check"}</button>
                </div>
                {pincodeLookup.message && <p aria-live="polite" className={`mt-2 text-xs ${pincodeLookup.status === "success" ? "text-[#16812c]" : pincodeLookup.status === "error" ? "text-red-700" : "text-muted"}`}>{pincodeLookup.message}</p>}
              </div>
              <label className="text-xs font-semibold sm:col-span-2">Address<textarea className="mt-1.5 w-full border border-line p-3 text-sm" onChange={(event) => setDraft({ ...draft, address: event.target.value })} required value={draft.address} /></label>
              <div className="flex gap-3 sm:col-span-2"><button className="bg-brand px-5 py-3 text-xs font-bold uppercase" type="submit">Save address</button><button className="border border-line px-5 py-3 text-xs font-bold uppercase" onClick={() => setAddressFormOpen(false)} type="button">Cancel</button></div>
            </form>
          )}
        </section>
        <section>
          <div className="flex items-center justify-between border-b border-line pb-4"><h2 className="font-display text-2xl font-semibold">Order summary</h2><span className="text-xs text-muted">{items.reduce((sum, item) => sum + item.quantity, 0)} items</span></div>
          <div className="divide-y divide-line">{items.map((item) => <div className="flex gap-4 py-5" key={`${item.id}-${item.size}`}><div className="relative aspect-[4/5] w-[82px] shrink-0 bg-canvas"><Image alt={item.imageAlt} className="object-cover" fill sizes="82px" src={item.image} /></div><div className="min-w-0 flex-1"><Link className="font-semibold" href={`/product-info/${item.id}`}>{item.name}</Link><p className="mt-1 text-xs text-muted">Size {item.size}</p><div className="mt-3 flex items-center gap-2"><button aria-label="Decrease quantity" className="grid size-7 place-items-center border border-line" onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)} type="button"><Minus size={13} /></button><span className="w-5 text-center text-sm">{item.quantity}</span><button aria-label="Increase quantity" className="grid size-7 place-items-center border border-line" onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)} type="button"><Plus size={13} /></button><button aria-label="Remove item" className="ml-2 text-muted hover:text-red-600" onClick={() => removeItem(item.id, item.size)} type="button"><Trash2 size={15} /></button></div></div><p className="shrink-0 text-sm font-bold">{formatRupees(item.price * item.quantity)}</p></div>)}</div>
          <button aria-pressed={protect} className={`my-4 flex w-full items-center gap-3 border p-4 text-left ${protect ? "border-ink bg-canvas" : "border-line"}`} onClick={() => setProtect(!protect)} type="button"><ShieldCheck className="shrink-0" size={20} /><span className="flex-1"><span className="block text-sm font-semibold">Protect your jersey</span><span className="mt-1 block text-xs text-muted">Add one year of accidental damage cover · ₹499</span></span><span className={`grid size-5 place-items-center border ${protect ? "border-brand bg-brand" : "border-line"}`}>{protect && <Check size={13} />}</span></button>
          <div className="space-y-3 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><span className="text-muted">Subtotal</span><span>{formatRupees(total)}</span></div>
            <div className="flex justify-between"><span className="text-muted">Standard shipping</span><span>{formatRupees(80)}</span></div>
            {protect && <div className="flex justify-between"><span className="text-muted">Jersey protection</span><span>{formatRupees(499)}</span></div>}
            <div className="flex justify-between border-t border-line pt-4 text-base font-bold"><span>Total</span><span>{formatRupees(totalDue)}</span></div>
          </div>
          <p className="mt-3 text-xs leading-5 text-muted">Orders with multiple jerseys may have an additional shipping charge. Any applicable charge will be shown before confirmation.</p>
          <button className="mt-6 min-h-12 w-full bg-brand text-sm font-bold uppercase transition hover:bg-[#d8df0d]" onClick={placeOrder} type="button">Place mock order · {formatRupees(totalDue)}</button>
          <p className="mt-3 text-center text-[11px] text-muted">Demo checkout only. No payment will be collected.</p>
        </section>
      </div>
      {successOpen && <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={dismissSuccess}><section aria-labelledby="success-title" aria-modal="true" className="relative w-full max-w-md bg-paper p-7 text-center sm:p-10" onClick={(event) => event.stopPropagation()} role="dialog"><button aria-label="Close order confirmation" className="absolute right-4 top-4" onClick={dismissSuccess} type="button"><X size={20} /></button><span className="mx-auto grid size-14 place-items-center bg-brand"><Check size={26} /></span><p className="mt-5 text-xs font-bold uppercase text-muted">Demo order complete</p><h2 className="mt-2 font-display text-3xl font-semibold" id="success-title">Thanks for choosing GOALNET.</h2><p className="mt-3 font-copy text-sm leading-6 text-muted">Orders are generally processed in 2–3 business days. Delivery is estimated at 5–10 business days after dispatch.</p><button className="mt-6 bg-brand px-6 py-3 text-xs font-bold uppercase" onClick={dismissSuccess} type="button">Continue shopping</button></section></div>}
    </main>
  );
}