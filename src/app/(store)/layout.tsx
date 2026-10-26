import type { ReactNode } from "react";
import { HomeNavbar } from "@/components/common/HomeNavbar";
import { SiteFooter } from "@/components/common/SiteFooter";
import { LocalCartProvider } from "@/components/common/LocalCartProvider";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <LocalCartProvider>
      <HomeNavbar />
      {children}
      <SiteFooter />
    </LocalCartProvider>
  );
}