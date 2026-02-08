import type { CategoryId } from "../game-categories"

export type SimilarPair = Readonly<{
  crew: string
  impostor: string
}>

export type WordsByCategory = Readonly<Record<CategoryId, readonly string[]>>

export type SimilarPairsByCategory = Readonly<
  Record<CategoryId, readonly SimilarPair[]>
>
