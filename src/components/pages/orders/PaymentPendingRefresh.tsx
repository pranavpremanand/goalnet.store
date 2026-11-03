"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// The webhook can confirm a payment a few seconds after the shopper lands here; re-fetch until it does.
export function PaymentPendingRefresh() {
  const router = useRouter();
  useEffect(() => {
    let attempts = 0;
    const timer = window.setInterval(() => {
      attempts += 1;
      router.refresh();
      if (attempts >= 12) window.clearInterval(timer);
    }, 5000);
    return () => window.clearInterval(timer);
  }, [router]);
  return null;
}
