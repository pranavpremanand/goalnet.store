import type { ReactNode } from "react";
import { HomeNavbar } from "@/components/common/HomeNavbar";
import { SiteFooter } from "@/components/common/SiteFooter";

export default function StorefrontLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <HomeNavbar />
      {children}
      <SiteFooter />
    </>
  );
}