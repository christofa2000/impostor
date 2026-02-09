/**
 * Why the round ended (vote path).
 * - voted_out: someone was voted out (may be impostor or not)
 * - skip: skip was chosen (no one voted out)
 * - not_voted: no vote was cast (e.g. timeout)
 * - guessed_word: impostor guessed the secret word (from play or vote phase)
 */
export type RoundEndReason = "voted_out" | "not_voted" | "skip" | "guessed_word"

/**
 * Minimal result of a round, used to assign scores and show last round summary.
 */
export interface LastRoundResult {
  winner: "crew" | "impostor"
  /** Why the round ended (vote: voted_out/skip/not_voted; impostor guess: omitted or separate). */
  reason: RoundEndReason
  impostorId: string
  secretWord: string
  /** Player id that was voted (null if skip / no vote). */
  votedPlayerId: string | null
  /** Whether the round ended because the impostor guessed the word. */
  impostorGuessedWord?: boolean
}
