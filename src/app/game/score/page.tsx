"use client"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { useGameStore } from "@/features/game/store/useGameStore"
import type { RoundEndReason } from "@/features/game/models/last-round-result"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PremiumCard } from "@/components/ui/premium-card"
import { cn } from "@/lib/utils"
import { toast } from "sonner"

function getReasonLabel(reason: RoundEndReason, impostorGuessedWord?: boolean): string {
  if (impostorGuessedWord) return "Impostor adivinó la palabra"
  switch (reason) {
    case "voted_out":
      return "Votación"
    case "skip":
      return "Skip"
    case "not_voted":
      return "Sin voto"
    default:
      return reason
  }
}

export default function ScorePage() {
  const router = useRouter()
  const players = useGameStore((state) => state.players)
  const lastRoundResult = useGameStore((state) => state.lastRoundResult)
  const roundNumber = useGameStore((state) => state.roundNumber)
  const gameOver = useGameStore((state) => state.gameOver)
  const winnerPlayerIds = useGameStore((state) => state.winnerPlayerIds)
  const nextRound = useGameStore((state) => state.nextRound)
  const rematch = useGameStore((state) => state.rematch)
  const newGame = useGameStore((state) => state.newGame)

  const hasResult = lastRoundResult !== null
  const hasPlayers = players.length > 0
  const canShow = hasResult && hasPlayers
  const sortedPlayers = [...players].sort((a, b) => b.score - a.score)

  useEffect(() => {
    if (!hasResult || !hasPlayers) router.replace("/game")
  }, [hasResult, hasPlayers])

  const handleContinuar = () => {
    const error = nextRound()
    if (error) {
      toast.error(error)
      return
    }
    router.push("/game")
  }

  const handleRevancha = () => {
    const error = rematch()
    if (error) {
      toast.error(error)
      return
    }
    router.push("/game")
  }

  const handleNuevaPartida = () => {
    newGame()
    router.push("/")
  }

  if (!canShow) return null

  const winnerPlayers = players.filter((p) => winnerPlayerIds.includes(p.id))

  const winnerLabel =
    lastRoundResult!.winner === "crew"
      ? "Tripulación"
      : lastRoundResult!.winner === "impostor"
        ? "Impostor"
        : ""
  const reasonLabel = getReasonLabel(
    lastRoundResult!.reason,
    lastRoundResult!.impostorGuessedWord
  )

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mb-6 flex items-center justify-between">
        <Link href="/game">
          <Button variant="ghost" size="icon" className="h-10 w-10">
            <span className="text-xl">×</span>
          </Button>
        </Link>
        <h1 className="text-xl font-semibold text-zinc-50">Puntajes</h1>
        {roundNumber > 0 ? (
          <span className="text-sm text-zinc-400">Ronda {roundNumber}</span>
        ) : (
          <div className="w-10" />
        )}
      </div>

      <div className="flex flex-1 flex-col gap-6 pb-28">
        {gameOver && winnerPlayers.length > 0 && (
          <Card className="w-full border-amber-400/30 bg-amber-500/10 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.3)]">
            <CardHeader>
              <CardTitle className="text-amber-400">🏆 Ganador/es</CardTitle>
              <CardDescription className="text-zinc-400">
                Alcanzaron el puntaje para ganar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {winnerPlayers.map((player) => (
                  <li
                    key={player.id}
                    className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-2"
                  >
                    {player.avatar ? (
                      <Image
                        src={player.avatar}
                        alt={player.name}
                        width={32}
                        height={32}
                        className="rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-zinc-400">
                        {player.name.charAt(0).toUpperCase() || "?"}
                      </span>
                    )}
                    <span className="font-medium text-zinc-50">{player.name}</span>
                    <span className="ml-auto text-sm font-semibold tabular-nums text-amber-400">
                      {player.score} pts
                    </span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        <Card className="w-full border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_0_60px_rgba(0,0,0,0.3)]">
          <CardHeader>
            <CardTitle className="text-zinc-50">Resultado de la ronda</CardTitle>
            <CardDescription className="text-zinc-400">
              {reasonLabel}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p
              className={cn(
                "text-2xl font-bold",
                lastRoundResult!.winner === "crew"
                  ? "text-emerald-400"
                  : "text-amber-400"
              )}
            >
              {lastRoundResult!.winner === "crew" ? "🎉 " : "🕵️ "}
              {winnerLabel}
            </p>
          </CardContent>
        </Card>

        <PremiumCard>
          <h2 className="mb-4 text-sm font-medium text-zinc-400">
            Clasificación
          </h2>
          <ul className="space-y-3">
            {sortedPlayers.map((player, index) => (
              <li
                key={player.id}
                className="flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 px-4 py-3"
              >
                <span className="w-6 text-center text-sm font-semibold text-zinc-500">
                  {index + 1}°
                </span>
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-white/10 bg-white/10">
                  {player.avatar ? (
                    <Image
                      src={player.avatar}
                      alt={player.name}
                      width={40}
                      height={40}
                      className="object-cover"
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center text-lg font-bold text-zinc-400">
                      {player.name.charAt(0).toUpperCase() || "?"}
                    </span>
                  )}
                </div>
                <span className="min-w-0 flex-1 truncate font-medium text-zinc-50">
                  {player.name}
                </span>
                <span className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm font-semibold tabular-nums text-zinc-50">
                  {player.score}
                </span>
              </li>
            ))}
          </ul>
        </PremiumCard>

        <div className="flex flex-col gap-3">
          {!gameOver && (
            <Button
              variant="primaryGlow"
              size="premium"
              onClick={handleContinuar}
              className="w-full"
            >
              Continuar
            </Button>
          )}
          <Button
            variant={gameOver ? "primaryGlow" : "outline"}
            size={gameOver ? "premium" : "lg"}
            onClick={handleRevancha}
            className={cn(
              "w-full rounded-full",
              !gameOver && "border-white/20 bg-white/5 hover:bg-white/10"
            )}
          >
            Revancha
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleNuevaPartida}
            className="w-full rounded-full border-white/20 bg-white/5 hover:bg-white/10"
          >
            Nueva partida
          </Button>
        </div>
      </div>
    </div>
  )
}
