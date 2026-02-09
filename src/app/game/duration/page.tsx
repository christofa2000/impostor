"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useGameStore } from "@/features/game/store/useGameStore"
import { Button } from "@/components/ui/button"
import { PremiumCard } from "@/components/ui/premium-card"
import { cn } from "@/lib/utils"

const WINNING_SCORE_OPTIONS = [5, 10, 15, 20] as const

export default function DurationPage() {
  const router = useRouter()
  const roundSeconds = useGameStore((state) => state.settings.roundSeconds)
  const winningScore = useGameStore((state) => state.settings.winningScore)
  const setRoundMinutes = useGameStore((state) => state.setRoundMinutes)
  const setSettings = useGameStore((state) => state.setSettings)

  const currentMinutes = Math.floor(roundSeconds / 60)

  const handleSave = () => {
    router.push("/game")
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Link href="/game">
            <Button variant="ghost" size="icon" className="h-10 w-10">
              <span className="text-xl">×</span>
            </Button>
          </Link>
          <h1 className="text-xl font-semibold text-zinc-50">Duración</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col gap-6 pb-28">
          <PremiumCard className="w-full">
            <div className="space-y-4">
              <label className="text-sm font-medium text-zinc-50">
                Selecciona la duración de la ronda
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                {[1, 2, 3, 4, 5, 6, 7].map((minutes) => {
                  const isSelected = currentMinutes === minutes

                  return (
                    <button
                      key={minutes}
                      type="button"
                      onClick={() => setRoundMinutes(minutes)}
                      className={cn(
                        "relative rounded-2xl p-4 border bg-white/5 transition-all",
                        isSelected
                          ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent border-emerald-400/50"
                          : "border-white/10 hover:bg-white/[0.07]",
                        "hover:scale-[1.02] active:scale-[0.98]"
                      )}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl font-bold text-zinc-50">
                          {minutes}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {minutes === 1 ? "minuto" : "minutos"}
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-emerald-400 rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                          <span className="text-white text-[10px] leading-none">✓</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2">
                Duración seleccionada: {currentMinutes}{" "}
                {currentMinutes === 1 ? "minuto" : "minutos"}
              </p>
            </div>
          </PremiumCard>

          <PremiumCard className="w-full">
            <div className="space-y-4">
              <label className="text-sm font-medium text-zinc-50">
                Puntaje para ganar
              </label>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {WINNING_SCORE_OPTIONS.map((score) => {
                  const isSelected = winningScore === score

                  return (
                    <button
                      key={score}
                      type="button"
                      onClick={() => setSettings({ winningScore: score })}
                      className={cn(
                        "relative rounded-2xl p-4 border bg-white/5 transition-all",
                        isSelected
                          ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent border-emerald-400/50"
                          : "border-white/10 hover:bg-white/[0.07]",
                        "hover:scale-[1.02] active:scale-[0.98]"
                      )}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-2xl font-bold text-zinc-50">
                          {score}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          puntos
                        </span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-emerald-400 rounded-full w-5 h-5 flex items-center justify-center shadow-lg">
                          <span className="text-white text-[10px] leading-none">✓</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <p className="text-xs text-muted-foreground text-center pt-2">
                Puntaje seleccionado: {winningScore} puntos
              </p>
            </div>
          </PremiumCard>
        </div>

        {/* Fixed bottom button */}
        <div className="fixed inset-x-0 bottom-0 z-50">
          {/* Overlay fade */}
          <div className="absolute inset-x-0 bottom-0 h-40 bg-[linear-gradient(to_top,rgba(0,0,0,0.85),rgba(0,0,0,0))] backdrop-blur-sm pointer-events-none z-0" />
          {/* Button wrapper */}
          <div className="relative z-10 px-4 pb-6 pt-10 max-w-md mx-auto">
            <Button
              onClick={handleSave}
              variant="primaryGlow"
              size="premium"
              className="w-full"
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}
