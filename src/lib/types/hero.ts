export type HeroSlideButton = { label: string; href: string; style: "primary" | "secondary" };

export type HeroMedia = { url: string; fileId: string; alt: string; mediaType: "image" | "video" };

export function resolveHeroMediaType(media: { url: string; mediaType?: "image" | "video" | null }): "image" | "video" {
  const pathname = media.url.split(/[?#]/, 1)[0];
  if (/\.(mp4|webm)$/i.test(pathname)) return "video";
  return media.mediaType ?? "image";
}

export type HeroSlide = {
  id: string;
  tagline: string;
  heading: string;
  highlightedWord: string;
  description: string;
  image: HeroMedia;
  buttons: HeroSlideButton[];
  isActive: boolean;
  displayOrder: number;
};
