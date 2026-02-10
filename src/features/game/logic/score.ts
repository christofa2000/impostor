import type { Player } from "../models/player"

/**
 * Applies round score rules (immutable).
 * - Crew wins: +1 to every player NOT in impostorIds.
 * - Impostor wins: +2 to every player in impostorIds.
 *
 * @param players - Current players (readonly, not mutated)
 * @param winner - "crew" | "impostor"
 * @param impostorIds - Ids of the impostors for this round
 * @returns New array of players with updated scores
 */
export function applyRoundScores(
  players: readonly Player[],
  winner: "crew" | "impostor",
  impostorIds: readonly string[]
): Player[] {
  return players.map((player) => {
    if (winner === "crew") {
      return impostorIds.includes(player.id)
        ? player
        : { ...player, score: player.score + 1 }
    }
    if (winner === "impostor") {
      return impostorIds.includes(player.id)
        ? { ...player, score: player.score + 2 }
        : player
    }
    return player
  })
}
