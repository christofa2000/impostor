"use client"

import { useState, useEffect, useRef } from "react"
import { nanoid } from "nanoid"
import { toast } from "sonner"
import { useGameStore } from "@/features/game/store/useGameStore"
import { CATEGORIES } from "@/data/categories"
import { MIN_PLAYERS, MAX_PLAYERS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { Player } from "@/features/game/models/player"

function SetupPhase() {
  const setPlayers = useGameStore((state) => state.setPlayers)
  const settings = useGameStore((state) => state.settings)
  const setSettings = useGameStore((state) => state.setSettings)
  const createGame = useGameStore((state) => state.createGame)

  const [playerNames, setPlayerNames] = useState<string[]>(["", "", ""])
  const [showError, setShowError] = useState(false)

  const handlePlayerNameChange = (index: number, value: string) => {
    const newNames = [...playerNames]
    newNames[index] = value
    setPlayerNames(newNames)
  }

  const addPlayer = () => {
    if (playerNames.length < MAX_PLAYERS) {
      setPlayerNames([...playerNames, ""])
    }
  }

  const removePlayer = (index: number) => {
    if (playerNames.length > MIN_PLAYERS) {
      const newNames = playerNames.filter((_, i) => i !== index)
      setPlayerNames(newNames)
    }
  }

  const handleStart = () => {
    const validPlayers: Player[] = playerNames
      .map((name) => name.trim())
      .filter((name) => name.length > 0)
      .map((name) => ({
        id: nanoid(),
        name,
      }))

    if (validPlayers.length < MIN_PLAYERS) {
      toast.error(`Necesitas al menos ${MIN_PLAYERS} jugadores`)
      setShowError(true)
      return
    }

    setShowError(false)
    setPlayers(validPlayers)
    const error = createGame()
    if (error) {
      toast.error(error)
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Configurar partida</CardTitle>
        <CardDescription>
          Agrega entre {MIN_PLAYERS} y {MAX_PLAYERS} jugadores
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {playerNames.map((name, index) => (
            <div key={index} className="flex gap-2">
              <Input
                placeholder={`Jugador ${index + 1}`}
                value={name}
                onChange={(e) => handlePlayerNameChange(index, e.target.value)}
              />
              {playerNames.length > MIN_PLAYERS && (
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => removePlayer(index)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
        </div>

        {playerNames.length < MAX_PLAYERS && (
          <Button variant="outline" onClick={addPlayer} className="w-full">
            + Agregar jugador
          </Button>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">Categoría</label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            value={settings.categoryId}
            onChange={(e) => setSettings({ categoryId: e.target.value })}
          >
            {CATEGORIES.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Modo de pista</label>
          <select
            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] outline-none"
            value={settings.hintMode}
            onChange={(e) =>
              setSettings({
                hintMode: e.target.value as "none" | "easy_similar" | "hard_category",
              })
            }
          >
            <option value="none">Sin pistas</option>
            <option value="easy_similar">Pista fácil (palabra similar)</option>
            <option value="hard_category">Pista difícil (solo categoría)</option>
          </select>
        </div>

        {showError && (
          <p className="text-sm text-destructive">
            Necesitas al menos {MIN_PLAYERS} jugadores
          </p>
        )}

        <Button onClick={handleStart} className="w-full" size="lg">
          Empezar
        </Button>
      </CardContent>
    </Card>
  )
}

function RevealPhase() {
  const phase = useGameStore((state) => state.phase)
  const players = useGameStore((state) => state.players)
  const secretWord = useGameStore((state) => state.secretWord)
  const impostorId = useGameStore((state) => state.impostorId)
  const impostorHintWord = useGameStore((state) => state.impostorHintWord)
  const impostorHintCategoryName = useGameStore(
    (state) => state.impostorHintCategoryName
  )
  const settings = useGameStore((state) => state.settings)
  const revealNext = useGameStore((state) => state.revealNext)

  const [isPressing, setIsPressing] = useState(false)

  if (phase.type !== "reveal") return null

  const currentPlayer = players.find((p) => p.id === phase.currentPlayerId)
  const isImpostor = currentPlayer?.id === impostorId
  const remainingCount = phase.remainingPlayerIds.length

  const handlePointerDown = () => {
    setIsPressing(true)
  }

  const handlePointerUp = () => {
    setIsPressing(false)
  }

  const handlePointerCancel = () => {
    setIsPressing(false)
  }

  const handleMouseLeave = () => {
    setIsPressing(false)
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Turno de {currentPlayer?.name}</CardTitle>
        <CardDescription>
          {remainingCount > 0
            ? `Quedan ${remainingCount} jugador${remainingCount > 1 ? "es" : ""} por ver`
            : "Último jugador"}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4">
          <div
            className="rounded-lg border p-4 text-center select-none touch-none"
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerCancel}
            onMouseLeave={handleMouseLeave}
          >
            <p className="text-sm text-muted-foreground mb-2">Tu rol:</p>
            <div
              className={`transition-all duration-150 ${
                isPressing ? "blur-0 opacity-100" : "blur-md opacity-50"
              }`}
            >
              <p className="text-2xl font-bold">
                {isImpostor ? "🕵️ Impostor" : "👤 Tripulante"}
              </p>
              {isImpostor ? (
                <div className="mt-4 space-y-2">
                  <p className="text-lg font-semibold">SOS EL IMPOSTOR</p>
                  {settings.hintMode === "easy_similar" && impostorHintWord && (
                    <div className="mt-3">
                      <p className="text-sm text-muted-foreground mb-1">
                        Tu pista:
                      </p>
                      <p className="text-xl font-semibold">{impostorHintWord}</p>
                    </div>
                  )}
                  {settings.hintMode === "hard_category" &&
                    impostorHintCategoryName && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground mb-1">
                          Categoría:
                        </p>
                        <p className="text-xl font-semibold">
                          {impostorHintCategoryName}
                        </p>
                      </div>
                    )}
                </div>
              ) : (
                secretWord && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">
                      La palabra secreta es:
                    </p>
                    <p className="text-xl font-semibold">{secretWord}</p>
                  </div>
                )
              )}
            </div>
            {!isPressing && (
              <p className="mt-4 text-sm text-muted-foreground">
                Mantén presionado para revelar
              </p>
            )}
          </div>
          <Button onClick={revealNext} className="w-full" size="lg">
            Ocultar y pasar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function PlayPhase() {
  const phase = useGameStore((state) => state.phase)
  const players = useGameStore((state) => state.players)
  const settings = useGameStore((state) => state.settings)
  const startVote = useGameStore((state) => state.startVote)
  const nextTurn = useGameStore((state) => state.nextTurn)
  const [roundTimeRemaining, setRoundTimeRemaining] = useState(0)
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(0)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (phase.type !== "play") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    let hasTriggeredTurnAdvance = false
    let hasTriggeredRoundEnd = false
    const initialTurnEndsAt = phase.turnEndsAt
    const initialRoundEndsAt = phase.roundEndsAt

    const updateTimers = () => {
      const now = Date.now()
      const roundRemaining = Math.max(
        0,
        Math.floor((phase.roundEndsAt - now) / 1000)
      )
      setRoundTimeRemaining(roundRemaining)

      if (phase.turnEndsAt) {
        const turnRemaining = Math.max(
          0,
          Math.floor((phase.turnEndsAt - now) / 1000)
        )
        setTurnTimeRemaining(turnRemaining)

        // Auto-advance turn when timer reaches 0 (only once per turn)
        if (
          turnRemaining === 0 &&
          !hasTriggeredTurnAdvance &&
          phase.turnEndsAt === initialTurnEndsAt
        ) {
          hasTriggeredTurnAdvance = true
          // Vibrate if available
          if (typeof navigator !== "undefined" && navigator.vibrate) {
            navigator.vibrate(200)
          }
          nextTurn()
        }
      } else {
        setTurnTimeRemaining(0)
      }

      // Auto-start vote when round timer reaches 0 (only once)
      if (
        roundRemaining === 0 &&
        !hasTriggeredRoundEnd &&
        phase.roundEndsAt === initialRoundEndsAt
      ) {
        hasTriggeredRoundEnd = true
        startVote()
      }
    }

    updateTimers()
    intervalRef.current = setInterval(updateTimers, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [
    phase.type === "play" ? phase.roundEndsAt : null,
    phase.type === "play" ? phase.turnEndsAt : null,
    phase.type === "play" ? phase.turnPlayerId : null,
    nextTurn,
    startVote,
  ])

  if (phase.type !== "play") return null

  const currentTurnPlayer = players.find((p) => p.id === phase.turnPlayerId)
  const roundMinutes = Math.floor(roundTimeRemaining / 60)
  const roundSeconds = roundTimeRemaining % 60
  const turnMinutes = Math.floor(turnTimeRemaining / 60)
  const turnSeconds = turnTimeRemaining % 60

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Jugando</CardTitle>
        <CardDescription>Discutan y descubran al impostor</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentTurnPlayer && (
          <div className="rounded-lg border p-4 text-center">
            <p className="text-sm text-muted-foreground mb-1">Turno de:</p>
            <p className="text-xl font-bold">{currentTurnPlayer.name}</p>
          </div>
        )}

        <div className="space-y-3">
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Tiempo del turno</p>
            <p className="text-3xl font-bold">
              {String(turnMinutes).padStart(2, "0")}:
              {String(turnSeconds).padStart(2, "0")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">Tiempo de ronda</p>
            <p className="text-2xl font-semibold">
              {String(roundMinutes).padStart(2, "0")}:
              {String(roundSeconds).padStart(2, "0")}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={nextTurn} variant="outline" className="flex-1">
            Siguiente turno
          </Button>
          <Button onClick={startVote} className="flex-1" size="lg">
            Ir a votar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function VotePhase() {
  const phase = useGameStore((state) => state.phase)
  const players = useGameStore((state) => state.players)
  const selectVote = useGameStore((state) => state.selectVote)
  const confirmVote = useGameStore((state) => state.confirmVote)

  if (phase.type !== "vote") return null

  const selectedPlayerId = phase.selectedPlayerId

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Votación</CardTitle>
        <CardDescription>
          Elijan entre todos quién es el impostor
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          {players.map((player) => (
            <Button
              key={player.id}
              variant={selectedPlayerId === player.id ? "default" : "outline"}
              className="w-full justify-start"
              onClick={() => selectVote(player.id)}
            >
              {player.name}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => selectVote(null)}
            variant="outline"
            className="flex-1"
          >
            Skip
          </Button>
          <Button
            onClick={confirmVote}
            className="flex-1"
            size="lg"
          >
            Confirmar voto
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

function ResultPhase() {
  const phase = useGameStore((state) => state.phase)
  const players = useGameStore((state) => state.players)
  const reset = useGameStore((state) => state.reset)

  if (phase.type !== "result") return null

  const impostor = players.find((p) => p.id === phase.impostorId)
  const isCrewWin = phase.winner === "crew"

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>
          {isCrewWin ? "🎉 ¡Tripulación gana!" : "🕵️ ¡Impostor gana!"}
        </CardTitle>
        <CardDescription>Resultado de la partida</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">El impostor era:</p>
          <p className="text-xl font-bold">{impostor?.name}</p>
        </div>
        <div className="space-y-2 rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">La palabra secreta era:</p>
          <p className="text-xl font-bold">{phase.secretWord}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={reset} variant="outline" className="flex-1">
            Nueva partida
          </Button>
          <Button onClick={reset} className="flex-1">
            Revancha
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default function GamePage() {
  const phase = useGameStore((state) => state.phase)

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <div className="w-full">
        {phase.type === "setup" && <SetupPhase />}
        {phase.type === "reveal" && <RevealPhase />}
        {phase.type === "play" && <PlayPhase />}
        {phase.type === "vote" && <VotePhase />}
        {phase.type === "result" && <ResultPhase />}
      </div>
    </div>
  )
}
