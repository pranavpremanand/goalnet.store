import type { ReactNode } from "react";
import { RequireUser } from "@/components/common/RouteGuards";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return <RequireUser>{children}</RequireUser>;
}
