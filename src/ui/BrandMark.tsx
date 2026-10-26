import Link from "next/link";

type BrandMarkProps = {
  inverse?: boolean;
  compact?: boolean;
};

export function BrandMark({ inverse = false, compact = false }: BrandMarkProps) {
  return (
    <Link
      aria-label="Play On home"
      className={`inline-flex items-center gap-2.5 ${inverse ? "text-white" : "text-ink"}`}
      href="/"
    >
      <span
        aria-hidden="true"
        className="grid size-9 -skew-x-12 place-items-center bg-brand text-ink"
      >
        <span className="skew-x-12 text-[11px] font-black">P</span>
      </span>
      {!compact && (
        <span className="font-display text-[1.45rem] font-black leading-none">
          PLAY <span className="font-medium">ON</span>
        </span>
      )}
    </Link>
  );
}