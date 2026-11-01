import Image from "next/image";
import Link from "next/link";
import {
  LuArrowRight as ArrowRight,
  LuQuote as Quote,
} from "react-icons/lu";
import { HomeHero } from "@/components/pages/home/HomeHero";
import { HomeCategories } from "@/components/pages/home/HomeCategories";
import { HomeFeatured } from "@/components/pages/home/HomeFeatured";

export function HomePage() {
  return (
    <main>
      <HomeHero />
      <section className="bg-canvas py-14">
        <div className="mx-auto grid max-w-[1440px] gap-5 px-5 sm:px-8 md:grid-cols-[1fr_auto] md:items-center md:gap-8 lg:px-14">
          {/* <div className="flex items-start gap-3 text-brand">
            <Quote
              aria-hidden="true"
              stroke="black"
              strokeWidth={0.1}
              className="mt-1 shrink-0"
              fill="currentColor"
              size={22}
            />
            <span className="font-display text-sm font-bold uppercase text-ink">
              Where football lives
              <br /> beyond 90 minutes
            </span>
          </div> */}
          <div className="flex items-start gap-2">
            <p className="max-w-[720px] font-display text-2xl font-medium leading-snug sm:text-3xl">
              The shirt you wore when the whole world stopped. The colors that
              still feel like home.
            </p>
            <Quote
              aria-hidden="true"
              stroke="black"
              strokeWidth={0.1}
              className="mt-1 shrink-0 text-brand"
              fill="currentColor"
              size={25}
            />
          </div>
          <p className="max-w-xs font-copy text-sm leading-7 text-muted md:justify-self-end">
            We celebrate the game, its people, and every story stitched into the
            fabric. Find a piece of yours in our collection.
          </p>
        </div>
      </section>

      <HomeCategories />

      <HomeFeatured />

      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-20 md:py-24 lg:px-14">
        <div className="relative aspect-[4/3] overflow-hidden bg-canvas">
          <Image
            alt="Messi taking freeking vs Jordan - WC26"
            className="object-cover object-bottom"
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            src="/images/home-about.jpg"
          />
          <span className="absolute bottom-4 left-4 bg-brand px-3 py-2 text-[10px] font-bold uppercase">
            Since the first whistle
          </span>
        </div>
        <div className="max-w-xl">
          <p className="mb-3 text-xs font-bold uppercase text-muted">
            About GOALNET
          </p>
          <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Where Football Lives Beyond 90 Minutes.
          </h2>
          <p className="mt-6 font-copy text-sm leading-7 text-muted">
            Football is more than a game. It&apos;s about the clubs we support,
            the players who inspire us, the countries we stand behind, and the
            kit that becomes part of our memories.
          </p>
          {/* <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Greatness is a journey. Wear every chapter.
          </h2>
          <p className="mt-6 font-copy text-sm leading-7 text-muted">
            Football belongs to all of us. From the first kick in the street to
            the last song in the stands, the game makes memories worth keeping.
            We bring together club colors, national pride, and retro classics
            made for the people who love it most.
          </p> */}
          <Link
            className="mt-7 inline-flex items-center gap-3 border-b border-ink pb-2 text-sm font-bold uppercase"
            href="/about-us"
          >
            More about us <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="grid bg-brand md:grid-cols-2">
        <div className="relative min-h-[300px] overflow-hidden bg-[#d8df0d] md:min-h-[490px]">
          <Image
            alt="A footballer preparing to take the pitch"
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=100"
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 md:px-14 lg:px-20">
          <p className="text-xs font-bold uppercase">For the matchday ritual</p>
          <h2 className="mt-4 max-w-lg font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Made for the miles, the noise, and the ninety.
          </h2>
          <p className="mt-5 max-w-lg font-copy text-sm leading-7 text-ink/75">
            Comfortable, carefully selected products with the details fans
            notice. Your colors deserve to go everywhere you do.
          </p>
          <Link
            className="mt-7 inline-flex w-fit items-center gap-3 border-b border-ink pb-2 text-sm font-bold uppercase"
            href="/shop"
          >
            Explore the collection <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-7 px-5 py-14 sm:px-8 md:flex-row md:items-center md:py-20 lg:px-14">
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-muted">
            The next match starts here
          </p>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            Find the piece that feels like yours.
          </h2>
        </div>
        <Link
          className="inline-flex min-h-12 items-center gap-3 bg-ink px-6 text-sm font-bold uppercase text-white transition hover:bg-charcoal"
          href="/shop"
        >
          Shop all products <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}
