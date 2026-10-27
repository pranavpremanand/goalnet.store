import type { Metadata } from "next";
import { LegalPage } from "@/components/pages/legal/LegalPage";
import { privacyPolicy } from "@/data/legal-content";

export const metadata: Metadata = { title: "Privacy Policy | GoalNet" };

export default function PrivacyPolicyPage() {
  return <LegalPage document={privacyPolicy} />;
}