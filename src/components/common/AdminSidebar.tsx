"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LuBoxes as Boxes, LuCircleHelp as CircleHelp, LuClipboardList as ClipboardList, LuLayoutDashboard as LayoutDashboard, LuLogOut as LogOut, LuMail as Mail, LuPanelsTopLeft as PanelsTopLeft, LuShoppingBag as ShoppingBag, LuUsers as Users } from "react-icons/lu";
import { signOutUser } from "@/lib/auth-client";

const items = [
  { href: "/admin", label: "Overview", mobileLabel: "Home", icon: LayoutDashboard },
  { href: "/admin/users", label: "Users", mobileLabel: "Users", icon: Users },
  { href: "/admin/products", label: "Products", mobileLabel: "Products", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", mobileLabel: "Categories", icon: ClipboardList },
  { href: "/admin/hero", label: "Homepage hero", mobileLabel: "Hero", icon: PanelsTopLeft },
  { href: "/admin/manage-orders", label: "Orders", mobileLabel: "Orders", icon: Boxes },
  { href: "/admin/tickets", label: "Support tickets", mobileLabel: "Tickets", icon: CircleHelp },
  { href: "/admin/contact-messages", label: "Contact messages", mobileLabel: "Messages", icon: Mail },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  return (
    <aside className="border-r border-line bg-paper lg:min-h-[calc(100svh-64px)]">
      <nav aria-label="Admin sections" className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-paper px-1 pb-[max(5px,env(safe-area-inset-bottom))] pt-1 sm:grid-cols-8 lg:sticky lg:top-16 lg:block lg:border-0 lg:px-4 lg:py-7">
        <p className="mb-4 hidden px-3 text-[10px] font-bold uppercase text-muted lg:block">Workspace</p>
        {items.map(({ href, label, mobileLabel, icon: Icon }) => {
          const active = href === "/admin" ? pathname === href : pathname.startsWith(href);
          return <Link aria-current={active ? "page" : undefined} className={`flex min-w-0 flex-col items-center gap-1 px-1 py-2 text-[9px] font-medium sm:text-[10px] lg:mb-1 lg:flex-row lg:gap-3 lg:px-3 lg:py-3 lg:text-sm ${active ? "bg-brand font-semibold text-ink" : "text-muted hover:bg-canvas hover:text-ink"}`} href={href} key={href}><Icon size={18} /><span className="truncate lg:hidden">{mobileLabel}</span><span className="hidden lg:inline">{label}</span></Link>;
        })}
        <button className="hidden items-center gap-3 px-3 py-3 text-sm text-muted hover:bg-canvas lg:flex" onClick={async () => { await signOutUser(); router.push("/admin/login"); }} type="button"><LogOut size={17} />Sign out</button>
      </nav>
    </aside>
  );
}
