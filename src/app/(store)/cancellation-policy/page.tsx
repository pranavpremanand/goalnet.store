import type { Metadata } from "next";
import { LegalPage } from "@/components/pages/legal/LegalPage";
import { cancellationPolicy } from "@/data/legal-content";

export const metadata: Metadata = { title: "Cancellation Policy | GoalNet" };

export default function CancellationPolicyPage() {
  return <LegalPage document={cancellationPolicy} />;
}