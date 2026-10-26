"use client";

import { useState } from "react";
import { Check, Mail, MapPin, Phone } from "lucide-react";

export function ContactForm() {
  const [sent, setSent] = useState(false);

  function submitMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
  }

  return (
    <main className="mx-auto grid max-w-[1240px] gap-12 px-5 py-10 sm:px-8 md:grid-cols-[1.1fr_0.9fr] md:gap-20 md:py-16">
      <section>
        <p className="text-xs font-bold uppercase text-muted">We’re here for you</p>
        <h1 className="mt-2 font-display text-4xl font-semibold sm:text-5xl">Let’s talk football.</h1>
        <p className="mt-4 max-w-lg font-copy text-sm leading-7 text-muted">Questions about an order, a jersey, or anything else? Send us a note and our team will be in touch.</p>
        {sent ? (
          <div aria-live="polite" className="mt-8 flex items-start gap-3 border-l-4 border-brand bg-canvas p-5"><Check size={19} /><div><p className="font-semibold">Message received</p><p className="mt-1 text-sm text-muted">Thanks for reaching out. We’ll get back to you soon.</p><button className="mt-3 text-xs font-bold uppercase underline" onClick={() => setSent(false)} type="button">Send another</button></div></div>
        ) : (
          <form className="mt-8 space-y-5" onSubmit={submitMessage}>
            <div className="grid gap-5 sm:grid-cols-2"><label className="block text-xs font-semibold">Name<input className="mt-2 w-full border border-line px-3 py-3 text-sm outline-none focus:border-ink" name="name" placeholder="Your name" required /></label><label className="block text-xs font-semibold">Email<input className="mt-2 w-full border border-line px-3 py-3 text-sm outline-none focus:border-ink" name="email" placeholder="you@example.com" required type="email" /></label></div>
            <label className="block text-xs font-semibold">Mobile number<input className="mt-2 w-full border border-line px-3 py-3 text-sm outline-none focus:border-ink" name="phone" placeholder="Your phone number" type="tel" /></label>
            <label className="block text-xs font-semibold">Message<textarea className="mt-2 min-h-32 w-full resize-y border border-line px-3 py-3 text-sm outline-none focus:border-ink" name="message" placeholder="How can we help?" required /></label>
            <button className="inline-flex min-h-12 items-center bg-brand px-7 text-sm font-bold uppercase transition hover:bg-[#d8df0d]" type="submit">Send message</button>
          </form>
        )}
      </section>
      <aside className="relative flex min-h-[360px] flex-col justify-end overflow-hidden bg-charcoal p-7 text-white sm:p-10">
        <div aria-hidden="true" className="absolute inset-0 opacity-30" style={{ backgroundImage: "linear-gradient(135deg, transparent 48%, rgba(242,250,24,.35) 49%, transparent 50%), linear-gradient(45deg, transparent 48%, rgba(255,255,255,.15) 49%, transparent 50%)", backgroundSize: "44px 44px" }} />
        <div className="relative"><p className="text-xs font-bold uppercase text-brand">GoalNet support</p><h2 className="mt-3 max-w-sm font-display text-3xl font-semibold">Good football starts with good people.</h2><div className="mt-8 space-y-4 text-sm"><a className="flex items-center gap-3 hover:text-brand" href="mailto:goalnet@example.com"><Mail size={17} /> goalnet@example.com</a><a className="flex items-center gap-3 hover:text-brand" href="tel:+16035550123"><Phone size={17} /> (603) 555-0123</a><p className="flex items-center gap-3"><MapPin size={17} /> Ahmedabad, India</p></div></div>
      </aside>
    </main>
  );
}