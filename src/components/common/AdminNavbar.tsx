import Link from "next/link";
import { Bell, ExternalLink } from "lucide-react";
import { BrandMark } from "@/ui/BrandMark";

export function AdminNavbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper">
      <nav aria-label="Admin header" className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-7 lg:px-9">
        <BrandMark />
        <div className="flex items-center gap-3 sm:gap-5"><span className="hidden text-xs font-bold uppercase text-muted sm:block">Store administration</span><button aria-label="Notifications" className="grid size-9 place-items-center border border-line"><Bell size={16} /></button><Link className="inline-flex items-center gap-1.5 text-xs font-bold uppercase hover:text-muted" href="/" target="_blank">View store <ExternalLink size={14} /></Link><span className="grid size-9 place-items-center bg-ink text-xs font-bold text-white">PO</span></div>
      </nav>
    </header>
  );
}