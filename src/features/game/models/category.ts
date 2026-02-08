import { z } from "zod"

export const WordPairSchema = z.object({
  crew: z.string().trim().min(1).max(40),
  impostor: z.string().trim().min(1).max(40),
})

export type WordPair = z.infer<typeof WordPairSchema>

export const CategorySchema = z
  .object({
    id: z.string().min(1),
    name: z.string().min(1),
    words: z.array(z.string().trim().min(1).max(40)).min(1).optional(),
    pairs: z.array(WordPairSchema).min(1).optional(),
  })
  .refine(
    (data) => {
      const hasWords = data.words !== undefined && data.words.length > 0
      const hasPairs = data.pairs !== undefined && data.pairs.length > 0
      return hasWords || hasPairs
    },
    {
      message: "Category must have at least 'words' or 'pairs'",
    }
  )

export type Category = z.infer<typeof CategorySchema>
