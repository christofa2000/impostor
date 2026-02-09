import { z } from "zod"

/**
 * Player schema. When parsing, any input without `score` is set to 0 (default).
 * Output type Player always has score: number.
 */
export const PlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(24),
  avatar: z.string().trim().min(1).max(120).nullable().optional(),
  score: z.number().int().min(0).default(0),
})

export type Player = z.infer<typeof PlayerSchema>

/** Input type for parsing: score is optional; if missing, parsing sets score = 0 */
export type PlayerInput = z.input<typeof PlayerSchema>
