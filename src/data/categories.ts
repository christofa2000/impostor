import type { Category } from "@/features/game/models/category"

export const CATEGORIES: Category[] = [
  {
    id: "animals",
    name: "Animales",
    pairs: [
      { crew: "gato", impostor: "perro" },
      { crew: "león", impostor: "tigre" },
      { crew: "elefante", impostor: "rinoceronte" },
      { crew: "pájaro", impostor: "pez" },
      { crew: "conejo", impostor: "ardilla" },
      { crew: "caballo", impostor: "vaca" },
      { crew: "oso", impostor: "lobo" },
      { crew: "delfín", impostor: "ballena" },
      { crew: "águila", impostor: "halcón" },
      { crew: "jirafa", impostor: "cebra" },
    ],
  },
  {
    id: "food",
    name: "Comida",
    words: [
      "pizza",
      "hamburguesa",
      "ensalada",
      "sopa",
      "pasta",
      "arroz",
      "pan",
      "queso",
      "fruta",
      "verdura",
      "postre",
    ],
  },
  {
    id: "sports",
    name: "Deportes",
    words: [
      "fútbol",
      "básquet",
      "tenis",
      "natación",
      "ciclismo",
      "correr",
      "voley",
      "golf",
      "boxeo",
    ],
  },
]
