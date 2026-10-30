import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { LuArrowUpRight } from "react-icons/lu";
import { listActiveCategories } from "@/server/services/category.service";

async function CategoryCards() {
  let categories: Awaited<ReturnType<typeof listActiveCategories>> = [];
  try {
    categories = await listActiveCategories();
  } catch (error) {
    // The homepage should still render if the database is briefly unreachable.
    console.error("Could not load homepage categories", error);
  }
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="home-categories-title" className="bg-paper py-14 sm:py-18">
      <div className="mx-auto max-w-[1440px] px-5 sm:px-8 lg:px-14">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-4 sm:mb-9">
          <div>
            <p className="mb-2 text-[11px] font-bold uppercase text-muted">Find your kind of kit</p>
            <h2 className="font-display text-3xl font-semibold sm:text-4xl" id="home-categories-title">Shop by style</h2>
          </div>
          <Link className="inline-flex items-center gap-2 border-b border-ink pb-1 text-xs font-bold uppercase" href="/shop">
            Browse all jerseys <LuArrowUpRight aria-hidden="true" size={15} />
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
          {categories.map((category) => (
            <Link className="group relative aspect-4/5 overflow-hidden bg-charcoal text-white" href="/shop" key={category.id}>
              <Image
                alt={category.coverImage.alt || category.name}
                className="object-cover transition duration-500 group-hover:scale-105"
                fill
                sizes="(max-width: 640px) 48vw, (max-width: 1024px) 31vw, 19vw"
                src={category.coverImage.url}
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/5" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3 sm:p-4">
                <div className="min-w-0">
                  {category.tagline && <p className="line-clamp-1 text-[9px] font-bold uppercase text-brand sm:text-[10px]">{category.tagline}</p>}
                  <h3 className="mt-1 font-display text-lg font-semibold leading-tight sm:text-xl">{category.name}</h3>
                </div>
                <span aria-hidden="true" className="mb-0.5 grid size-8 shrink-0 place-items-center bg-brand text-ink transition-transform group-hover:translate-x-1">
                  <LuArrowUpRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function HomeCategories() {
  return (
    <Suspense fallback={null}>
      <CategoryCards />
    </Suspense>
  );
}
