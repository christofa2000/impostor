export type CategoryId =
  | "food"
  | "movies"
  | "objects"
  | "arg_futbol_78"
  | "technology"
  | "places"
  | "anime"
  | "argentina_things"

export interface GameCategory {
  id: CategoryId
  label: string
  emoji: string
  description: string
}

export const GAME_CATEGORIES: readonly GameCategory[] = [
  {
    id: "food",
    label: "Comida",
    emoji: "🍕",
    description: "Platos y alimentos conocidos",
  },
  {
    id: "movies",
    label: "Películas",
    emoji: "🎬",
    description: "Películas populares y reconocibles",
  },
  {
    id: "objects",
    label: "Objetos",
    emoji: "🧰",
    description: "Objetos cotidianos y cosas del día a día",
  },
  {
    id: "arg_futbol_78",
    label: "Selección Argentina",
    emoji: "⚽",
    description: "Jugadores de la Selección Argentina desde 1978 hasta hoy",
  },
  {
    id: "technology",
    label: "Tecnología",
    emoji: "📱",
    description: "Apps, dispositivos y conceptos tecnológicos",
  },
  {
    id: "places",
    label: "Lugares",
    emoji: "🌎",
    description: "Ciudades, países y lugares famosos",
  },
  {
    id: "anime",
    label: "Anime",
    emoji: "🍥",
    description: "Series y personajes de anime conocidos",
  },
  {
    id: "argentina_things",
    label: "Cosas argentinas",
    emoji: "🧉",
    description: "Cultura, costumbres y elementos típicos de Argentina",
  },
] as const

/**
 * Obtiene una categoría por su ID.
 * @param id - El ID de la categoría a buscar
 * @returns La categoría encontrada o undefined si no existe
 */
export function getCategoryById(id: CategoryId): GameCategory | undefined {
  return GAME_CATEGORIES.find((category) => category.id === id)
}
