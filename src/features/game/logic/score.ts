import type { Player } from "../models/player"

/**
 * Applies round score rules (immutable).
 * - Crew wins: everyone except the impostor gets +1.
 * - Impostor wins: impostor gets +2.
 *
 * @param players - Current players (readonly, not mutated)
 * @param winner - "crew" | "impostor"
 * @param impostorId - Id of the impostor for this round
 * @returns New array of players with updated scores
 */
export function applyRoundScores(
  players: readonly Player[],
  winner: "crew" | "impostor",
  impostorId: string
): Player[] {
  if (winner === "crew") {
    return players.map((p) =>
      p.id === impostorId ? p : { ...p, score: p.score + 1 }
    )
  }
  return players.map((p) =>
    p.id === impostorId ? { ...p, score: p.score + 2 } : p
  )
}
