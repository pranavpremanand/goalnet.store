"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LuArrowRight as ArrowRight,
  LuMenu as Menu,
  LuSearch as Search,
  LuShoppingBag as ShoppingBag,
  LuUserRound as UserRound,
  LuX as X,
} from "react-icons/lu";
import { BrandMark } from "@/ui/BrandMark";
import { useLocalCart } from "@/components/common/LocalCartProvider";
import { useDemoStore } from "@/lib/demo-store";

const links = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about-us" },
  { label: "Contact", href: "/contact-us" },
];

export function HomeNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useLocalCart();
  const { session } = useDemoStore();
  const accountHref = session ? "/dashboard/dashboard" : "/login";
  useEffect(() => {
    if (!menuOpen) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }

    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div className="flex min-h-9 items-center justify-center bg-ink px-4 text-center text-[11px] font-semibold uppercase text-white sm:text-xs">
        <Link className="inline-flex items-center gap-2 hover:text-brand" href="/shipping-policy">
          Standard shipping ₹80 per order <span className="hidden text-white/60 sm:inline">· See delivery details</span>
        </Link>
      </div>
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-4 sm:px-7 lg:px-10"
        >
          <div className="flex items-center gap-3">
            <button
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation-drawer"
              className="grid size-10 place-items-center bg-brand text-ink transition hover:bg-[#d8df0d] lg:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
              type="button"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <BrandMark />
          </div>

          <div className="hidden items-center gap-9 lg:flex">
            {links.map((link) => (
              <Link
                className="text-sm font-semibold uppercase transition-colors hover:text-muted"
                href={link.href}
                key={link.href}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <button
              aria-label={searchOpen ? "Close search" : "Open search"}
              aria-expanded={searchOpen}
              className="grid size-10 place-items-center transition hover:bg-canvas"
              onClick={() => setSearchOpen(!searchOpen)}
              type="button"
            >
              {searchOpen ? <X size={19} /> : <Search size={19} />}
            </button>
            <Link
              aria-label="Your shopping bag"
              className="relative grid size-10 place-items-center transition hover:bg-canvas"
              href="/checkout"
            >
              <ShoppingBag size={19} />
              <span className="absolute right-1 top-1 grid size-[17px] place-items-center rounded-full bg-brand text-[10px] font-bold">
                {itemCount}
              </span>
            </Link>
            <Link
              aria-label={session ? "Open your account" : "Sign in to your account"}
              className="hidden size-10 place-items-center transition hover:bg-canvas sm:grid"
              href={accountHref}
            >
              <UserRound size={19} />
            </Link>
            <Link
              className="ml-1 border border-ink/5 hidden items-center gap-2 bg-brand px-4 py-3 text-xs font-bold uppercase transition hover:bg-[#d8df0d] sm:flex"
              href="/shop"
            >
              Shop now <ArrowRight size={15} />
            </Link>
          </div>
        </nav>

        {searchOpen && (
          <form
            action="/shop"
            className="border-t border-line bg-paper px-4 py-4 sm:px-7 lg:px-10"
          >
            <label className="mx-auto flex max-w-[900px] items-center gap-3 border-b border-ink py-2">
              <Search aria-hidden="true" size={18} />
              <input
                aria-label="Search jerseys"
                autoFocus
                className="min-w-0 flex-1 bg-transparent py-2 text-base outline-none placeholder:text-muted"
                name="q"
                placeholder="Search teams, seasons, and jerseys"
              />
              <button className="text-xs font-bold uppercase" type="submit">
                Search
              </button>
            </label>
          </form>
        )}
      </header>

      {menuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            aria-label="Close navigation menu"
            className="drawer-backdrop absolute inset-0 bg-black/45"
            onClick={() => setMenuOpen(false)}
            type="button"
          />
          <aside
            aria-label="Mobile navigation"
            aria-modal="true"
            className="drawer-enter absolute inset-y-0 left-0 flex w-[min(88vw,24rem)] flex-col bg-paper px-6 pb-8 pt-5 shadow-2xl"
            id="mobile-navigation-drawer"
            role="dialog"
          >
            <div className="flex items-center justify-between border-b border-line pb-5">
              <BrandMark />
              <button
                aria-label="Close navigation menu"
                autoFocus
                className="grid size-10 place-items-center border border-line"
                onClick={() => setMenuOpen(false)}
                type="button"
              >
                <X size={19} />
              </button>
            </div>
            <nav aria-label="Mobile navigation links" className="mt-4">
              {links.map((link) => (
                <Link
                  className="flex items-center justify-between border-b border-line py-5 font-display text-2xl font-semibold"
                  href={link.href}
                  key={link.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {link.label}
                  <ArrowRight aria-hidden="true" size={20} />
                </Link>
              ))}
            </nav>
            <Link
              className="mt-7 inline-flex w-fit items-center gap-2 bg-brand px-5 py-3 text-sm font-bold uppercase"
              href={accountHref}
              onClick={() => setMenuOpen(false)}
            >
              Account <UserRound size={16} />
            </Link>
          </aside>
        </div>
      )}
    </>
  );
}