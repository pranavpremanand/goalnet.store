export const PRODUCT_TYPES = ["jersey", "kit", "boots", "accessory", "other"] as const;
export const TEAM_TYPES = ["club", "national"] as const;
export const JERSEY_TYPES = ["half-sleeve", "oversized-five-sleeve", "five-sleeve-collar", "full-sleeve-collar", "full-sleeve-round-neck"] as const;
export const LOGO_TYPES = ["sublimation", "embroidered", "unknown"] as const;
export const SIZE_SYSTEMS = ["apparel", "uk", "eu", "one-size"] as const;
export const AVAILABILITY_STATUSES = ["available", "unavailable", "supplier-confirmation-required"] as const;

export type ProductType = (typeof PRODUCT_TYPES)[number];
export type TeamType = (typeof TEAM_TYPES)[number];
export type JerseyType = (typeof JERSEY_TYPES)[number];
export type LogoType = (typeof LOGO_TYPES)[number];
export type SizeSystem = (typeof SIZE_SYSTEMS)[number];
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

export const PRODUCT_TYPE_LABELS: Record<ProductType, string> = { jersey: "Jersey", kit: "Full kit", boots: "Boots", accessory: "Accessory", other: "Other" };

// Jerseys and kits belong to a team and season; other products are not tied to one.
export const TEAM_BASED_TYPES: readonly ProductType[] = ["jersey", "kit"];
export const isTeamBased = (type: ProductType) => TEAM_BASED_TYPES.includes(type);

export const SIZE_SYSTEM_LABELS: Record<SizeSystem, string> = { apparel: "Clothing sizes (S to XXL)", uk: "UK shoe sizes", eu: "EU shoe sizes", "one-size": "One size" };

const range = (from: number, to: number, step = 1) => Array.from({ length: Math.round((to - from) / step) + 1 }, (_, index) => String(from + index * step));
export const SIZE_OPTIONS: Record<SizeSystem, readonly string[]> = {
  apparel: ["S", "M", "L", "XL", "XXL"],
  uk: range(3, 13, 0.5),
  eu: range(35, 48),
  "one-size": ["One size"],
};

export const DEFAULT_SIZE_SYSTEM: Record<ProductType, SizeSystem> = { jersey: "apparel", kit: "apparel", boots: "uk", accessory: "one-size", other: "one-size" };

export const TEAM_TYPE_LABELS: Record<TeamType, string> = { club: "Club", national: "National team" };
export const JERSEY_TYPE_LABELS: Record<JerseyType, string> = {
  "half-sleeve": "Half sleeve",
  "oversized-five-sleeve": "Oversized five sleeve",
  "five-sleeve-collar": "Five sleeve with collar",
  "full-sleeve-collar": "Full sleeve with collar",
  "full-sleeve-round-neck": "Full sleeve round neck",
};
export const LOGO_TYPE_LABELS: Record<LogoType, string> = { sublimation: "Sublimation", embroidered: "Embroidered", unknown: "Not specified" };
export const AVAILABILITY_LABELS: Record<AvailabilityStatus, string> = {
  available: "Available",
  unavailable: "Unavailable",
  "supplier-confirmation-required": "Supplier confirmation required",
};

export const IMAGE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const MAX_PRODUCT_IMAGES = 6;
