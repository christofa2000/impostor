import type { Player } from "../models/player"

/**
 * Normalizes a player name by trimming and collapsing multiple spaces.
 * @param name - The name to normalize
 * @returns The normalized name
 */
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, " ")
}

/**
 * Ensures all player names are unique by adding numeric suffixes to duplicates.
 * Names are normalized before comparison. Suffixes are added deterministically
 * based on the order of appearance.
 * @param players - Array of players to process
 * @returns New array with unique names (ids remain unchanged)
 */
export function ensureUniquePlayerNames(players: readonly Player[]): Player[] {
  const normalizedToCount = new Map<string, number>()
  const result: Player[] = []

  for (const player of players) {
    const normalized = normalizeName(player.name)

    if (!normalizedToCount.has(normalized)) {
      normalizedToCount.set(normalized, 0)
      result.push({ ...player, name: normalized })
    } else {
      const count = normalizedToCount.get(normalized) ?? 0
      const newCount = count + 1
      normalizedToCount.set(normalized, newCount)
      const suffix = ` (${newCount + 1})`
      result.push({ ...player, name: normalized + suffix })
    }
  }

  return result
}
