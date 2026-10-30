export const TEAM_TYPES = ["club", "national"] as const;
export const JERSEY_TYPES = ["half-sleeve", "oversized-five-sleeve", "five-sleeve-collar", "full-sleeve-collar", "full-sleeve-round-neck"] as const;
export const LOGO_TYPES = ["sublimation", "embroidered", "unknown"] as const;
export const SIZES = ["S", "M", "L", "XL", "XXL"] as const;
export const AVAILABILITY_STATUSES = ["available", "unavailable", "supplier-confirmation-required"] as const;

export type TeamType = (typeof TEAM_TYPES)[number];
export type JerseyType = (typeof JERSEY_TYPES)[number];
export type LogoType = (typeof LOGO_TYPES)[number];
export type Size = (typeof SIZES)[number];
export type AvailabilityStatus = (typeof AVAILABILITY_STATUSES)[number];

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
