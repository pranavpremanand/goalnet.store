import type { ReactNode } from "react";
import { HomeNavbar } from "@/components/common/HomeNavbar";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <><HomeNavbar />{children}</>;
}