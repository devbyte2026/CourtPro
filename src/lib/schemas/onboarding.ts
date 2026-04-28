import { z } from "zod";

export const step1Schema = z.object({
  name: z.string().min(2, "Nombre demasiado corto"),
  slug: z
    .string()
    .min(3, "Mínimo 3 caracteres")
    .regex(/^[a-z0-9-]+$/, "Solo letras minúsculas, números y guiones"),
  description: z.string().optional(),
  address: z.string().min(5, "Dirección requerida"),
  city: z.string().min(2, "Ciudad requerida"),
  phone: z.string().optional(),
});

export const step2Schema = z.object({
  courts: z
    .array(
      z.object({
        name: z.string().min(1, "Nombre requerido"),
        sport_type: z.enum(["futbol", "padel", "volleyball", "tennis", "basketball", "other"]),
        capacity: z.number().min(1),
        default_price: z.number().min(0),
      })
    )
    .min(1, "Agregá al menos una cancha"),
});

export const step3Schema = z.object({
  schedules: z
    .array(
      z.object({
        day_of_week: z.number().min(0).max(6),
        start_time: z.string(),
        end_time: z.string(),
        is_active: z.boolean(),
      })
    )
    .min(1),
  pricing_rules: z
    .array(
      z.object({
        day_of_week: z.number().nullable(),
        start_time: z.string(),
        end_time: z.string(),
        price_modifier: z.number(),
      })
    )
    .optional(),
});

export type Step1Data = z.infer<typeof step1Schema>;
export type Step2Data = z.infer<typeof step2Schema>;
export type Step3Data = z.infer<typeof step3Schema>;