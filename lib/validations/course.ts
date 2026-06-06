import { z } from "zod";

export const courseSchema = z.object({
  title: z.string().min(3, "العنوان قصير جداً").max(120),
  description: z.string().min(10, "الوصف قصير جداً"),
  categoryId: z.string().min(1, "اختر الفئة"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  price: z.coerce.number().min(0, "السعر غير صالح"),
  currency: z.string().default("SAR"),
  thumbnail: z.string().url("رابط صورة غير صالح").optional().or(z.literal("")),
  previewVideo: z.string().url().optional().or(z.literal("")),
  language: z.string().default("ar"),
});

export const sectionSchema = z.object({
  title: z.string().min(2, "عنوان القسم قصير جداً"),
  order: z.coerce.number().int().min(0).optional(),
});

export const lessonSchema = z.object({
  title: z.string().min(2, "عنوان الدرس قصير جداً"),
  description: z.string().optional().or(z.literal("")),
  videoUrl: z.string().url("رابط فيديو غير صالح").optional().or(z.literal("")),
  duration: z.coerce.number().int().min(0).optional(),
  isFree: z.boolean().optional(),
  order: z.coerce.number().int().min(0).optional(),
});

export const enrollSchema = z.object({
  courseId: z.string().min(1),
  receiptImage: z.string().optional().or(z.literal("")),
  studentNote: z.string().max(500).optional().or(z.literal("")),
});

export const activateEnrollmentSchema = z.object({
  paidAmount: z.coerce.number().min(0).optional(),
  paymentMethod: z.string().optional().or(z.literal("")),
  notes: z.string().max(500).optional().or(z.literal("")),
});

export type CourseInput = z.infer<typeof courseSchema>;
export type SectionInput = z.infer<typeof sectionSchema>;
export type LessonInput = z.infer<typeof lessonSchema>;
export type EnrollInput = z.infer<typeof enrollSchema>;
