import { create } from "zustand"
import {
  DEFAULT_ROUND_SECONDS,
  DEFAULT_TURN_SECONDS,
  DEFAULT_WINNING_SCORE,
  MIN_PLAYERS,
} from "@/lib/constants"
import {
  GAME_CATEGORIES,
  getCategoryById,
  type CategoryId,
} from "@/data/game-categories"
import { WORDS_BY_CATEGORY, SIMILAR_PAIRS_BY_CATEGORY } from "@/data/words-by-category"
import { AVATARS } from "@/data/avatars"
import { PlayerSchema, type Player, type PlayerInput } from "../models/player"
import { GameSettingsSchema, type GameSettings } from "../models/settings"
import type { GamePhase } from "../models/phase"
import type { LastRoundResult } from "../models/last-round-result"
import { pickRandom, shuffle } from "../logic/random"
import { ensureUniquePlayerNames } from "../logic/game-helpers"
import { assignMissingAvatars } from "../logic/avatars"
import { applyRoundScores } from "../logic/score"

interface GameState {
  phase: GamePhase
  players: Player[]
  settings: GameSettings
  secretWord: string | null
  impostorId: string | null
  impostorHintWord: string | null
  impostorHintCategoryName: string | null
  /** Current round number (1-based). */
  roundNumber: number
  /** Result of the last finished round (for scoring / summary). Null before first result. */
  lastRoundResult: LastRoundResult | null
  /** True when at least one player reached settings.winningScore. */
  gameOver: boolean
  /** Player ids that reached winningScore (winners; can be multiple on tie). */
  winnerPlayerIds: string[]
}

interface GameActions {
  setPlayers: (players: PlayerInput[]) => void
  setSettings: (partial: Partial<GameSettings>) => void
  setPlayerAvatar: (playerId: string, avatar: string | null) => void
  setRoundMinutes: (minutes: number) => void
  toggleCategory: (categoryId: CategoryId) => void
  selectAllCategories: () => void
  clearCategories: () => void
  isCategorySelected: (categoryId: CategoryId) => boolean
  createGame: () => string | null
  revealNext: () => void
  selectVote: (targetPlayerId: string | null) => void
  confirmVote: () => void
  /** If guess matches secretWord (case-insensitive, trim), ends round and impostor wins. */
  impostorGuessWord: (guess: string) => boolean
  /** Transition from result to score phase (puntajes). */
  goToScore: () => void
  /** Next round: keeps players and scores, new impostor + word, phase = reveal. Call from result/score only. */
  nextRound: () => string | null
  /** Rematch: keeps players, resets scores to 0 and roundNumber to 1, starts new round (phase = reveal). */
  rematch: () => string | null
  /** New game: full reset (players, settings, scores, phase = setup). */
  newGame: () => void
  resetRound: () => void
  resetAll: () => void
}

const defaultSettings: GameSettings = {
  roundSeconds: DEFAULT_ROUND_SECONDS,
  turnSeconds: DEFAULT_TURN_SECONDS,
  impostorsCount: 1,
  categoryIds: GAME_CATEGORIES[0] ? [GAME_CATEGORIES[0].id] : [],
  hintMode: "none",
  winningScore: DEFAULT_WINNING_SCORE,
}

