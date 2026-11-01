import { NotFoundError } from "@/server/errors";
import type { HeroSlideInput } from "@/lib/validation/hero";
import * as heroSlideRepository from "@/server/repositories/hero-slide.repository";
import { deleteImages, verifyNewImages } from "@/server/services/image.service";

export async function listHeroSlides() {
  return heroSlideRepository.listHeroSlides();
}

export async function listActiveHeroSlides() {
  return heroSlideRepository.listHeroSlides({ activeOnly: true });
}

export async function createHeroSlide(input: HeroSlideInput) {
  await verifyNewImages([input.image], "hero", new Set(), "image");
  return heroSlideRepository.createHeroSlide(input);
}

export async function updateHeroSlide(id: string, input: HeroSlideInput) {
  const existing = await heroSlideRepository.findHeroSlide(id);
  if (!existing) throw new NotFoundError("Hero slide not found.");

  await verifyNewImages([input.image], "hero", new Set([existing.image.fileId]), "image");
  const updated = await heroSlideRepository.updateHeroSlide(id, input);
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
