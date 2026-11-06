import { BadRequestError, NotFoundError } from "@/server/errors";
import type { HeroSlideInput } from "@/lib/validation/hero";
import type { HeroMedia } from "@/lib/types/hero";
import * as heroSlideRepository from "@/server/repositories/hero-slide.repository";
import { deleteImages, verifyNewHeroMedia } from "@/server/services/image.service";

export async function listHeroSlides() {
  return heroSlideRepository.listHeroSlides();
}

export async function listActiveHeroSlides() {
  return heroSlideRepository.listHeroSlides({ activeOnly: true });
}

export async function reorderHeroSlides(ids: string[]) {
  const slides = await heroSlideRepository.listHeroSlides();
  const expected = new Set(slides.map((slide) => slide.id));
  if (ids.length !== slides.length || new Set(ids).size !== ids.length || ids.some((id) => !expected.has(id))) {
    throw new BadRequestError("The slide list changed. Refresh the page and try again.");
  }
  await heroSlideRepository.reorderHeroSlides(ids);
}

export async function createHeroSlide(input: HeroSlideInput) {
  const media: HeroMedia = { ...input.image, mediaType: input.image.mediaType ?? "image" };
  await verifyNewHeroMedia(media, new Set(), "image");
  return heroSlideRepository.createHeroSlide({ ...input, image: media });
}

export async function updateHeroSlide(id: string, input: HeroSlideInput) {
  const existing = await heroSlideRepository.findHeroSlide(id);
  if (!existing) throw new NotFoundError("Hero slide not found.");

  const media: HeroMedia = { ...input.image, mediaType: input.image.mediaType ?? "image" };
  const knownFileIds = existing.image.fileId === media.fileId && existing.image.mediaType === media.mediaType
    ? new Set([existing.image.fileId])
    : new Set<string>();
  await verifyNewHeroMedia(media, knownFileIds, "image");
  const updated = await heroSlideRepository.updateHeroSlide(id, { ...input, image: media });
  if (!updated) throw new NotFoundError("Hero slide not found.");
  if (existing.image.fileId !== updated.image.fileId) await deleteImages([existing.image.fileId]);
  return updated;
}

export async function deleteHeroSlide(id: string) {
  const existing = await heroSlideRepository.findHeroSlide(id);
  if (!existing) throw new NotFoundError("Hero slide not found.");
  await heroSlideRepository.deleteHeroSlide(id);
  await deleteImages([existing.image.fileId]);
}
