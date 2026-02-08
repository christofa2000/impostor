import { z } from "zod"
import type { CategoryId } from "@/data/game-categories"

export const GameSettingsSchema = z.object({
  roundSeconds: z
    .number()
    .int()
    .min(60)
    .max(420)
    .refine((val) => val % 60 === 0, {
      message: "roundSeconds must be a multiple of 60 (representing whole minutes)",
    }),
  turnSeconds: z.number().int().min(10).max(120),
  impostorsCount: z.number().int().min(1).max(2),
  categoryIds: z.array(z.string().min(1) as z.ZodType<CategoryId>).min(1),
  hintMode: z.enum(["none", "easy_similar", "hard_category"]),
})

export type GameSettings = z.infer<typeof GameSettingsSchema>
