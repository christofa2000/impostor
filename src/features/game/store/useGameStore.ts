import { create } from "zustand"
import { DEFAULT_ROUND_SECONDS, DEFAULT_TURN_SECONDS, MIN_PLAYERS } from "@/lib/constants"
import {
  GAME_CATEGORIES,
  getCategoryById,
  type CategoryId,
} from "@/data/game-categories"
import { WORDS_BY_CATEGORY, SIMILAR_PAIRS_BY_CATEGORY } from "@/data/words-by-category"
import { AVATARS } from "@/data/avatars"
import { PlayerSchema, type Player } from "../models/player"
import { GameSettingsSchema, type GameSettings } from "../models/settings"
import type { GamePhase } from "../models/phase"
import { pickRandom, shuffle } from "../logic/random"
import { ensureUniquePlayerNames } from "../logic/game-helpers"
import { assignMissingAvatars } from "../logic/avatars"

interface GameState {
  phase: GamePhase
  players: Player[]
  settings: GameSettings
  secretWord: string | null
  impostorId: string | null
  impostorHintWord: string | null
  impostorHintCategoryName: string | null
}

interface GameActions {
  setPlayers: (players: Player[]) => void
  setSettings: (partial: Partial<GameSettings>) => void
  setPlayerAvatar: (playerId: string, avatar: string | null) => void
  setRoundMinutes: (minutes: number) => void
  toggleCategory: (categoryId: CategoryId) => void
  selectAllCategories: () => void
  clearCategories: () => void
  isCategorySelected: (categoryId: CategoryId) => boolean
  createGame: () => string | null
  revealNext: () => void
  nextTurn: () => void
  startVote: () => void
  selectVote: (targetPlayerId: string | null) => void
  confirmVote: () => void
  resetRound: () => void
  resetAll: () => void
}

const defaultSettings: GameSettings = {
  roundSeconds: DEFAULT_ROUND_SECONDS,
  turnSeconds: DEFAULT_TURN_SECONDS,
  impostorsCount: 1,
  categoryIds: GAME_CATEGORIES[0] ? [GAME_CATEGORIES[0].id] : [],
  hintMode: "none",
}

