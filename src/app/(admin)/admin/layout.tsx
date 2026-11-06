import type { ReactNode } from "react";
import { AdminNavbar } from "@/components/common/AdminNavbar";
import { AdminSidebar } from "@/components/common/AdminSidebar";
import { RequireAdmin } from "@/components/common/RouteGuards";

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <RequireAdmin><AdminNavbar /><div className="mx-auto grid w-full max-w-[100vw] grid-cols-[minmax(0,1fr)] lg:max-w-[1600px] lg:grid-cols-[230px_minmax(0,1fr)]"><AdminSidebar /><main className="min-w-0 max-w-full px-4 pb-28 pt-7 sm:px-7 sm:pb-24 lg:px-9 lg:pb-12 lg:pt-9">{children}</main></div></RequireAdmin>;
}
