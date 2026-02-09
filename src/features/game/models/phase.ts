export type GamePhase =
  | { type: "setup" }
  | {
      type: "reveal"
      currentPlayerId: string
      remainingPlayerIds: string[]
    }
  | {
      type: "play"
      startedAt: number
      roundEndsAt: number
      turnPlayerId?: string
      turnEndsAt?: number
    }
  | {
      type: "vote"
      selectedPlayerId: string | null
    }
  | {
      type: "result"
      winner: "crew" | "impostor"
      impostorId: string
      secretWord: string
    }
  | { type: "score" }
