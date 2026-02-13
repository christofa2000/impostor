import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/lib/constants"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center shadow-none">
      <div className="flex w-full flex-col items-center gap-8 text-center shadow-none">
        <Image
          src="/impostor.png"
          alt="Detective"
          width={220}
          height={220}
          priority
          className="w-[220px] h-[220px] md:w-[280px] md:h-[280px] object-contain"
        />
        <h1 className="text-4xl font-bold text-zinc-50">
          {APP_NAME}
        </h1>
        <p className="text-lg text-zinc-400">
          Juego de deducción social. Pasa el teléfono y descubre quién es el
          impostor.
        </p>
        <Link href="/game">
          <Button variant="primaryGlow" size="premium">
            Crear partida
          </Button>
        </Link>
      </div>
    </div>
  )
}
