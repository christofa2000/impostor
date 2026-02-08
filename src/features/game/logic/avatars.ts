import type { Player } from "../models/player"
import { pickRandom } from "./random"

/**
 * Picks a random avatar from available ones, avoiding those already used.
 * If all avatares are used, returns a random one anyway.
 * @param available - Array of available avatar paths
 * @param used - Set of avatar paths already in use
 * @param rng - Optional random number generator (defaults to Math.random)
 * @returns A random avatar path
 */
export function pickRandomAvatar(
  available: readonly string[],
  used: Set<string>,
  rng: () => number = Math.random
): string {
  if (available.length === 0) {
    throw new Error("Cannot pick avatar from empty available array")
  }

  // Filter out already used avatares
  const unused = available.filter((avatar) => !used.has(avatar))

  // If there are unused avatares, pick from those
  if (unused.length > 0) {
    return pickRandom(unused, rng)
  }

  // Otherwise, all are used, pick any random one
  return pickRandom(available, rng)
}

/**
 * Assigns random avatares to players that don't have one.
 * Attempts to avoid duplicates within this assignment.
 * Does not mutate the input array.
 * @param players - Array of players (some may already have avatares)
 * @param available - Array of available avatar paths
 * @param rng - Optional random number generator (defaults to Math.random)
 * @returns New array of players with avatares assigned
 */
export function assignMissingAvatars(
  players: readonly Player[],
  available: readonly string[],
  rng: () => number = Math.random
): Player[] {
  if (available.length === 0) {
    // No avatares available, return players unchanged
    return [...players]
  }

  // Collect already used avatares from players that have them
  const used = new Set<string>()
  for (const player of players) {
    if (player.avatar !== null && player.avatar !== undefined) {
      used.add(player.avatar)
    }
  }

  // Assign avatares to players that need them
  const result: Player[] = []
  for (const player of players) {
    if (player.avatar === null || player.avatar === undefined) {
      // Player needs an avatar, assign one
      const assignedAvatar = pickRandomAvatar(available, used, rng)
      used.add(assignedAvatar) // Mark as used for next assignments
      result.push({ ...player, avatar: assignedAvatar })
    } else {
      // Player already has an avatar, keep it
      result.push(player)
    }
  }

  return result
}
