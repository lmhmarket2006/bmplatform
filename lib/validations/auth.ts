import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string()
    .min(3, "الاسم يجب أن يكون 3 أحرف على الأقل")
    .max(60, "الاسم طويل جداً"),
  email: z.string().email("بريد إلكتروني غير صالح"),
  phone: z
    .string()
    .min(8, "رقم هاتف غير صالح")
    .max(20)
    .optional()
    .or(z.literal("")),
  password: z
    .string()
    .min(6, "كلمة المرور يجب أن تكون 6 أحرف على الأقل")
    .max(100),
});

export const loginSchema = z.object({
  email: z.string().email("بريد إلكتروني غير صالح"),
  password: z.string().min(1, "أدخل كلمة المرور"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
