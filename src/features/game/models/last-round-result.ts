/**
 * Why the round ended (vote path).
 * - voted_out: someone was voted out (may be impostor or not)
 * - voted_all_impostors: crew voted exactly all impostors
 * - wrong_vote: crew voted but not exactly the impostors
 * - skip: skip was chosen (no one voted out)
 * - not_voted: no vote was cast (e.g. timeout)
 * - guessed_word: impostor guessed the secret word (from play or vote phase)
 */
export type RoundEndReason =
  | "voted_out"
  | "voted_all_impostors"
  | "wrong_vote"
  | "not_voted"
  | "skip"
  | "guessed_word"

/**
 * Minimal result of a round, used to assign scores and show last round summary.
 */
export interface LastRoundResult {
  winner: "crew" | "impostor"
  /** Why the round ended (vote: voted_out/skip/not_voted; impostor guess: omitted or separate). */
  reason: RoundEndReason
  impostorIds: readonly string[]
  secretWord: string
  /** Player id that was voted (null if skip / no vote). Kept for backward compat. */
  votedPlayerId: string | null
  /** Player ids that were voted out (empty if skip). */
  votedPlayerIds: readonly string[]
  /** Whether the round ended because the impostor guessed the word. */
  impostorGuessedWord?: boolean
}
