"use client";

import { Button } from "@/components/ui/button";
import { PremiumCard } from "@/components/ui/premium-card";
import Link from "next/link";

export default function RulesPage() {
  return (
    <div className="flex min-h-screen flex-col max-w-md mx-auto w-full px-4">
      <div className="flex items-center justify-between py-4 mb-2">
        <h1 className="text-xl font-semibold text-zinc-50">Reglamento</h1>
        <div className="w-10" />
      </div>

      <div className="flex flex-1 flex-col gap-6 pb-28">
        <PremiumCard>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3">
            ¿Cómo se juega?
          </h2>

          <ul className="space-y-3 text-sm text-zinc-300 list-disc list-inside">
            <li>
              <strong className="text-zinc-50">Armar la partida:</strong> Agregá
              jugadores, elegí categorías, poné duración y la{" "}
              <strong className="text-zinc-50">meta</strong> de puntos para
              ganar.
            </li>

            <li>
              <strong className="text-zinc-50">Revelar (uno por uno):</strong>{" "}
              Pasen el celu. Cada jugador ve su rol en privado:{" "}
              <strong className="text-zinc-50">Tripulante</strong> (ve la
              palabra) o{" "}
              <strong className="text-[hsl(var(--impostor))]">Impostor</strong>{" "}
              (recibe pista según el modo).
            </li>

            <li>
              <strong className="text-zinc-50">Charla y chamuyo:</strong>{" "}
              Arranca la discusión. Den pistas sin regalar la palabra. El
              impostor mete verso para pasar desapercibido.
            </li>

            <li>
              <strong className="text-zinc-50">Votación:</strong> Entre todos
              elijan a quién rajan. Si votan mal (o pasan): ojo, porque el
              impostor se lleva la ronda.
            </li>

            <li>
              <strong className="text-zinc-50">Resultado y puntajes:</strong> Se
              revela quién era el impostor, la palabra, y van a la tabla de
              puntajes para seguir con otra ronda o cortar.
            </li>
          </ul>

          <p className="mt-4 text-xs text-zinc-400">
            Tip argento: no tires la palabra textual. Tirás pista, mirás a todos
            y decís “¿me entendés?” 😄
          </p>
        </PremiumCard>

        <PremiumCard>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3">
            Puntajes por ronda
          </h2>

          <ul className="space-y-2 text-sm text-zinc-300 list-disc list-inside">
            <li>
              Si gana la{" "}
              <strong className="text-emerald-400">tripulación</strong>:{" "}
              <strong className="text-zinc-50">+1</strong> para todos excepto el
              impostor.
            </li>

            <li>
              Si gana el{" "}
              <strong className="text-[hsl(var(--impostor))]">impostor</strong>:{" "}
              <strong className="text-zinc-50">+2</strong> para el impostor.
            </li>

            <li>
              La partida termina cuando alguien llega a la{" "}
              <strong className="text-zinc-50">meta</strong> (configurada en
              “Duración y Meta”).
            </li>
          </ul>
        </PremiumCard>

        <PremiumCard>
          <h2 className="text-sm font-semibold text-zinc-400 mb-3">
            ¿Cómo gana el impostor?
          </h2>

          <ul className="space-y-2 text-sm text-zinc-300 list-disc list-inside">
            <li>
              Si <strong className="text-zinc-50">no lo votan</strong> (votan a
              otro o “pasan”): gana el impostor.
            </li>

            <li>
              Si{" "}
              <strong className="text-zinc-50">
                adivina la palabra secreta
              </strong>
              : gana al toque por “adivinanza” y se termina la ronda.
            </li>

            <li>
              Si lo votan correctamente: gana la tripulación (lo sacaron a
              pasear).
            </li>
          </ul>

          <p className="mt-4 text-xs text-zinc-400">
            Consejo: el impostor tiene que hablar lo justo. Si habla de más, “es
            él, es él”.
          </p>
        </PremiumCard>

        <Link href="/game" className="block">
          <Button variant="primaryGlow" size="premium" className="w-full">
            Volver
          </Button>
        </Link>
      </div>
    </div>
  );
}
