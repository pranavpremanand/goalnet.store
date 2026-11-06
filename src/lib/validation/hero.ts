import { z } from "zod";

const heroMediaSchema = z.object(
  {
    url: z.url("Media URL is invalid"),
    fileId: z.string().min(1, "Media is missing its file id"),
    alt: z.string().trim().max(200, "Alt text must be 200 characters or fewer"),
    mediaType: z.enum(["image", "video"]).default("image"),
  },
  { error: "Please upload an image or video" },
);

const buttonSchema = z.object({
  label: z.string().trim().min(1, "Enter button text").max(24, "Button text must be 24 characters or fewer"),
  href: z.string().trim().min(1, "Enter a destination").max(300, "Destination is too long").refine((value) => value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\") && !/[\u0000-\u001f]/.test(value), "Use a path on this website, e.g. /shop"),
  style: z.enum(["primary", "secondary"]),
});

export const heroSlideInputSchema = z
  .object({
    tagline: z.string().trim().min(1, "Enter a tagline").max(80, "Tagline must be 80 characters or fewer"),
    heading: z.string().trim().min(1, "Enter a heading").max(120, "Heading must be 120 characters or fewer"),
    highlightedWord: z.string().trim().max(40, "Highlight must be 40 characters or fewer"),
    description: z.string().trim().min(1, "Enter a description").max(240, "Description must be 240 characters or fewer"),
    image: heroMediaSchema,
    buttons: z.array(buttonSchema).max(2, "Use up to two buttons"),
    isActive: z.boolean(),
    displayOrder: z.number({ error: "Enter a display order" }).int("Display order must be a whole number").min(0).max(9999),
  })
  .superRefine((slide, context) => {
    if (slide.highlightedWord && !slide.heading.toLocaleLowerCase().includes(slide.highlightedWord.toLocaleLowerCase())) {
      context.addIssue({ code: "custom", path: ["highlightedWord"], message: "The highlighted text must appear in the heading" });
    }
  });

export const heroSlideIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid slide id");
export const heroUploadTargetSchema = z.object({ target: z.literal("hero") });
export type HeroSlideInput = z.input<typeof heroSlideInputSchema>;
export type HeroSlideOutput = z.output<typeof heroSlideInputSchema>;
