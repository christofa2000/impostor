/**
 * Elige un elemento al azar del array.
 * @param arr - Array del que elegir (no debe estar vacío)
 * @param rng - Generador de números aleatorios opcional (por defecto Math.random)
 * @returns Un elemento aleatorio del array
 * @throws Error si el array está vacío
 */
export function pickRandom<T>(arr: readonly T[], rng: () => number = Math.random): T {
  if (arr.length === 0) {
    throw new Error("Cannot pick random element from empty array")
  }
  const index = Math.floor(rng() * arr.length)
  return arr[index]
}

/**
 * Baraja el array con el algoritmo Fisher-Yates.
 * Devuelve un array nuevo sin modificar el original.
 * @param arr - Array a barajar
 * @param rng - Generador de números aleatorios opcional (por defecto Math.random)
 * @returns Nuevo array barajado
 */
export function shuffle<T>(arr: readonly T[], rng: () => number = Math.random): T[] {
  const result = [...arr]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

/**
 * Elige `count` elementos aleatorios distintos del array (sin repetición).
 * @param arr - Array del que elegir
 * @param count - Cantidad de elementos a elegir (debe ser >= 0 y <= arr.length)
 * @param rng - Generador de números aleatorios opcional
 * @returns Nuevo array de longitud `count` con elementos únicos
 */
export function pickRandomUnique<T>(
  arr: readonly T[],
  count: number,
  rng: () => number = Math.random
): T[] {
  if (count <= 0) return []
  if (count >= arr.length) return shuffle(arr, rng)
  return shuffle(arr, rng).slice(0, count)
}
