import Image from "next/image";
import Link from "next/link";
import { LuArrowDown as ArrowDown, LuArrowRight as ArrowRight, LuArrowUpRight as ArrowUpRight, LuQuote as Quote } from "react-icons/lu";
import { ProductCard } from "@/components/common/ProductCard";
import { featuredProducts } from "@/data/products";

const heroImage =
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=2200&q=90";

export function HomePage() {
  return (
    <main>
      <section className="relative isolate min-h-[670px] overflow-hidden bg-charcoal text-white md:min-h-[760px]">
        <Image
          alt="Football match in a packed stadium"
          className="object-cover object-center"
          fill
          priority
          sizes="100vw"
          src={heroImage}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-black/10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/15" />
        <div className="relative mx-auto flex min-h-[670px] max-w-[1440px] flex-col justify-center px-5 pb-20 pt-16 sm:px-8 md:min-h-[760px] lg:px-14">
          <div className="max-w-[720px] rise-in">
            <p className="mb-6 flex items-center gap-3 text-xs font-bold uppercase text-brand sm:text-sm">
              <span className="h-px w-9 bg-brand" /> The shirt is never just a shirt
            </p>
            <h1 className="font-display text-[2.8rem] font-semibold !leading-[0.98] md:!leading-tight sm:text-6xl md:text-7xl">
              Every legend
              <br />
              has a <span className="inline-block bg-brand px-2 pb-2 text-ink">beginning.</span>
            </h1>
            <p className="mt-7 max-w-md font-copy text-sm leading-7 text-white/85 sm:text-base">
              Wear the colors that carry a story. Find your team, your era, your
              reason to play on.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link className="inline-flex min-h-12 items-center gap-3 bg-brand px-6 text-sm font-bold uppercase text-ink transition hover:bg-[#d8df0d]" href="/shop">
                Shop jerseys <ArrowRight size={17} />
              </Link>
              <Link className="inline-flex min-h-12 items-center gap-2 border border-white/65 px-5 text-sm font-semibold text-white transition hover:border-brand hover:text-brand" href="/about-us">
                Our story <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
          <div className="absolute bottom-7 left-5 flex items-center gap-3 text-[10px] font-semibold uppercase text-white/75 sm:left-8 lg:left-14">
            <ArrowDown aria-hidden="true" size={16} /> Scroll to find your colors
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-5 px-5 py-16 sm:px-8 md:grid-cols-[1fr_auto_1fr] md:items-center md:gap-8 md:py-24 lg:px-14">
        <div className="flex items-start gap-3 text-brand">
          <Quote aria-hidden="true" stroke="black" strokeWidth={0.2} className="mt-1 shrink-0" fill="currentColor" size={22} />
          <span className="font-display text-sm font-bold uppercase text-ink">A little more than<br /> ninety minutes</span>
        </div>
        <p className="max-w-[750px] font-display text-2xl font-medium leading-snug sm:text-3xl md:text-center">
          The shirt you wore when the whole world stopped. The colors that still
          feel like home.
        </p>
        <p className="max-w-xs font-copy text-sm leading-7 text-muted md:justify-self-end">
          We celebrate the game, its people, and every story stitched into the
          fabric. Find a piece of yours in our collection.
        </p>
      </section>

      <section className="bg-canvas py-14 sm:py-20">
        <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
          <div className="mb-8 flex items-end justify-between gap-5 sm:mb-11">
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase text-muted">Picked from the stands</p>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">Fans’ favorites</h2>
            </div>
            <Link className="inline-flex shrink-0 items-center gap-2 border-b border-ink pb-1 text-xs font-bold uppercase" href="/shop">
              View all <ArrowUpRight size={15} />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 md:grid-cols-4 md:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1440px] gap-10 px-5 py-16 sm:px-8 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-20 md:py-24 lg:px-14">
        <div className="relative aspect-[4/3] overflow-hidden bg-canvas">
          <Image
            alt="Football pitch and goal before kickoff"
            className="object-cover"
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            src="https://images.unsplash.com/photo-1522778119026-d647f0596c20?auto=format&fit=crop&w=1200&q=85"
          />
          <span className="absolute bottom-4 left-4 bg-brand px-3 py-2 text-[10px] font-bold uppercase">Since the first whistle</span>
        </div>
        <div className="max-w-xl">
          <p className="mb-3 text-xs font-bold uppercase text-muted">About Play On</p>
          <h2 className="font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Greatness is a journey. Wear every chapter.
          </h2>
          <p className="mt-6 font-copy text-sm leading-7 text-muted">
            Football belongs to all of us. From the first kick in the street to
            the last song in the stands, the game makes memories worth keeping.
            We bring together club colors, national pride, and retro classics
            made for the people who love it most.
          </p>
          <Link className="mt-7 inline-flex items-center gap-3 border-b border-ink pb-2 text-sm font-bold uppercase" href="/about-us">
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
            src="https://images.unsplash.com/photo-1517466787929-bc90951d0974?auto=format&fit=crop&w=1200&q=85"
          />
        </div>
        <div className="flex flex-col justify-center px-6 py-12 sm:px-12 md:px-14 lg:px-20">
          <p className="text-xs font-bold uppercase">For the matchday ritual</p>
          <h2 className="mt-4 max-w-lg font-display text-4xl font-semibold leading-tight sm:text-5xl">
            Made for the miles, the noise, and the ninety.
          </h2>
          <p className="mt-5 max-w-lg font-copy text-sm leading-7 text-ink/75">
            Comfortable, carefully selected jerseys with the details fans notice.
            Your colors deserve to go everywhere you do.
          </p>
          <Link className="mt-7 inline-flex w-fit items-center gap-3 border-b border-ink pb-2 text-sm font-bold uppercase" href="/shop">
            Explore the collection <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      <section className="mx-auto flex max-w-[1440px] flex-col items-start justify-between gap-7 px-5 py-14 sm:px-8 md:flex-row md:items-center md:py-20 lg:px-14">
        <div>
          <p className="mb-2 text-xs font-bold uppercase text-muted">The next match starts here</p>
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">Find the jersey that feels like yours.</h2>
        </div>
        <Link className="inline-flex min-h-12 items-center gap-3 bg-ink px-6 text-sm font-bold uppercase text-white transition hover:bg-charcoal" href="/shop">
          Shop all jerseys <ArrowRight size={17} />
        </Link>
      </section>
    </main>
  );
}