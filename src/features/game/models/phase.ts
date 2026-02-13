export type PlaySubPhase = "countdown" | "debate"

export type GamePhase =
  | { type: "setup" }
  | {
      type: "reveal"
      currentPlayerId: string
      remainingPlayerIds: string[]
    }
  | {
      type: "play"
      playSubPhase: PlaySubPhase
      /** Id del primer jugador en turno (quien empieza el debate). */
      firstPlayerId: string
    }
  | {
      type: "vote"
      selectedVoteIds: string[]
    }
  | {
      type: "result_countdown"
      winner: "crew" | "impostor"
      impostorIds: readonly string[]
      secretWord: string
    }
  | {
      type: "result"
      winner: "crew" | "impostor"
      impostorIds: readonly string[]
      secretWord: string
    }
  | { type: "score" }