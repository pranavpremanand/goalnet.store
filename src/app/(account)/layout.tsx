import type { ReactNode } from "react";
import { HomeNavbar } from "@/components/common/HomeNavbar";
import { LocalCartProvider } from "@/components/common/LocalCartProvider";

export default function AccountLayout({ children }: { children: ReactNode }) {
  return <LocalCartProvider><HomeNavbar />{children}</LocalCartProvider>;
}