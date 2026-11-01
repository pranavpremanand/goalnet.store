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
          <p className="mb-4 text-xs font-bold uppercase text-brand">GOALNET / Our story</p>
          <h1 className="font-display text-5xl font-semibold leading-tight sm:text-6xl">Where Football Lives Beyond 90 Minutes</h1>
          <p className="mt-4 max-w-2xl font-copy text-sm leading-7 text-white/80 sm:text-base">Football is more than a game. It&apos;s about the clubs we support, the players who inspire us, the countries we stand behind, and the kit that becomes part of our memories.</p>
        </div>
      </section>
      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:gap-20 md:py-24 lg:px-14">
        <div><p className="text-xs font-bold uppercase text-muted">Our story</p><h2 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl">Wear the game your way.</h2></div>
        <div className="space-y-5 font-copy text-sm leading-7 text-muted"><p>At GOALNET, we bring football fans closer to the game they love through a collection of football products, from club and country jerseys to retro-inspired designs.</p><p>Whether you&apos;re representing your favourite team, celebrating an iconic player or adding a classic kit to your collection, we&apos;re here to help you find something that matches your passion and style.</p><p>We believe football-inspired style should feel special without being out of reach. That&apos;s why GOALNET focuses on bringing fans a selection of products with an appealing balance of style, comfort and value.</p><p>From everyday football fans to dedicated kit collectors, GOALNET is for everyone who carries their love for the game beyond the final whistle.</p><p className="font-semibold text-ink">GOALNET — Where Football Lives Beyond 90 Minutes.</p><p>For questions about products or orders, contact us at <a className="font-semibold text-ink underline underline-offset-4" href="mailto:contactgoalnet@gmail.com">contactgoalnet@gmail.com</a>.</p><Link className="inline-flex items-center gap-2 border-b border-ink pb-1 font-sans font-bold uppercase text-ink" href="/shop">Shop now <ArrowRight size={16} /></Link></div>
      </section>
      <section className="bg-canvas py-14 sm:py-20"><div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14"><div className="mb-8"><p className="text-xs font-bold uppercase text-muted">The GOALNET collection</p><h2 className="mt-2 font-display text-3xl font-semibold">Club, country and retro-inspired designs.</h2></div><div className="grid gap-8 md:grid-cols-3"><article className="border-t-2 border-brand pt-5"><Heart size={22} /><h3 className="mt-4 font-display text-xl font-semibold">For the fans</h3><p className="mt-2 font-copy text-sm leading-6 text-muted">Represent your favourite team and carry its colours with you.</p></article><article className="border-t-2 border-brand pt-5"><Shirt size={22} /><h3 className="mt-4 font-display text-xl font-semibold">Find your style</h3><p className="mt-2 font-copy text-sm leading-6 text-muted">Explore products across club, country and retro-inspired designs.</p></article><article className="border-t-2 border-brand pt-5"><Flag size={22} /><h3 className="mt-4 font-display text-xl font-semibold">Keep the memories</h3><p className="mt-2 font-copy text-sm leading-6 text-muted">Celebrate the players, teams and moments that stay with you.</p></article></div></div></section>
      <section className="relative min-h-[300px] overflow-hidden bg-charcoal sm:min-h-[420px]"><Image alt="Stadium ready for a match" className="object-cover" fill sizes="100vw" src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=2200&q=85" /><div className="absolute inset-0 bg-ink/45" /><div className="relative mx-auto flex min-h-[300px] max-w-[1440px] items-center px-5 sm:min-h-[420px] sm:px-8 lg:px-14"><p className="max-w-2xl font-display text-4xl font-semibold text-white sm:text-6xl">The game is yours.<br /><span className="text-brand">Keep playing.</span></p></div></section>
    </main>
  );
}