import type { ReactNode } from "react";

export const adminInputClass = "mt-2 w-full border border-line bg-white p-3 text-sm outline-none focus:border-ink aria-invalid:border-red-600";

export function Field({ label, error, hint, className = "", children }: { label: string; error?: string; hint?: string; className?: string; children: ReactNode }) {
  return (
    <label className={`block text-xs font-semibold ${className}`}>
      {label}
      {children}
      {hint && !error && <span className="mt-1.5 block text-[11px] font-normal text-muted">{hint}</span>}
      {error && <span className="mt-1.5 block text-xs font-normal text-red-700" role="alert">{error}</span>}
    </label>
  );
}

export function FormError({ message }: { message?: string }) {
  return message ? <p className="border-l-4 border-red-600 bg-red-50 p-3 text-sm text-red-800" role="alert">{message}</p> : null;
}
