import type { Metadata } from "next";
import { LegalPage } from "@/components/pages/legal/LegalPage";
import { shippingPolicy } from "@/data/legal-content";

export const metadata: Metadata = { title: "Shipping & Delivery Policy | GoalNet" };

export default function ShippingPolicyPage() {
  return <LegalPage document={shippingPolicy} />;
}