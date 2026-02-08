import { z } from "zod"

export const GameSettingsSchema = z.object({
  roundSeconds: z.number().int().min(60).max(3600),
  turnSeconds: z.number().int().min(10).max(120),
  impostorsCount: z.number().int().min(1).max(2),
  categoryId: z.string().min(1),
  hintMode: z.enum(["none", "easy_similar", "hard_category"]),
})

export type GameSettings = z.infer<typeof GameSettingsSchema>
