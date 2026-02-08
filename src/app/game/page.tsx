"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import Image from "next/image"
import Link from "next/link"
import { nanoid } from "nanoid"
import { toast } from "sonner"
import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useGameStore } from "@/features/game/store/useGameStore"
import { GAME_CATEGORIES } from "@/data/game-categories"
import { AVATARS } from "@/data/avatars"
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
import { PremiumCard } from "@/components/ui/premium-card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"
import { pickRandom } from "@/features/game/logic/random"
import type { Player } from "@/features/game/models/player"

function SetupPhase() {
  const players = useGameStore((state) => state.players)
  const settings = useGameStore((state) => state.settings)
  const setSettings = useGameStore((state) => state.setSettings)
  const createGame = useGameStore((state) => state.createGame)

  const handleStart = () => {
    if (players.length < MIN_PLAYERS) {
      toast.error(`Necesitas al menos ${MIN_PLAYERS} jugadores`)
      return
    }

    const error = createGame()
    if (error) {
      toast.error(error)
    }
  }

  const handleImpostorsChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(2, settings.impostorsCount + delta))
    setSettings({ impostorsCount: newCount })
  }

  const handleHintModeChange = (value: string) => {
    setSettings({ hintMode: value as "none" | "easy_similar" | "hard_category" })
  }

  const roundMinutes = Math.floor(settings.roundSeconds / 60)

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="w-10" /> {/* Spacer */}
        <h1 className="text-xl font-semibold text-zinc-50">Configuración</h1>
        <div className="w-10" /> {/* Spacer */}
      </div>

      {/* Menu Items */}
      <div className="space-y-3 pb-28">
        {/* Modo de Juego */}
        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🎮</span>
            <div>
              <div className="text-sm font-medium text-zinc-50">Modo de Juego</div>
              <div className="text-xs text-muted-foreground">Clásico</div>
            </div>
          </div>
        </div>

        {/* Jugadores */}
        <Link href="/game/players">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex justify-between items-center cursor-pointer hover:bg-white/[0.07] transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">👥</span>
              <div>
                <div className="text-sm font-medium text-zinc-50">Jugadores</div>
                <div className="text-xs text-muted-foreground">
                  {players.length} {players.length === 1 ? "jugador" : "jugadores"}
                </div>
              </div>
            </div>
            <span className="text-muted-foreground">›</span>
          </div>
        </Link>

        {/* Impostores */}
        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🕵️</span>
            <div>
              <div className="text-sm font-medium text-zinc-50">Impostores</div>
              <div className="text-xs text-muted-foreground">
                {settings.impostorsCount} {settings.impostorsCount === 1 ? "impostor" : "impostores"}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleImpostorsChange(-1)}
              disabled={settings.impostorsCount <= 1}
              className="h-8 w-8"
            >
              −
            </Button>
            <span className="text-sm font-medium w-6 text-center">{settings.impostorsCount}</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleImpostorsChange(1)}
              disabled={settings.impostorsCount >= 2}
              className="h-8 w-8"
            >
              +
            </Button>
          </div>
        </div>

        {/* Pista para impostores */}
        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-2xl">💡</span>
            <div className="text-sm font-medium text-zinc-50">Pista para impostores</div>
          </div>
          <RadioGroup
            value={settings.hintMode}
            onValueChange={handleHintModeChange}
            className="space-y-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="hint-none" />
              <label
                htmlFor="hint-none"
                className="text-sm text-zinc-50 cursor-pointer flex-1"
              >
                Sin pistas
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="easy_similar" id="hint-easy" />
              <label
                htmlFor="hint-easy"
                className="text-sm text-zinc-50 cursor-pointer flex-1"
              >
                Pista fácil: palabra similar
              </label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="hard_category" id="hint-hard" />
              <label
                htmlFor="hint-hard"
                className="text-sm text-zinc-50 cursor-pointer flex-1"
              >
                Pista difícil: solo categoría
              </label>
            </div>
          </RadioGroup>
        </div>

        {/* Categorías */}
        <Link href="/game/categories">
          <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex justify-between items-center cursor-pointer hover:bg-white/[0.07] transition-colors">
            <div className="flex items-center gap-3">
              <span className="text-2xl">📚</span>
              <div>
                <div className="text-sm font-medium text-zinc-50">Categorías</div>
                <div className="text-xs text-muted-foreground">
                  {settings.categoryIds.length}{" "}
                  {settings.categoryIds.length === 1 ? "categoría" : "categorías"} seleccionada
                  {settings.categoryIds.length !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
            <span className="text-muted-foreground">›</span>
          </div>
        </Link>

        {/* Duración */}
        <div className="bg-white/5 border border-white/10 rounded-2xl px-5 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⏱️</span>
            <div>
              <div className="text-sm font-medium text-zinc-50">Duración</div>
              <div className="text-xs text-muted-foreground">{roundMinutes} minutos</div>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed bottom button */}
      <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black/40 backdrop-blur-xl border-t border-white/10 px-4 pt-4 pb-6">
        <Button
          onClick={handleStart}
          variant="primaryGlow"
          size="premium"
          className="w-full"
        >
          Iniciar juego
        </Button>
      </div>
    </div>
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
              <div className="mx-auto mb-3 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] overflow-hidden">
                {currentPlayer?.avatar ? (
                  <Image
                    src={currentPlayer.avatar}
                    alt={currentPlayer.name ?? "Avatar"}
                    width={96}
                    height={96}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <span className="text-4xl">
                    {currentPlayer?.name ? getAvatarEmoji(currentPlayer.name) : "👤"}
                  </span>
                )}
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
            className="absolute inset-0 overflow-hidden flex flex-col items-center justify-center text-center cursor-grab active:cursor-grabbing"
          >
            {/* Avatar como imagen de fondo full-bleed */}
            <div className="absolute inset-0">
              {currentPlayer?.avatar ? (
                <Image
                  src={currentPlayer.avatar}
                  alt={currentPlayer.name ?? "Avatar"}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-primary/30 via-primary/20 to-primary/10">
                  <span className="text-9xl">
                    {currentPlayer?.name ? getAvatarEmoji(currentPlayer.name) : "👤"}
                  </span>
                </div>
              )}
            </div>
            
            {/* Overlay oscuro para legibilidad */}
            <div className="absolute inset-0 bg-black/45" />
            
            {/* Contenido de texto encima */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-6 p-8">
              <div className="space-y-4">
                <p className="text-2xl font-bold text-white drop-shadow-lg">
                  {currentPlayer?.name}
                </p>
                <div className="space-y-3">
                  <p className="text-sm text-white/90 drop-shadow-md">
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
                        "text-3xl drop-shadow-lg",
                        isImpostor
                          ? "text-[hsl(var(--impostor))]"
                          : "text-[hsl(var(--crew))]"
                      )}
                    >
                      ↑
                    </motion.div>
                  </div>
                </div>
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
  const resetRound = useGameStore((state) => state.resetRound)
  const resetAll = useGameStore((state) => state.resetAll)

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
          <Button onClick={resetAll} variant="outline" className="flex-1">
            Nueva partida
          </Button>
          <Button onClick={resetRound} className="flex-1">
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
    <div className="flex min-h-screen items-center justify-center">
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
