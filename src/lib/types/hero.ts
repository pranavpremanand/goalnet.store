export type HeroSlideButton = { label: string; href: string; style: "primary" | "secondary" };

export type HeroSlide = {
  id: string;
  tagline: string;
  heading: string;
  highlightedWord: string;
  description: string;
  image: { url: string; fileId?: string; alt: string };
  buttons: HeroSlideButton[];
  isActive: boolean;
  displayOrder: number;
};
