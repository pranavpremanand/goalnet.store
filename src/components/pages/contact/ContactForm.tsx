import { FaWhatsapp as WhatsApp } from "react-icons/fa6";
import {
  LuMail as Mail,
  LuMapPin as MapPin,
} from "react-icons/lu";
import { ScrollReveal } from "@/components/common/ScrollReveal";

export function ContactForm() {
  return (
    <main className="mx-auto grid max-w-[1240px] gap-10 px-5 py-10 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:gap-16 md:py-16">
      <section className="flex flex-col justify-center">
        <p className="text-xs font-bold uppercase text-muted">
          GOALNET / For the love of the game
        </p>
        <h1 className="mt-3 max-w-xl font-display text-4xl font-semibold leading-tight sm:text-5xl">
         We’re here for you
        </h1>
        <p className="mt-4 max-w-lg font-copy text-sm leading-7 text-muted">
          Need help with an order or have a question about our collection? Get
          in touch directly using one of the contact options.
        </p>
        <div aria-hidden="true" className="mt-8 h-1 w-16 bg-brand" />
        <div className="mt-8 border-l-2 border-line pl-5">
          <p className="font-display text-xl font-semibold">
            Wear your side. Own your story.
          </p>
          <p className="mt-2 max-w-md font-copy text-sm leading-6 text-muted">
            GoalNet brings together the kits, teams, and memories that keep
            football close—on matchday and every day.
          </p>
        </div>
      </section>

      <ScrollReveal>
        <aside className="relative flex min-h-[360px] h-full flex-col justify-end overflow-hidden bg-charcoal p-7 text-white sm:p-10">
          <div
            aria-hidden="true"
            className="absolute inset-0 opacity-30"
            style={{
              backgroundImage:
                "linear-gradient(135deg, transparent 48%, rgba(242,250,24,.35) 49%, transparent 50%), linear-gradient(45deg, transparent 48%, rgba(255,255,255,.15) 49%, transparent 50%)",
              backgroundSize: "44px 44px",
            }}
          />
          <div className="relative">
            <p className="text-xs font-bold uppercase text-brand">
              GoalNet support
            </p>
            <h2 className="mt-3 max-w-sm font-display text-3xl font-semibold">
              Good football starts with good people.
            </h2>
            <div className="mt-8 space-y-5 text-sm">
              <a
                className="flex items-center gap-3 break-all hover:text-brand"
                href="mailto:contactgoalnet@gmail.com"
              >
                <Mail aria-hidden="true" className="shrink-0" size={18} />
                contactgoalnet@gmail.com
              </a>
              <a
                className="flex items-center gap-3 hover:text-brand"
                href="https://wa.me/919778011255"
                rel="noreferrer"
                target="_blank"
              >
                <WhatsApp aria-hidden="true" className="shrink-0" size={18} />
                WhatsApp · +91 97780 11255
              </a>
              <p className="flex items-center gap-3 text-white/75">
                <MapPin aria-hidden="true" className="shrink-0" size={18} />
                Kerala, India
              </p>
            </div>
          </div>
        </aside>
      </ScrollReveal>
    </main>
  );
}
