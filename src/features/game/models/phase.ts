export type GamePhase =
  | { type: "setup" }
  | {
      type: "reveal"
      currentPlayerId: string
      remainingPlayerIds: string[]
    }
  | {
      type: "vote"
      selectedVoteIds: string[]
    }
  | {
      type: "result"
      winner: "crew" | "impostor"
      impostorIds: readonly string[]
      secretWord: string
    }
  | { type: "score" }