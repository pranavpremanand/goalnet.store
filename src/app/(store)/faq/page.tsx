import type { Metadata } from "next";
import { FaqAccordion } from "@/components/pages/legal/FaqAccordion";
import { LinkedContent } from "@/components/pages/legal/LegalPage";
import { faqGroups } from "@/data/faq-content";

export const metadata: Metadata = { title: "Frequently Asked Questions | GoalNet" };

export default function FAQPage() {
  return (
    <main>
      <header className="border-b border-line bg-canvas">
        <div className="mx-auto max-w-[1080px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
          <p className="text-xs font-bold uppercase text-muted">GoalNet / Help</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">Frequently Asked Questions</h1>
          <div className="mt-4 max-w-3xl space-y-3 font-copy text-sm leading-7 text-muted sm:text-base">
            <p>Welcome to the GOALNET FAQ section.</p>
            <p>Here you&apos;ll find answers to common questions about our football jerseys, sizing, payments, shipping, orders and returns.</p>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-[1080px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <FaqAccordion groups={faqGroups} />
        <section className="mt-12 border-t border-line pt-7" aria-labelledby="faq-contact-heading">
          <h2 className="font-display text-2xl font-semibold" id="faq-contact-heading">Still have questions?</h2>
          <p className="mt-2 font-copy text-sm leading-7 text-muted">We&apos;re here to help. Contact us with your question and, if applicable, your order number. We&apos;ll do our best to guide you through the next steps.</p>
          <p className="mt-3 text-sm font-semibold"><LinkedContent text="Email: contactgoalnet@gmail.com" /></p>
        </section>
      </div>
    </main>
  );
}