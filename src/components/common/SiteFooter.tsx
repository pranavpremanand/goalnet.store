import Link from "next/link";
import { ArrowUpRight, Camera } from "lucide-react";
import { BrandMark } from "@/ui/BrandMark";

export function SiteFooter() {
  return (
    <footer className="bg-ink text-white">
      <div className="mx-auto grid max-w-[1440px] gap-10 px-5 py-14 sm:px-8 md:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-10 lg:py-20">
        <div>
          <BrandMark inverse />
          <p className="mt-5 max-w-xs font-copy text-sm leading-7 text-white/65">
            For the colors you grew up with, and the game that never leaves you.
          </p>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase text-white/45">Explore</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link className="hover:text-brand" href="/shop">Shop all jerseys</Link>
            <Link className="hover:text-brand" href="/about-us">Our story</Link>
            <Link className="hover:text-brand" href="/contact-us">Contact</Link>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase text-white/45">Help</h2>
          <div className="mt-4 flex flex-col gap-3 text-sm">
            <Link className="hover:text-brand" href="/dashboard/my-orders">Track an order</Link>
            <Link className="hover:text-brand" href="/dashboard/shipping">Shipping & returns</Link>
            <Link className="hover:text-brand" href="/login">My account</Link>
          </div>
        </div>
        <div>
          <h2 className="text-xs font-bold uppercase text-white/45">Stay in the game</h2>
          <p className="mt-4 font-copy text-sm leading-6 text-white/65">New drops, old classics, and stories from the stands.</p>
          <Link className="mt-4 inline-flex items-center gap-2 border-b border-brand pb-2 text-sm font-semibold" href="/shop">
            Find your colors <ArrowUpRight size={16} />
          </Link>
          <a aria-label="Instagram" className="mt-5 grid size-9 place-items-center border border-white/25 hover:border-brand hover:text-brand" href="https://www.instagram.com/" rel="noreferrer" target="_blank">
            <Camera size={17} />
          </a>
        </div>
      </div>
      <div className="border-t border-white/15 px-5 py-4 text-center text-[11px] text-white/55">
        © 2026 GoalNet. Made for the love of the game.
      </div>
    </footer>
  );
}