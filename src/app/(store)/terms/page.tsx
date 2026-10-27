import type { Metadata } from "next";
import { LegalPage } from "@/components/pages/legal/LegalPage";
import { termsConditions } from "@/data/legal-content";

export const metadata: Metadata = { title: "Terms & Conditions | GoalNet" };

export default function TermsPage() {
  return <LegalPage document={termsConditions} />;
}