const initialState: GameState = {
  phase: { type: "setup" },
  players: [],
  settings: defaultSettings,
  secretWord: null,
  impostorId: null,
  impostorHintWord: null,
  impostorHintCategoryName: null,
  roundNumber: 1,
  lastRoundResult: null,
  gameOver: false,
  winnerPlayerIds: [],
}

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...initialState,

  setPlayers: (players: PlayerInput[]) => {
    if (get().phase.type !== "setup") {
      return
    }

    try {
      // PlayerSchema.parse() ensures score defaults to 0 when missing (PlayerInput)
      const validatedPlayers: Player[] = players.map((player) =>
        PlayerSchema.parse(player)
      )
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
      
      // Sanitize roundSeconds and winningScore if present
      let sanitizedPartial = { ...partial }
      if (partial.roundSeconds !== undefined) {
        const rounded = Math.round(partial.roundSeconds / 60) * 60
        const clamped = Math.max(60, Math.min(360, rounded))
        sanitizedPartial = { ...sanitizedPartial, roundSeconds: clamped }
      }
      if (partial.winningScore !== undefined) {
        const clamped = Math.max(1, Math.min(100, Math.round(partial.winningScore)))
        sanitizedPartial = { ...sanitizedPartial, winningScore: clamped }
      }

      const mergedSettings = { ...currentSettings, ...sanitizedPartial }
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

    const clampedMinutes = Math.max(1, Math.min(6, Math.round(minutes)))
    const roundSeconds = clampedMinutes * 60

    // Use setSettings which will sanitize roundSeconds automatically
    state.setSettings({ roundSeconds })
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
    const canStart =
      state.phase.type === "setup" ||
      state.phase.type === "result" ||
      state.phase.type === "score"
    if (!canStart) {
      return "Solo puedes iniciar una partida desde la configuración, el resultado o la pantalla de puntajes"
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

    const nextRoundNumber =
      state.phase.type === "result" || state.phase.type === "score"
        ? state.roundNumber + 1
        : 1

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
      roundNumber: nextRoundNumber,
      gameOver: false,
      winnerPlayerIds: [],
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
      set({
        phase: {
          type: "vote",
          selectedPlayerId: null,
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

    // reason: skip = no one voted, voted_out = someone was voted out
    const reason: LastRoundResult["reason"] =
      selectedPlayerId === null ? "skip" : "voted_out"

    // Victory rules (by vote): impostor not chosen => impostor wins; chosen => crew wins
    const chosenIsImpostor = selectedPlayerId === impostorId
    const winner: "crew" | "impostor" = chosenIsImpostor ? "crew" : "impostor"

    const lastRoundResult: LastRoundResult = {
      winner,
      reason,
      impostorId,
      secretWord,
      votedPlayerId: selectedPlayerId,
      impostorGuessedWord: false,
    }

    const playersWithScores = applyRoundScores(state.players, winner, impostorId)
    const winningScore = state.settings.winningScore
    const maxScore = Math.max(
      0,
      ...playersWithScores.map((p) => p.score)
    )
    const isGameOver = maxScore >= winningScore
    const winnerPlayerIds = isGameOver
      ? playersWithScores
          .filter((p) => p.score >= winningScore)
          .map((p) => p.id)
      : []

    set({
      phase: {
        type: "result",
        winner,
        impostorId,
        secretWord,
      },
      lastRoundResult,
      players: playersWithScores,
      gameOver: isGameOver,
      winnerPlayerIds,
    })
  },

  impostorGuessWord: (guess: string) => {
    const state = get()
    if (state.phase.type !== "vote") {
      return false
    }

    const { secretWord, impostorId } = state
    if (!secretWord || !impostorId) {
      return false
    }

    const guessNorm = guess.trim().toLowerCase()
    const secretNorm = secretWord.trim().toLowerCase()
    if (guessNorm !== secretNorm) {
      return false
    }

    const lastRoundResult: LastRoundResult = {
      winner: "impostor",
      reason: "guessed_word",
      impostorId,
      secretWord,
      votedPlayerId: null,
      impostorGuessedWord: true,
    }

    const playersWithScores = applyRoundScores(state.players, "impostor", impostorId)
    const winningScore = state.settings.winningScore
    const maxScore = Math.max(
      0,
      ...playersWithScores.map((p) => p.score)
    )
    const isGameOver = maxScore >= winningScore
    const winnerPlayerIds = isGameOver
      ? playersWithScores
          .filter((p) => p.score >= winningScore)
          .map((p) => p.id)
      : []

    set({
      phase: {
        type: "result",
        winner: "impostor",
        impostorId,
        secretWord,
      },
      lastRoundResult,
      players: playersWithScores,
      gameOver: isGameOver,
      winnerPlayerIds,
    })
    return true
  },

  goToScore: () => {
    const state = get()
    if (state.phase.type !== "result") return
    set({ phase: { type: "score" } })
  },

  nextRound: () => {
    const state = get()
    if (state.phase.type !== "result" && state.phase.type !== "score") {
      return "Solo puedes iniciar la siguiente ronda desde el resultado o la pantalla de puntajes"
    }
    // Does NOT clear players nor scores; createGame() picks new impostor/word and sets phase = reveal
    return get().createGame()
  },

  rematch: () => {
    const state = get()
    if (state.phase.type !== "result" && state.phase.type !== "score") {
      return "Solo puedes hacer revancha desde el resultado o la pantalla de puntajes"
    }
    const playersWithZeroScore: Player[] = state.players.map((p) => ({
      ...p,
      score: 0,
    }))
    set({
      phase: { type: "setup" },
      players: playersWithZeroScore,
      settings: state.settings,
      secretWord: null,
      impostorId: null,
      impostorHintWord: null,
      impostorHintCategoryName: null,
      roundNumber: 1,
      lastRoundResult: null,
      gameOver: false,
      winnerPlayerIds: [],
    })
    return get().createGame()
  },

  newGame: () => {
    set({
      ...initialState,
      settings: defaultSettings,
      secretWord: null,
      impostorId: null,
      impostorHintWord: null,
      impostorHintCategoryName: null,
      roundNumber: 1,
      lastRoundResult: null,
      gameOver: false,
      winnerPlayerIds: [],
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
      roundNumber: 1,
      lastRoundResult: null,
      gameOver: false,
      winnerPlayerIds: [],
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
      roundNumber: 1,
      lastRoundResult: null,
      gameOver: false,
      winnerPlayerIds: [],
    })
  },
}))
