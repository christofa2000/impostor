"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PremiumCard } from "@/components/ui/premium-card"

export default function RulesPage() {
  return (
    <div className="flex min-h-screen flex-col max-w-md mx-auto w-full px-4">
      <div className="flex items-center justify-between py-4 mb-2">
        <h1 className="text-xl font-semibold text-zinc-50">Reglamento</h1>
        <div className="w-10" />
      </div>

      <div className="flex flex-1 flex-col gap-6 pb-28">
        <PremiumCard>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3">Fases del juego</h2>
          <ul className="space-y-3 text-sm text-zinc-300 list-disc list-inside">
            <li>
              <strong className="text-zinc-50">Setup:</strong> Configurás jugadores, categorías, duración y puntaje para ganar.
            </li>
            <li>
              <strong className="text-zinc-50">Reveal:</strong> Cada jugador ve su rol en privado (tripulante o impostor) y, si aplica, la palabra secreta o la pista.
            </li>
            <li>
              <strong className="text-zinc-50">Play:</strong> Ronda de discusión con turnos y tiempo. El impostor puede intentar adivinar la palabra.
            </li>
            <li>
              <strong className="text-zinc-50">Vote:</strong> Todos votan a quién creen que es el impostor (o skip).
            </li>
            <li>
              <strong className="text-zinc-50">Result:</strong> Se revela el resultado, el impostor y la palabra. Luego podés ver puntajes y seguir con otra ronda o terminar.
            </li>
          </ul>
        </PremiumCard>

        <PremiumCard>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3">Puntajes por ronda</h2>
          <ul className="space-y-2 text-sm text-zinc-300 list-disc list-inside">
            <li>Si gana la <strong className="text-emerald-400">tripulación</strong>: +1 punto para todos excepto el impostor.</li>
            <li>Si gana el <strong className="text-[hsl(var(--impostor))]">impostor</strong>: +2 puntos para el impostor.</li>
            <li>La partida termina cuando alguien llega al puntaje para ganar (meta configurada en Duración y Meta).</li>
          </ul>
        </PremiumCard>

        <PremiumCard>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3">Cómo gana el impostor</h2>
          <ul className="space-y-2 text-sm text-zinc-300 list-disc list-inside">
            <li>Si <strong className="text-zinc-50">no lo votan</strong> (votan a otro o hacen skip): gana el impostor.</li>
            <li>Si <strong className="text-zinc-50">adivina la palabra secreta</strong> durante la ronda: gana el impostor y termina la ronda.</li>
            <li>Si lo votan correctamente: gana la tripulación.</li>
          </ul>
        </PremiumCard>

        <Link href="/game" className="block">
          <Button
            variant="primaryGlow"
            size="premium"
            className="w-full"
          >
            Volver
          </Button>
        </Link>
      </div>
    </div>
  )
}
