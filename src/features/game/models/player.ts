import { z } from "zod"

export const PlayerSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1).max(24),
  avatar: z.string().trim().min(1).max(120).nullable().optional(),
})

export type Player = z.infer<typeof PlayerSchema>
