"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useGameStore } from "@/features/game/store/useGameStore"
import { GAME_CATEGORIES } from "@/data/game-categories"
import { Button } from "@/components/ui/button"
import { PremiumCard } from "@/components/ui/premium-card"
import { cn } from "@/lib/utils"

export default function CategoriesPage() {
  const router = useRouter()
  const categoryIds = useGameStore((state) => state.settings.categoryIds)
  const toggleCategory = useGameStore((state) => state.toggleCategory)
  const selectAllCategories = useGameStore((state) => state.selectAllCategories)
  const clearCategories = useGameStore((state) => state.clearCategories)

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
          <h1 className="text-xl font-semibold text-zinc-50">Categorías</h1>
          <div className="w-10" /> {/* Spacer for centering */}
        </div>

        {/* Content */}
        <div className="flex-1 pb-28">
          <PremiumCard className="w-full">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Selecciona categorías</label>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={selectAllCategories}
                    className="h-7 px-2 text-xs"
                  >
                    Todas
                  </Button>
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={clearCategories}
                    className="h-7 px-2 text-xs"
                  >
                    Limpiar
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {GAME_CATEGORIES.map((cat) => {
                  const isSelected = categoryIds.includes(cat.id)
                  const gradientMap: Record<string, string> = {
                    anime: "from-purple-600 to-indigo-700",
                    arg_futbol_78: "from-orange-500 to-amber-400",
                    technology: "from-fuchsia-600 to-pink-500",
                    food: "from-red-500 to-orange-500",
                    movies: "from-blue-500 to-purple-500",
                    objects: "from-gray-500 to-slate-600",
                    places: "from-green-500 to-emerald-500",
                    argentina_things: "from-blue-400 to-cyan-500",
                  }
                  const gradient = gradientMap[cat.id] || "from-gray-500 to-slate-600"

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => toggleCategory(cat.id)}
                      className={cn(
                        "relative rounded-2xl p-5 border shadow-lg transition-all",
                        `bg-gradient-to-br ${gradient}`,
                        isSelected
                          ? "ring-2 ring-emerald-400 ring-offset-2 ring-offset-transparent border-emerald-400/50"
                          : "border-white/10",
                        "hover:scale-[1.02] active:scale-[0.98]"
                      )}
                    >
                      <div className="flex flex-col items-center gap-2">
                        <span className="text-4xl">{cat.emoji}</span>
                        <span className="text-sm font-medium text-white">{cat.label}</span>
                      </div>
                      {isSelected && (
                        <div className="absolute top-2 right-2 bg-emerald-400 rounded-full w-6 h-6 flex items-center justify-center shadow-lg">
                          <span className="text-white text-xs leading-none">✓</span>
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              {categoryIds.length > 0 && (
                <p className="text-xs text-muted-foreground text-center">
                  {categoryIds.length} categoría{categoryIds.length !== 1 ? "s" : ""} seleccionada{categoryIds.length !== 1 ? "s" : ""}
                </p>
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
    </>
  )
}
