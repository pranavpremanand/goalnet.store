import { BadRequestError, NotFoundError } from "@/server/errors";
import type { HeroSlideOutput } from "@/lib/validation/hero";
import type { HeroMedia } from "@/lib/types/hero";
import * as heroSlideRepository from "@/server/repositories/hero-slide.repository";
import { deleteImages, verifyNewHeroMedia } from "@/server/services/image.service";

export async function listHeroSlides() {
  return heroSlideRepository.listHeroSlides();
}

export async function listActiveHeroSlides() {
  return heroSlideRepository.listHeroSlides({ activeOnly: true });
}

async function verifySlideMedia(input: HeroSlideOutput, media: HeroMedia, knownFileIds: Set<string>) {
  const mediaToVerify = new Map<string, { media: HeroMedia; field: string }>();
  mediaToVerify.set(media.fileId, { media, field: "image" });
  if (input.mobileImage) {
    mediaToVerify.set(input.mobileImage.fileId, {
      media: { ...input.mobileImage, mediaType: "image" },
      field: "mobileImage",
    });
  }
  if (input.desktopImage) {
    mediaToVerify.set(input.desktopImage.fileId, {
      media: { ...input.desktopImage, mediaType: "image" },
      field: "desktopImage",
    });
  }
  await Promise.all([...mediaToVerify.values()].map(({ media: item, field }) => (
    verifyNewHeroMedia(item, knownFileIds, field)
  )));
}

export async function reorderHeroSlides(ids: string[]) {
  const slides = await heroSlideRepository.listHeroSlides();
  const expected = new Set(slides.map((slide) => slide.id));
  if (ids.length !== slides.length || new Set(ids).size !== ids.length || ids.some((id) => !expected.has(id))) {
    throw new BadRequestError("The slide list changed. Refresh the page and try again.");
  }
  await heroSlideRepository.reorderHeroSlides(ids);
}

export async function createHeroSlide(input: HeroSlideOutput) {
  const media: HeroMedia = { ...input.image, mediaType: input.image.mediaType ?? "image" };
  await verifySlideMedia(input, media, new Set());
  return heroSlideRepository.createHeroSlide({
    ...input,
    image: media,
    mobileImage: input.mobileImage ? { ...input.mobileImage, mediaType: "image" } : null,
    desktopImage: input.desktopImage ? { ...input.desktopImage, mediaType: "image" } : null,
  });
}

export async function updateHeroSlide(id: string, input: HeroSlideOutput) {
  const existing = await heroSlideRepository.findHeroSlide(id);
  if (!existing) throw new NotFoundError("Hero slide not found.");

  const media: HeroMedia = { ...input.image, mediaType: input.image.mediaType ?? "image" };
  const existingImages = [existing.image, existing.mobileImage, existing.desktopImage].filter((image) => image !== null && image !== undefined);
  const knownFileIds = new Set(existingImages.map((image) => image.fileId));
  await verifySlideMedia(input, media, knownFileIds);
  const updated = await heroSlideRepository.updateHeroSlide(id, {
    ...input,
    image: media,
    mobileImage: input.mobileImage ? { ...input.mobileImage, mediaType: "image" } : null,
    desktopImage: input.desktopImage ? { ...input.desktopImage, mediaType: "image" } : null,
  });
  if (!updated) throw new NotFoundError("Hero slide not found.");
  const keptFileIds = new Set([updated.image, updated.mobileImage, updated.desktopImage].flatMap((image) => image ? [image.fileId] : []));
  const removedFileIds = existingImages.map((image) => image.fileId).filter((fileId) => !keptFileIds.has(fileId));
  const unusedFileIds = await Promise.all(removedFileIds.map(async (fileId) => (
    await heroSlideRepository.isHeroMediaFileUsed(fileId) ? null : fileId
  )));
  await deleteImages(unusedFileIds.filter((fileId): fileId is string => fileId !== null));
  return updated;
}

export async function deleteHeroSlide(id: string) {
  const existing = await heroSlideRepository.findHeroSlide(id);
  if (!existing) throw new NotFoundError("Hero slide not found.");
  await heroSlideRepository.deleteHeroSlide(id);
  const fileIds = [existing.image, existing.mobileImage, existing.desktopImage].flatMap((image) => image ? [image.fileId] : []);
  const unusedFileIds = await Promise.all(fileIds.map(async (fileId) => (
    await heroSlideRepository.isHeroMediaFileUsed(fileId) ? null : fileId
  )));
  await deleteImages(unusedFileIds.filter((fileId): fileId is string => fileId !== null));
}
