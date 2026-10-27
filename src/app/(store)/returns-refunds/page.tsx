import type { Metadata } from "next";
import { LegalPage } from "@/components/pages/legal/LegalPage";
import { returnsPolicy } from "@/data/legal-content";

export const metadata: Metadata = { title: "Returns & Refunds Policy | GoalNet" };

export default function ReturnsPolicyPage() {
  return <LegalPage document={returnsPolicy} />;
}