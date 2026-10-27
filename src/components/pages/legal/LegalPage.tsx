import Link from "next/link";
import type { ReactNode } from "react";

export type ContentBlock =
  | { type: "paragraph"; text: string }
  | { type: "subheading"; text: string }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] };

export type LegalSection = {
  heading: string;
  blocks: ContentBlock[];
};

export type RelatedPage = {
  label: string;
  href: string;
};

export type LegalDocument = {
  title: string;
  intro: string[];
  sections: LegalSection[];
  related: RelatedPage[];
};

const supportEmail = "contactgoalnet@gmail.com";

export function LinkedContent({ text }: { text: string }) {
  const pieces = text.split(supportEmail);
  return pieces.map((piece, index) => (
    <span key={`${piece}-${index}`}>
      {piece}
      {index < pieces.length - 1 && (
        <a className="font-semibold text-ink underline underline-offset-4" href={`mailto:${supportEmail}`}>
          {supportEmail}
        </a>
      )}
    </span>
  ));
}

export function ContentBlocks({ blocks }: { blocks: ContentBlock[] }) {
  return blocks.map((block, index) => {
    if (block.type === "subheading") {
      return <h3 className="pt-2 font-display text-lg font-semibold text-ink" key={`${block.text}-${index}`}>{block.text}</h3>;
    }
    if (block.type === "unordered-list" || block.type === "ordered-list") {
      const List = block.type === "unordered-list" ? "ul" : "ol";
      return (
        <List className={`${block.type === "unordered-list" ? "list-disc" : "list-decimal"} space-y-2 pl-6`} key={`list-${index}`}>
          {block.items.map((item) => <li key={item}><LinkedContent text={item} /></li>)}
        </List>
      );
    }
    return <p key={`paragraph-${index}`}><LinkedContent text={block.text} /></p>;
  });
}

export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <main>
      <header className="border-b border-line bg-canvas">
        <div className="mx-auto max-w-[1080px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12 lg:py-16">
          <p className="text-xs font-bold uppercase text-muted">GoalNet / Information</p>
          <h1 className="mt-3 max-w-4xl font-display text-4xl font-semibold leading-tight sm:text-5xl">{document.title}</h1>
          <p className="mt-4 text-xs text-muted">Last updated: 27 October 2026</p>
          <div className="mt-6 max-w-3xl space-y-3 font-copy text-sm leading-7 text-muted sm:text-base">
            {document.intro.map((paragraph) => <p key={paragraph}><LinkedContent text={paragraph} /></p>)}
          </div>
        </div>
      </header>

      <article className="mx-auto max-w-[1080px] px-5 py-10 sm:px-8 sm:py-14 lg:px-12">
        <div className="divide-y divide-line">
          {document.sections.map((section) => (
            <section className="space-y-4 py-7 first:pt-0 last:pb-0" key={section.heading}>
              <h2 className="font-display text-2xl font-semibold text-ink sm:text-[1.7rem]">{section.heading}</h2>
              <div className="space-y-4 font-copy text-sm leading-7 text-body sm:text-[0.95rem]">
                <ContentBlocks blocks={section.blocks} />
              </div>
            </section>
          ))}
        </div>

        {document.related.length > 0 && (
          <nav aria-label="Related policies" className="mt-12 border-t border-line pt-6">
            <h2 className="text-xs font-bold uppercase text-muted">Related information</h2>
            <ul className="mt-3 flex flex-wrap gap-x-6 gap-y-3 text-sm">
              {document.related.map((page) => <li key={page.href}><Link className="font-semibold underline decoration-brand decoration-2 underline-offset-4" href={page.href}>{page.label}</Link></li>)}
            </ul>
          </nav>
        )}

        <section className="mt-12 border-t border-line pt-7" aria-labelledby="policy-contact-heading">
          <h2 className="font-display text-2xl font-semibold" id="policy-contact-heading">Contact GoalNet</h2>
          <p className="mt-2 font-copy text-sm leading-7 text-muted">For questions about this page, email <a className="font-semibold text-ink underline underline-offset-4" href={`mailto:${supportEmail}`}>{supportEmail}</a>.</p>
        </section>
      </article>
    </main>
  );
}

export function LinkCard({ href, children }: { href: string; children: ReactNode }) {
  return <Link className="font-semibold text-ink underline decoration-brand decoration-2 underline-offset-4" href={href}>{children}</Link>;
}