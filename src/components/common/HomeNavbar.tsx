"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Menu,
  Search,
  ShoppingBag,
  UserRound,
  X,
} from "lucide-react";
import { BrandMark } from "@/ui/BrandMark";
import { useLocalCart } from "@/components/common/LocalCartProvider";

const links = [
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about-us" },
  { label: "Contact", href: "/contact-us" },
];

export function HomeNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const { itemCount } = useLocalCart();

  return (
    <>
      <div className="flex min-h-9 items-center justify-center bg-ink px-4 text-center text-[11px] font-semibold uppercase text-white sm:text-xs">
        Free shipping on every jersey. No minimum.
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
              aria-label="Sign in to your account"
              className="hidden size-10 place-items-center transition hover:bg-canvas sm:grid"
              href="/login"
            >
              <UserRound size={19} />
            </Link>
            <Link
              className="ml-1 hidden items-center gap-2 bg-brand px-4 py-3 text-xs font-bold uppercase transition hover:bg-[#d8df0d] sm:flex"
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
        <div className="fixed inset-0 top-[108px] z-30 bg-paper px-6 pb-10 pt-4 lg:hidden">
          <div className="mx-auto flex max-w-lg flex-col">
            {links.map((link, index) => (
              <Link
                className="flex items-center justify-between border-b border-line py-5 font-display text-3xl font-semibold"
                href={link.href}
                key={link.href}
                onClick={() => setMenuOpen(false)}
              >
                <span>0{index + 1} / {link.label}</span>
                <ArrowRight aria-hidden="true" size={22} />
              </Link>
            ))}
            <Link
              className="mt-7 inline-flex w-fit items-center gap-2 bg-brand px-5 py-3 text-sm font-bold uppercase"
              href="/login"
              onClick={() => setMenuOpen(false)}
            >
              Account <UserRound size={16} />
            </Link>
          </div>
        </div>
      )}
    </>
  );
}