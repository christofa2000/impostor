import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { APP_NAME } from "@/lib/constants"

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 p-4 dark:bg-black">
      <main className="flex w-full max-w-md flex-col items-center gap-8 text-center">
        <Image
          src="/impostor.png"
          alt="Detective"
          width={220}
          height={220}
          priority
          className="w-[220px] h-[220px] md:w-[280px] md:h-[280px] object-contain"
        />
        <h1 className="text-4xl font-bold text-black dark:text-zinc-50">
          {APP_NAME}
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Juego de deducción social. Pasa el teléfono y descubre quién es el
          impostor.
        </p>
        <Link href="/game">
          <Button size="lg" className="w-full">
            Crear partida
          </Button>
        </Link>
      </main>
    </div>
  )
}
