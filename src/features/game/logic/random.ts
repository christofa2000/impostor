/**
 * Picks a random element from an array.
 * @param arr - The array to pick from (must not be empty)
 * @param rng - Optional random number generator (defaults to Math.random)
 * @returns A random element from the array
 * @throws Error if the array is empty
 */
export function pickRandom<T>(arr: readonly T[], rng: () => number = Math.random): T {
  if (arr.length === 0) {
    throw new Error("Cannot pick random element from empty array")
  }
  const index = Math.floor(rng() * arr.length)
  return arr[index]
}

/**
 * Shuffles an array using the Fisher-Yates algorithm.
 * Returns a new array without mutating the input.
 * @param arr - The array to shuffle
 * @param rng - Optional random number generator (defaults to Math.random)
 * @returns A new shuffled array
 */
export function shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}
