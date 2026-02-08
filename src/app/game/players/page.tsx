"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { nanoid } from "nanoid"
import { useRouter } from "next/navigation"
import { useGameStore } from "@/features/game/store/useGameStore"
import { AVATARS } from "@/data/avatars"
import { MIN_PLAYERS, MAX_PLAYERS } from "@/lib/constants"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { PremiumCard } from "@/components/ui/premium-card"
import { pickRandom } from "@/features/game/logic/random"
import type { Player } from "@/features/game/models/player"

export default function PlayersPage() {
  const router = useRouter()
  const storePlayers = useGameStore((state) => state.players)
  const setPlayers = useGameStore((state) => state.setPlayers)
  const setPlayerAvatar = useGameStore((state) => state.setPlayerAvatar)

  const [localPlayers, setLocalPlayers] = useState<Player[]>(
    storePlayers.length > 0
      ? storePlayers
      : [
          { id: nanoid(), name: "" },
          { id: nanoid(), name: "" },
          { id: nanoid(), name: "" },
        ]
  )
  const [avatarDialogOpen, setAvatarDialogOpen] = useState(false)
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null)

  const handlePlayerNameChange = (index: number, value: string) => {
    const newPlayers = [...localPlayers]
    newPlayers[index] = { ...newPlayers[index], name: value }
    setLocalPlayers(newPlayers)
  }

  const addPlayer = () => {
    if (localPlayers.length < MAX_PLAYERS) {
      setLocalPlayers([...localPlayers, { id: nanoid(), name: "" }])
    }
  }

  const removePlayer = (index: number) => {
    if (localPlayers.length > MIN_PLAYERS) {
      const newPlayers = localPlayers.filter((_, i) => i !== index)
      setLocalPlayers(newPlayers)
    }
  }

  const handleAvatarClick = (playerId: string) => {
    setSelectedPlayerId(playerId)
    setAvatarDialogOpen(true)
  }

  const handleAvatarSelect = (avatarSrc: string) => {
    if (!selectedPlayerId) return

    const newPlayers = localPlayers.map((player) => {
      if (player.id === selectedPlayerId) {
        return { ...player, avatar: avatarSrc }
      }
      return player
    })
    setLocalPlayers(newPlayers)
    setAvatarDialogOpen(false)
    setSelectedPlayerId(null)
  }

  const handleRandomAvatar = () => {
    if (!selectedPlayerId) return

    const usedAvatares = new Set(
      localPlayers
        .filter((p) => p.id !== selectedPlayerId && p.avatar)
        .map((p) => p.avatar as string)
    )
    const available = AVATARS.filter((avatar) => !usedAvatares.has(avatar))
    const randomAvatar =
      available.length > 0 ? pickRandom(available) : pickRandom(AVATARS)

    handleAvatarSelect(randomAvatar)
  }

  const handleSave = () => {
    const validPlayers: Player[] = localPlayers
      .map((player) => ({
        ...player,
        name: player.name.trim(),
      }))
      .filter((player) => player.name.length > 0)

    setPlayers(validPlayers)
    router.push("/game")
  }

  const selectedPlayer = localPlayers.find((p) => p.id === selectedPlayerId)

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
          <h1 className="text-xl font-semibold text-zinc-50">Jugadores</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 pb-28">
          <PremiumCard className="w-full">
            <div className="space-y-4">
              <div className="space-y-3">
                {localPlayers.map((player, index) => (
                  <div
                    key={player.id}
                    className="flex items-center justify-between bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  >
                    <Input
                      placeholder={`Jugador ${index + 1}`}
                      value={player.name}
                      onChange={(e) => handlePlayerNameChange(index, e.target.value)}
                      className="flex-1 bg-transparent border-0 shadow-none px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                    <div className="flex items-center gap-2 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAvatarClick(player.id)}
                        className="h-8 px-3 border border-white/10 hover:bg-white/10"
                      >
                        {player.avatar ? (
                          <Image
                            src={player.avatar}
                            alt="Avatar"
                            width={20}
                            height={20}
                            className="rounded-full object-cover"
                          />
                        ) : (
                          <span className="text-xs">Elegir</span>
                        )}
                      </Button>
                      {localPlayers.length > MIN_PLAYERS && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removePlayer(index)}
                          className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-white/10"
                        >
                          ×
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {localPlayers.length < MAX_PLAYERS && (
                <Button variant="outline" onClick={addPlayer} className="w-full">
                  + Agregar jugador
                </Button>
              )}
            </div>
          </PremiumCard>
        </div>

        {/* Fixed bottom button */}
        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-black/40 backdrop-blur-xl border-t border-white/10 px-4 pt-4 pb-6">
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

      {/* Avatar Dialog */}
      <Dialog open={avatarDialogOpen} onOpenChange={setAvatarDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Elegí un avatar</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {AVATARS.map((avatarSrc) => (
                <button
                  key={avatarSrc}
                  onClick={() => handleAvatarSelect(avatarSrc)}
                  className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                    selectedPlayer?.avatar === avatarSrc
                      ? "border-primary ring-2 ring-primary/20"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <Image
                    src={avatarSrc}
                    alt="Avatar"
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
            <Button
              variant="outline"
              onClick={handleRandomAvatar}
              className="w-full"
            >
              Random
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
