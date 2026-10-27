"use client";

import { useState } from "react";
import { LuChevronDown } from "react-icons/lu";
import { ContentBlocks, type ContentBlock } from "@/components/pages/legal/LegalPage";

export type FAQItem = {
  question: string;
  blocks: ContentBlock[];
};

export type FAQGroup = {
  title: string;
  questions: FAQItem[];
};

export function FaqAccordion({ groups }: { groups: FAQGroup[] }) {
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <div className="mt-9 space-y-10">
      {groups.map((group, groupIndex) => (
        <section aria-labelledby={`faq-group-${groupIndex}`} key={group.title}>
          <h2 className="mb-3 font-display text-2xl font-semibold" id={`faq-group-${groupIndex}`}>{group.title}</h2>
          <div className="divide-y divide-line border-y border-line">
            {group.questions.map((item, questionIndex) => {
              const id = `faq-${groupIndex}-${questionIndex}`;
              const isOpen = openQuestion === id;
              return (
                <article key={item.question}>
                  <h3>
                    <button
                      aria-controls={`${id}-answer`}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-5 py-4 text-left font-semibold text-ink"
                      id={`${id}-question`}
                      onClick={() => setOpenQuestion(isOpen ? null : id)}
                      type="button"
                    >
                      <span>{item.question}</span>
                      <LuChevronDown aria-hidden="true" className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} size={18} />
                    </button>
                  </h3>
                  <div aria-hidden={!isOpen} aria-labelledby={`${id}-question`} className={`grid transition-[grid-template-rows] duration-200 ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`} id={`${id}-answer`} inert={!isOpen} role="region">
                    <div className="overflow-hidden">
                      <div className="space-y-3 pb-5 pr-8 font-copy text-sm leading-7 text-muted">
                        <ContentBlocks blocks={item.blocks} />
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}