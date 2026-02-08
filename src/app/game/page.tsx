"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import { nanoid } from "nanoid"
import { toast } from "sonner"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
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
import { cn } from "@/lib/utils"
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

        <Button 
          onClick={handleStart} 
          className="w-full shadow-lg active:scale-[0.98] transition-all duration-200" 
          size="lg"
        >
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

  const [hasSeen, setHasSeen] = useState(false)
  const coverY = useMotionValue(0)
  const peekTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Transforms para revelación progresiva
  const revealOpacity = useTransform(coverY, [0, -80, -220], [0, 0.6, 1])
  const revealScale = useTransform(coverY, [0, -220], [0.98, 1])
  const frontOpacity = useTransform(coverY, [0, -220], [1, 0.92])

  useEffect(() => {
    // Reset states when player changes
    setHasSeen(false)
    coverY.set(0)
    
    // Cleanup timeout
    if (peekTimeoutRef.current) {
      clearTimeout(peekTimeoutRef.current)
      peekTimeoutRef.current = null
    }

    return () => {
      if (peekTimeoutRef.current) {
        clearTimeout(peekTimeoutRef.current)
      }
    }
  }, [phase.type === "reveal" ? phase.currentPlayerId : null, coverY])

  if (phase.type !== "reveal") return null

  // Memoize current player lookup
  const currentPlayer = useMemo(
    () => players.find((p) => p.id === phase.currentPlayerId),
    [players, phase.currentPlayerId]
  )
  const isImpostor = currentPlayer?.id === impostorId
  const remainingCount = phase.remainingPlayerIds.length

  // Generate avatar emoji based on player name
  const getAvatarEmoji = (name: string): string => {
    const emojis = ["👤", "🎮", "🎯", "🎲", "🎪", "🎨", "🎭", "🎬", "🎧", "🎸"]
    const index = name.charCodeAt(0) % emojis.length
    return emojis[index] ?? "👤"
  }

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { y: number } }
  ) => {
    const springConfig = { type: "spring" as const, stiffness: 250, damping: 25 }
    
    if (info.offset.y <= -120) {
      // Superó el threshold: marcar como visto y animar completamente arriba
      setHasSeen(true)
      
      // Limpiar timeout anterior si existe
      if (peekTimeoutRef.current) {
        clearTimeout(peekTimeoutRef.current)
      }
      
      // Animar la cortina completamente hacia arriba para revelar
      animate(coverY, -220, springConfig).then(() => {
        // Ocultar automáticamente después de 500ms
        peekTimeoutRef.current = setTimeout(() => {
          // Animar la cortina de vuelta para tapar
          animate(coverY, 0, springConfig)
          peekTimeoutRef.current = null
        }, 500)
      })
    } else {
      // No superó el threshold: animar de vuelta a posición inicial
      animate(coverY, 0, springConfig)
    }
  }

  const handleNextPlayer = () => {
    // Limpiar timeout si existe
    if (peekTimeoutRef.current) {
      clearTimeout(peekTimeoutRef.current)
      peekTimeoutRef.current = null
    }
    
    setHasSeen(false)
    coverY.set(0)
    revealNext()
  }

  return (
    <div className="w-full max-w-md relative overflow-hidden rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl shadow-xl p-6 transition-colors hover:border-primary/40">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">Turno de {currentPlayer?.name}</h2>
          <p className="text-sm text-muted-foreground">
            {remainingCount > 0
              ? `Quedan ${remainingCount} jugador${remainingCount > 1 ? "es" : ""} por ver`
              : "Último jugador"}
          </p>
        </div>
        {/* Card fija con overflow-hidden y altura fija */}
        <div className="relative h-[360px] overflow-hidden rounded-lg border bg-card/50 backdrop-blur-md">
          {/* Overlay con glow radial según rol */}
          <div
            className={cn(
              "pointer-events-none absolute inset-0 opacity-100",
              isImpostor
                ? "bg-[radial-gradient(circle_at_top,_hsl(var(--impostor)/0.22),_transparent_60%)]"
                : "bg-[radial-gradient(circle_at_top,_hsl(var(--crew)/0.20),_transparent_60%)]"
            )}
          />
          {/* Back layer: contenido revelado - siempre renderizado con revelación progresiva */}
          <motion.div
            className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center pointer-events-none"
            style={{ opacity: revealOpacity, scale: revealScale }}
          >
            <div className="mb-4">
              <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 text-4xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]">
                {currentPlayer?.name ? getAvatarEmoji(currentPlayer.name) : "👤"}
              </div>
              <p className="text-lg font-semibold">{currentPlayer?.name}</p>
            </div>
            <div className="space-y-4">
              {/* Badge de rol con micro-animación */}
              <div className="flex items-center justify-center gap-2 mb-2">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide border",
                    isImpostor
                      ? "border-[hsl(var(--impostor)/0.45)] bg-[hsl(var(--impostor)/0.12)] text-[hsl(var(--impostor))]"
                      : "border-[hsl(var(--crew)/0.45)] bg-[hsl(var(--crew)/0.12)] text-[hsl(var(--crew))]"
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full animate-pulse",
                      isImpostor
                        ? "bg-[hsl(var(--impostor))]"
                        : "bg-[hsl(var(--crew))]"
                    )}
                  />
                  <span>{isImpostor ? "IMPOSTOR" : "TRIPULANTE"}</span>
                </div>
              </div>
              <div>
                <p
                  className={cn(
                    "text-5xl font-black uppercase tracking-wider mb-4 drop-shadow-lg",
                    isImpostor
                      ? "text-[hsl(var(--impostor))]"
                      : "text-[hsl(var(--crew))]"
                  )}
                >
                  {isImpostor ? "IMPOSTOR" : "TRIPULANTE"}
                </p>
              </div>
              {isImpostor ? (
                <div className="space-y-3">
                  <p className="text-lg font-semibold">SOS EL IMPOSTOR</p>
                  {settings.hintMode === "easy_similar" && impostorHintWord && (
                    <div className="mt-3 rounded-lg bg-muted/50 p-3">
                      <p className="text-sm text-muted-foreground mb-1">
                        Tu pista:
                      </p>
                      <p className="text-xl font-semibold">{impostorHintWord}</p>
                    </div>
                  )}
                  {settings.hintMode === "hard_category" &&
                    impostorHintCategoryName && (
                      <div className="mt-3 rounded-lg bg-muted/50 p-3">
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
                  <div className="mt-4 rounded-lg bg-muted/50 p-3">
                    <p className="text-sm text-muted-foreground mb-2">
                      La palabra secreta es:
                    </p>
                    <p className="text-xl font-semibold">{secretWord}</p>
                  </div>
                )
              )}
            </div>
          </motion.div>

          {/* Front layer: cortina que se desliza */}
          <motion.div
            drag="y"
            dragConstraints={{ top: -220, bottom: 0 }}
            dragElastic={0.2}
            dragMomentum={false}
            dragDirectionLock
            onDragEnd={handleDragEnd}
            style={{ y: coverY, opacity: frontOpacity }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-card p-8 text-center cursor-grab active:cursor-grabbing"
          >
            <div className="mb-6">
              <div className="mx-auto mb-4 flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 text-5xl shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)]">
                {currentPlayer?.name ? getAvatarEmoji(currentPlayer.name) : "👤"}
              </div>
              <p className="text-xl font-bold">{currentPlayer?.name}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                Deslizá hacia arriba para ver tu rol
              </p>
              <div className="flex justify-center">
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className={cn(
                    "text-2xl",
                    isImpostor
                      ? "text-[hsl(var(--impostor))]"
                      : "text-[hsl(var(--crew))]"
                  )}
                >
                  ↑
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Botón fuera de la card */}
        {hasSeen && (
          <Button 
            onClick={handleNextPlayer} 
            variant="default"
            className={cn(
              "w-full h-12 rounded-xl font-semibold transition-all active:scale-[0.98]",
              isImpostor
                ? "shadow-[0_0_0_1px_hsl(var(--impostor)/0.45),0_12px_40px_-18px_hsl(var(--impostor)/0.55)]"
                : "shadow-[0_0_0_1px_hsl(var(--crew)/0.45),0_12px_40px_-18px_hsl(var(--crew)/0.55)]"
            )}
          >
            Jugador siguiente
          </Button>
        )}
      </div>
    </div>
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
            className="flex-1 shadow-lg active:scale-[0.98] transition-all duration-200"
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