const initialState: GameState = {
  phase: { type: "setup" },
  players: [],
  settings: defaultSettings,
  secretWord: null,
  impostorId: null,
  impostorHintWord: null,
  impostorHintCategoryName: null,
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  setPlayers: (players: Player[]) => {
    if (get().phase.type !== "setup") {
      return
    }

    try {
      const validatedPlayers = players.map((player) => PlayerSchema.parse(player))
      const uniquePlayers = ensureUniquePlayerNames(validatedPlayers)
      set({ players: uniquePlayers })
    } catch (error) {
      console.error("Invalid players:", error)
    }
  },

  setSettings: (partial: Partial<GameSettings>) => {
    if (get().phase.type !== "setup") {
      return
    }

    try {
      const currentSettings = get().settings
      const mergedSettings = { ...currentSettings, ...partial }
      const validatedSettings = GameSettingsSchema.parse(mergedSettings)
      set({ settings: validatedSettings })
    } catch (error) {
      console.error("Invalid settings:", error)
    }
  },

  setPlayerAvatar: (playerId: string, avatar: string | null) => {
    const state = get()
    if (state.phase.type !== "setup") {
      return
    }

    const playerIndex = state.players.findIndex((p) => p.id === playerId)
    if (playerIndex === -1) {
      return
    }

    try {
      const updatedPlayers = state.players.map((player) => {
        if (player.id === playerId) {
          const updatedPlayer = { ...player, avatar }
          return PlayerSchema.parse(updatedPlayer)
        }
        return player
      })
      set({ players: updatedPlayers })
    } catch (error) {
      console.error("Invalid avatar:", error)
    }
  },

  setRoundMinutes: (minutes: number) => {
    const state = get()
    if (state.phase.type !== "setup") {
      return
    }

    const clampedMinutes = Math.max(1, Math.min(7, Math.round(minutes)))
    const roundSeconds = clampedMinutes * 60

    try {
      const updatedSettings = { ...state.settings, roundSeconds }
      const validatedSettings = GameSettingsSchema.parse(updatedSettings)
      set({ settings: validatedSettings })
    } catch (error) {
      console.error("Invalid roundSeconds:", error)
    }
  },

  toggleCategory: (categoryId: CategoryId) => {
    const state = get()
    if (state.phase.type !== "setup") {
      return
    }

    const currentCategoryIds = state.settings.categoryIds
    const isSelected = currentCategoryIds.includes(categoryId)

    let newCategoryIds: CategoryId[]
    if (isSelected) {
      // Remove category, but ensure at least one remains
      if (currentCategoryIds.length <= 1) {
        return // Cannot remove the last category
      }
      newCategoryIds = currentCategoryIds.filter((id) => id !== categoryId)
    } else {
      // Add category
      newCategoryIds = [...currentCategoryIds, categoryId]
    }

    try {
      const updatedSettings = { ...state.settings, categoryIds: newCategoryIds }
      const validatedSettings = GameSettingsSchema.parse(updatedSettings)
      set({ settings: validatedSettings })
    } catch (error) {
      console.error("Invalid categoryIds:", error)
    }
  },

  selectAllCategories: () => {
    const state = get()
    if (state.phase.type !== "setup") {
      return
    }

    const allCategoryIds: CategoryId[] = GAME_CATEGORIES.map((cat) => cat.id)

    try {
      const updatedSettings = { ...state.settings, categoryIds: allCategoryIds }
      const validatedSettings = GameSettingsSchema.parse(updatedSettings)
      set({ settings: validatedSettings })
    } catch (error) {
      console.error("Invalid categoryIds:", error)
    }
  },

  clearCategories: () => {
    const state = get()
    if (state.phase.type !== "setup") {
      return
    }

    // Set to first category as default (cannot be empty)
    const firstCategoryId: CategoryId[] = GAME_CATEGORIES[0] ? [GAME_CATEGORIES[0].id] : []

    try {
      const updatedSettings = { ...state.settings, categoryIds: firstCategoryId }
      const validatedSettings = GameSettingsSchema.parse(updatedSettings)
      set({ settings: validatedSettings })
    } catch (error) {
      console.error("Invalid categoryIds:", error)
    }
  },

  isCategorySelected: (categoryId: CategoryId): boolean => {
    const state = get()
    return state.settings.categoryIds.includes(categoryId)
  },

  createGame: () => {
    const state = get()
    if (state.phase.type !== "setup") {
      return "La partida ya está en curso"
    }

    const { players, settings } = state

    if (players.length < MIN_PLAYERS) {
      return `Necesitas al menos ${MIN_PLAYERS} jugadores`
    }

    if (settings.categoryIds.length === 0) {
      return "Debes seleccionar al menos una categoría"
    }

    // Choose a random category from selected ones
    const selectedCategoryId = pickRandom(settings.categoryIds)
    const category = getCategoryById(selectedCategoryId)
    if (!category) {
      return "Categoría no encontrada"
    }

    const words = WORDS_BY_CATEGORY[selectedCategoryId]
    const pairs = SIMILAR_PAIRS_BY_CATEGORY[selectedCategoryId]
    const hasWords = words !== undefined && words.length > 0
    const hasPairs = pairs !== undefined && pairs.length > 0

    if (!hasWords && !hasPairs) {
      return "La categoría debe tener palabras o pares"
    }

    // Assign missing avatares before creating the game
    const playersWithAvatares = assignMissingAvatars(players, AVATARS)
    set({ players: playersWithAvatares })

    const impostor = pickRandom(playersWithAvatares)
    let secretWord: string
    let impostorHintWord: string | null = null
    let impostorHintCategoryName: string | null = null

    // Determine hint mode, with fallback for easy_similar if no pairs available
    let effectiveHintMode = settings.hintMode
    if (settings.hintMode === "easy_similar" && !hasPairs) {
      // Fallback: if easy_similar is requested but category has no pairs,
      // fall back to "none" mode and use words instead
      effectiveHintMode = "none"
      console.warn(
        "easy_similar mode requested but category has no pairs. Falling back to 'none' mode."
      )
    }

    // Select word/pair based on effective hint mode
    if (effectiveHintMode === "easy_similar" && hasPairs && pairs) {
      // easy_similar: use pairs, crew word for crew, impostor word as hint
      const selectedPair = pickRandom(pairs)
      secretWord = selectedPair.crew
      impostorHintWord = selectedPair.impostor
    } else if (effectiveHintMode === "hard_category" && hasWords && words) {
      // hard_category: use words, impostor only gets category name
      secretWord = pickRandom(words)
      impostorHintCategoryName = category.label
    } else {
      // none mode (or fallback): use words, no hints
      if (hasWords && words) {
        secretWord = pickRandom(words)
      } else if (hasPairs && pairs) {
        // Fallback: if only pairs available but mode is none/hard_category, use crew word
        const selectedPair = pickRandom(pairs)
        secretWord = selectedPair.crew
      } else {
        return "No se pudo determinar la palabra secreta"
      }
    }

    const playerIds = playersWithAvatares.map((p) => p.id)
    const shuffledPlayerIds = shuffle(playerIds)
    const firstPlayerId = shuffledPlayerIds[0] ?? ""
    const remainingPlayerIds = shuffledPlayerIds.slice(1)

    set({
      phase: {
        type: "reveal",
        currentPlayerId: firstPlayerId,
        remainingPlayerIds,
      },
      impostorId: impostor.id,
      secretWord,
      impostorHintWord,
      impostorHintCategoryName,
    })

    return null
  },

  revealNext: () => {
    const state = get()
    if (state.phase.type !== "reveal") {
      return
    }

    const { remainingPlayerIds } = state.phase

    if (remainingPlayerIds.length === 0) {
      const { settings, players } = state
      if (players.length === 0) {
        return
      }

      const now = Date.now()
      const roundEndsAt = now + settings.roundSeconds * 1000
      // Initialize first turn deterministically with first player
      const firstTurnPlayerId = players[0]?.id ?? ""
      const turnEndsAt = now + settings.turnSeconds * 1000

      set({
        phase: {
          type: "play",
          startedAt: now,
          roundEndsAt,
          turnPlayerId: firstTurnPlayerId,
          turnEndsAt,
        },
      })
    } else {
      const [nextPlayerId, ...rest] = remainingPlayerIds
      set({
        phase: {
          type: "reveal",
          currentPlayerId: nextPlayerId,
          remainingPlayerIds: rest,
        },
      })
    }
  },

  nextTurn: () => {
    const state = get()
    if (state.phase.type !== "play") {
      return
    }

    const { players, settings } = state
    if (players.length === 0) {
      return
    }

    const playerIds = players.map((p) => p.id)
    const currentTurnPlayerId = state.phase.turnPlayerId

    // Get next player ID in circular rotation
    let nextTurnPlayerId: string
    if (currentTurnPlayerId === undefined) {
      // No current turn, start with first player
      nextTurnPlayerId = playerIds[0] ?? ""
    } else {
      const currentIndex = playerIds.indexOf(currentTurnPlayerId)
      if (currentIndex === -1) {
        // Current player not found, start with first
        nextTurnPlayerId = playerIds[0] ?? ""
      } else {
        // Circular rotation: next index, wrapping around
        const nextIndex = (currentIndex + 1) % playerIds.length
        nextTurnPlayerId = playerIds[nextIndex] ?? ""
      }
    }

    const now = Date.now()
    const turnEndsAt = now + settings.turnSeconds * 1000

    set({
      phase: {
        ...state.phase,
        turnPlayerId: nextTurnPlayerId,
        turnEndsAt,
      },
    })
  },

  startVote: () => {
    const state = get()
    if (state.phase.type !== "play") {
      return
    }

    set({
      phase: {
        type: "vote",
        selectedPlayerId: null,
      },
    })
  },

  selectVote: (targetPlayerId: string | null) => {
    const state = get()
    if (state.phase.type !== "vote") {
      return
    }

    // Validate that targetPlayerId exists in players if not null
    if (targetPlayerId !== null) {
      const isValidPlayer = state.players.some((p) => p.id === targetPlayerId)
      if (!isValidPlayer) {
        return
      }
    }

    set({
      phase: {
        ...state.phase,
        selectedPlayerId: targetPlayerId,
      },
    })
  },

  confirmVote: () => {
    const state = get()
    if (state.phase.type !== "vote") {
      return
    }

    const { selectedPlayerId } = state.phase
    const { impostorId, secretWord } = state

    if (!impostorId || !secretWord) {
      return
    }

    // Determine winner based on vote:
    // - If selectedPlayerId is null (skip/no vote) -> impostor wins (no one was expelled)
    // - If selectedPlayerId === impostorId -> crew wins (impostor was correctly identified)
    // - If selectedPlayerId !== impostorId -> impostor wins (wrong person was expelled)
    let winner: "crew" | "impostor"
    if (selectedPlayerId === null) {
      // No vote / skip: impostor wins because no one was expelled
      winner = "impostor"
    } else if (selectedPlayerId === impostorId) {
      // Correct vote: crew wins
      winner = "crew"
    } else {
      // Wrong vote: impostor wins
      winner = "impostor"
    }

    set({
      phase: {
        type: "result",
        winner,
        impostorId,
        secretWord,
      },
    })
  },

  resetRound: () => {
    const state = get()
    set({
      phase: { type: "setup" },
      secretWord: null,
      impostorId: null,
      impostorHintWord: null,
      impostorHintCategoryName: null,
      // Preserve players and settings
      players: state.players,
      settings: state.settings,
    })
  },

  resetAll: () => {
    set({
      ...initialState,
      settings: defaultSettings,
      secretWord: null,
      impostorId: null,
      impostorHintWord: null,
      impostorHintCategoryName: null,
    })
  },
}))
