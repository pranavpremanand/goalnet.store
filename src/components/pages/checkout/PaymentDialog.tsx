"use client";

import { useState } from "react";
import { LuLoaderCircle as Loader, LuLock as Lock, LuX as X } from "react-icons/lu";
import { formatRupees } from "@/data/products";

type PaymentDialogProps = {
  amount: number;
  email: string;
  onCancel: () => void;
  onPaid: () => void;
};

// Stand-in for the hosted payment gateway; swap onPaid for the gateway success callback.
export function PaymentDialog({ amount, email, onCancel, onPaid }: PaymentDialogProps) {
  const [processing, setProcessing] = useState(false);

  function pay() {
    setProcessing(true);
    window.setTimeout(onPaid, 1200);
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={processing ? undefined : onCancel}>
      <section aria-labelledby="payment-title" aria-modal="true" className="relative w-full max-w-md bg-paper p-7 sm:p-9" onClick={(event) => event.stopPropagation()} role="dialog">
        {!processing && <button aria-label="Cancel payment" className="absolute right-4 top-4" onClick={onCancel} type="button"><X size={20} /></button>}
        <p className="flex items-center gap-2 text-xs font-bold uppercase text-muted"><Lock size={14} /> Demo payment gateway</p>
        <h2 className="mt-2 font-display text-3xl font-semibold" id="payment-title">Pay {formatRupees(amount)}</h2>
        <p className="mt-3 font-copy text-sm leading-6 text-muted">No real payment is taken. The order confirmation will be shown for {email}.</p>
        <button className="mt-6 flex min-h-12 w-full items-center justify-center gap-2 bg-brand text-sm font-bold uppercase disabled:opacity-70" disabled={processing} onClick={pay} type="button">
          {processing ? <><Loader className="animate-spin" size={16} /> Processing payment</> : `Pay ${formatRupees(amount)}`}
        </button>
        {!processing && <button className="mt-3 w-full text-xs font-bold uppercase underline" onClick={onCancel} type="button">Back to checkout</button>}
      </section>
    </div>
  );
}
