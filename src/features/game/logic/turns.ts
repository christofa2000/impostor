/**
 * Gets the next player ID in a circular rotation.
 * @param players - Array of player IDs
 * @param currentPlayerId - Current player ID (or undefined for first player)
 * @returns Next player ID, or first player if current is last/undefined
 */
export function getNextTurnPlayerId(
  players: readonly string[],
  currentPlayerId: string | undefined
): string {
  if (players.length === 0) {
    throw new Error("Cannot get next turn player from empty array")
  }

  if (currentPlayerId === undefined) {
    return players[0] ?? ""
  }

  const currentIndex = players.indexOf(currentPlayerId)
  if (currentIndex === -1) {
    // Current player not found, return first
    return players[0] ?? ""
  }

  const nextIndex = (currentIndex + 1) % players.length
  return players[nextIndex] ?? ""
}
