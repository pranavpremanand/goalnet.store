import Link from "next/link";
import Image from "next/image";

type BrandMarkProps = {
  inverse?: boolean;
  compact?: boolean;
};

export function BrandMark({ inverse = false, compact = false }: BrandMarkProps) {
  return (
    <Link
      aria-label="GoalNet home"
      className={`inline-flex items-center ${inverse ? "bg-white p-1.5" : ""}`}
      href="/"
    >
      <Image
        alt=""
        className={compact ? "h-12 w-auto object-contain" : "h-14 w-auto object-contain"}
        height={887}
        priority
        src="/logo.png"
        unoptimized
        width={1774}
      />
    </Link>
  );
}