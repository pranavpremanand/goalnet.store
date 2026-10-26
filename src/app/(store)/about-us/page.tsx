import Image from "next/image";
import Link from "next/link";
import { LuArrowRight as ArrowRight, LuFlag as Flag, LuHeart as Heart, LuShirt as Shirt } from "react-icons/lu";

export const metadata = { title: "About GoalNet" };

export default function AboutPage() {
  return (
    <main>
      <section className="relative isolate min-h-[530px] overflow-hidden bg-charcoal text-white md:min-h-[610px]">
        <Image alt="Players walking onto the football pitch" className="object-cover" fill priority sizes="100vw" src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2200&q=85" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="relative mx-auto flex min-h-[530px] max-w-[1440px] flex-col justify-end px-5 pb-12 sm:px-8 md:min-h-[610px] md:pb-16 lg:px-14">
          <p className="mb-4 text-xs font-bold uppercase text-brand">Our story / Since the first whistle</p>
          <h1 className="font-display text-6xl font-semibold sm:text-7xl">GoalNet<span className="text-brand">.</span></h1>
          <p className="mt-4 max-w-xl font-copy text-sm leading-7 text-white/80 sm:text-base">Jerseys that make you feel like a pro. A home for the colors, people, and stories that make football ours.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:gap-20 md:py-24 lg:px-14">
        <div><p className="text-xs font-bold uppercase text-muted">Why we play</p><h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">A game is made of a million little moments.</h2></div>
        <div className="space-y-5 font-copy text-sm leading-7 text-muted"><p>We are passionate about football and the culture that surrounds it. Every fan deserves to wear their team colors with pride, whether it is a first jersey or one that brings back a favorite season.</p><p>Our collection brings club teams, national sides, retro classics, and special editions together in one place. We look for quality and details fans care about, from the cut of the shirt to the crest on the chest.</p><p>GoalNet is for the walk to the ground, the game on the screen, and the stories you tell long after the final whistle.</p><Link className="inline-flex items-center gap-2 border-b border-ink pb-1 font-sans font-bold uppercase text-ink" href="/shop">Find your jersey <ArrowRight size={16} /></Link></div>
      </section>
      <section className="bg-canvas py-14 sm:py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14"><div className="mb-8"><p className="text-xs font-bold uppercase text-muted">The GoalNet promise</p><h2 className="mt-2 font-display text-3xl font-semibold">Made for the love of it.</h2></div><div className="grid gap-8 md:grid-cols-3"><article className="border-t-2 border-brand pt-5"><Heart size={22} /><h3 className="mt-4 font-display text-xl font-semibold">Fan first</h3><p className="mt-2 font-copy text-sm leading-6 text-muted">A collection shaped around the teams and eras supporters carry with them.</p></article><article className="border-t-2 border-brand pt-5"><Shirt size={22} /><h3 className="mt-4 font-display text-xl font-semibold">Quality you can feel</h3><p className="mt-2 font-copy text-sm leading-6 text-muted">Thoughtfully selected pieces, made to be worn well on and off matchday.</p></article><article className="border-t-2 border-brand pt-5"><Flag size={22} /><h3 className="mt-4 font-display text-xl font-semibold">Every color has a story</h3><p className="mt-2 font-copy text-sm leading-6 text-muted">From national pride to local legends, there is a place for every football story.</p></article></div></div></section>
      <section className="relative min-h-[300px] overflow-hidden bg-charcoal sm:min-h-[420px]"><Image alt="Stadium ready for a match" className="object-cover" fill sizes="100vw" src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2200&q=85" /><div className="absolute inset-0 bg-ink/45" /><div className="relative mx-auto flex min-h-[300px] max-w-[1440px] items-center px-5 sm:min-h-[420px] sm:px-8 lg:px-14"><p className="max-w-2xl font-display text-4xl font-semibold text-white sm:text-6xl">The game is yours.<br /><span className="text-brand">Keep playing.</span></p></div></section>
    </main>
  );
}