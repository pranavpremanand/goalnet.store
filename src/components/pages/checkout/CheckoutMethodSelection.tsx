import Link from "next/link";
import { LuArrowRight as ArrowRight } from "react-icons/lu";

export function CheckoutMethodSelection({ onGuest }: { onGuest: () => void }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-muted">Checkout</p>
      <h2 className="mt-1 font-display text-3xl font-semibold">Welcome to GOALNET Checkout</h2>
      <p className="mt-2 font-copy text-sm leading-6 text-muted">Choose how you would like to continue. Your bag stays right where you left it.</p>
      <div className="mt-6 grid gap-4">
        <div className="border-2 border-ink bg-brand p-5 sm:p-6">
          <p className="text-xs font-bold uppercase">Want to checkout quickly?</p>
          <p className="mt-1 text-sm">No account or password needed. Just your contact and delivery details.</p>
          <button className="mt-4 inline-flex min-h-12 items-center gap-2 bg-ink px-6 text-sm font-bold uppercase text-white" onClick={onGuest} type="button">Continue as guest <ArrowRight size={16} /></button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="border border-line p-5">
            <p className="text-xs font-bold uppercase text-muted">Already have an account?</p>
            <p className="mt-1 text-sm text-muted">Your saved details will be filled in for you.</p>
            <Link className="mt-4 inline-flex min-h-11 items-center border border-ink px-5 text-xs font-bold uppercase hover:bg-canvas" href="/login">Sign in</Link>
          </div>
          <div className="border border-line p-5">
            <p className="text-xs font-bold uppercase text-muted">New customer?</p>
            <p className="mt-1 text-sm text-muted">Track orders and check out faster next time.</p>
            <Link className="mt-4 inline-flex min-h-11 items-center border border-ink px-5 text-xs font-bold uppercase hover:bg-canvas" href="/signup">Create account</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
