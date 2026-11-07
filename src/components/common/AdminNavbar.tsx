"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LuExternalLink as ExternalLink, LuLogOut as LogOut } from "react-icons/lu";
import { signOutUser } from "@/lib/auth-client";
import { BrandMark } from "@/ui/BrandMark";

export function AdminNavbar() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <nav
        aria-label="Admin header"
        className="mx-auto flex h-16 w-full max-w-[100vw] items-center justify-between px-4 sm:px-7 lg:max-w-[1600px] lg:px-9"
      >
        <BrandMark />
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="hidden text-xs font-bold uppercase text-muted sm:block">
            Store administration
          </span>
          <Link
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase hover:text-muted"
            href="/"
            target="_blank"
          >
            View store <ExternalLink size={14} />
          </Link>
          <button
            className="inline-flex min-h-10 items-center gap-1.5 border border-line px-2 text-[10px] font-bold uppercase hover:bg-canvas lg:hidden"
            onClick={async () => {
              await signOutUser();
              router.push("/admin/login");
            }}
            type="button"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>
      </nav>
    </header>
  );
}
