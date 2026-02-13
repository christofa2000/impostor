"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { GameSettings } from "@/features/game/models/settings";
import { useGameStore } from "@/features/game/store/useGameStore";
import { MIN_PLAYERS } from "@/lib/constants";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";
import { AnimatePresence, animate, motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Confetti from "react-confetti";
import { toast } from "sonner";
import { MessageCircle, User } from "lucide-react";

const HINT_MODE_OPTIONS: {
  value: GameSettings["hintMode"];
  label: string;
}[] = [
  { value: "none", label: "Sin pistas" },
  { value: "easy_similar", label: "Pista fácil: palabra similar" },
  { value: "hard_category", label: "Pista difícil: solo categoría" },
];

function getHintModeLabel(mode: GameSettings["hintMode"]): string {
  return HINT_MODE_OPTIONS.find((o) => o.value === mode)?.label ?? mode;
}

function SetupPhase() {
  const players = useGameStore((state) => state.players);
  const settings = useGameStore((state) => state.settings);
  const setSettings = useGameStore((state) => state.setSettings);
  const createGame = useGameStore((state) => state.createGame);
  const [hintDialogOpen, setHintDialogOpen] = useState(false);

  const handleStart = () => {
    if (players.length < MIN_PLAYERS) {
      toast.error(`Necesitas al menos ${MIN_PLAYERS} jugadores`);
      return;
    }

    const error = createGame();
    if (error) toast.error(error);
  };

  const handleImpostorsChange = (delta: number) => {
    const newCount = Math.max(1, Math.min(2, settings.impostorsCount + delta));
    setSettings({ impostorsCount: newCount });
  };

  const handleHintModeSelect = useCallback(
    (value: GameSettings["hintMode"]) => {
      setSettings({ hintMode: value });
      setHintDialogOpen(false);
    },
    [setSettings]
  );

  const roundMinutes = Math.floor(settings.roundSeconds / 60);
  const winningScore = settings.winningScore;
  const playersOk = players.length >= MIN_PLAYERS;
  const categoriesOk = settings.categoryIds.length >= 1;

  return (
    <div className="min-h-[100dvh] flex flex-col max-w-md mx-auto w-full px-3 py-4 sm:px-4">
      {/* Contenido principal: flex-1 + min-h-0 permite que esta zona escale y haga scroll si sobra contenido */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        {/* Hero image */}
        <div className="flex justify-center pt-2 pb-1 sm:pt-4 sm:pb-2">
          <Image
            src="/impostor.png"
            alt="Impostor"
            width={100}
            height={100}
            sizes="(max-width: 640px) 80px, 96px"
            className="h-auto w-20 sm:w-24"
            priority={false}
          />
        </div>

        {/* Header: nombre del juego */}
        <div className="flex flex-col items-center text-center py-2 pb-4 sm:py-3 sm:pb-5">
          <h1 className="text-2xl sm:text-3xl font-semibold uppercase tracking-widest bg-gradient-to-r from-blue-400 via-blue-500 to-cyan-400 bg-clip-text text-transparent drop-shadow-lg">
            Impostor
          </h1>
        </div>

        {/* Grid de tiles — mobile-first */}
        <div className="grid grid-cols-2 gap-3 auto-rows-fr min-h-0">
        {/* 1) Jugadores */}
        <Link href="/game/players" className="block h-full min-h-[160px]">
          <PremiumCard
            className={cn(
              "relative h-full flex flex-col items-center justify-between text-center py-3 sm:py-4",
              playersOk
                ? "border-2 border-blue-400/60 shadow-lg shadow-blue-500/20"
                : "border border-white/20"
            )}
          >
            {playersOk && (
              <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 shadow-md shadow-blue-500/50">
                <span className="text-white text-xs leading-none">✓</span>
              </div>
            )}
            <div className="flex flex-col items-center">
              <span className="text-4xl mb-2">👥</span>
              <span className="text-base font-semibold text-zinc-50">Jugadores</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  playersOk
                    ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-400/30"
                )}
              >
                {players.length} {players.length === 1 ? "jugador" : "jugadores"}
              </span>
              {!playersOk && (
                <span className="text-xs text-amber-400/90">Falta configurar</span>
              )}
            </div>
          </PremiumCard>
        </Link>

        {/* 2) Impostores */}
        <PremiumCard className="h-full flex flex-col items-center justify-between text-center min-h-[160px] py-3 sm:py-4 border border-white/10">
          <div className="flex flex-col items-center">
            <span className="text-4xl mb-1">🕵️</span>
            <span className="text-base font-semibold text-zinc-50">Impostores</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-bold tabular-nums text-zinc-50">
              {settings.impostorsCount}
            </span>
            <div className="mt-2 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-0.5">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleImpostorsChange(-1);
              }}
              disabled={settings.impostorsCount <= 1}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
              aria-label="Menos impostores"
            >
              −
            </button>
            <span className="min-w-5 text-center text-xs font-medium text-zinc-400">
              {settings.impostorsCount === 1 ? "impostor" : "impostores"}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                handleImpostorsChange(1);
              }}
              disabled={settings.impostorsCount >= 2}
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-medium text-zinc-400 transition-colors hover:bg-white/10 hover:text-zinc-50 disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-zinc-400"
              aria-label="Más impostores"
            >
              +
            </button>
          </div>
          </div>
        </PremiumCard>

        {/* 3) Categorías */}
        <Link href="/game/categories" className="block h-full min-h-[160px]">
          <PremiumCard
            className={cn(
              "relative h-full flex flex-col items-center justify-between text-center py-3 sm:py-4",
              categoriesOk
                ? "border-2 border-blue-400/60 shadow-lg shadow-blue-500/20"
                : "border border-white/20"
            )}
          >
            {categoriesOk && (
              <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 shadow-md shadow-blue-500/50">
                <span className="text-white text-xs leading-none">✓</span>
              </div>
            )}
            <div className="flex flex-col items-center">
              <span className="text-4xl mb-2">📚</span>
              <span className="text-base font-semibold text-zinc-50">Categorías</span>
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "rounded-full px-3 py-1 text-xs font-medium",
                  categoriesOk
                    ? "bg-blue-500/20 text-blue-400 border border-blue-400/30"
                    : "bg-amber-500/20 text-amber-400 border border-amber-400/30"
                )}
              >
                {settings.categoryIds.length}{" "}
                {settings.categoryIds.length === 1 ? "categoría" : "categorías"}
              </span>
              {!categoriesOk && (
                <span className="text-xs text-amber-400/90">Falta configurar</span>
              )}
            </div>
          </PremiumCard>
        </Link>

        {/* 4) Duración y Meta — siempre OK, mostrar valor */}
        <Link href="/game/duration" className="block h-full min-h-[160px]">
          <PremiumCard className="relative h-full flex flex-col items-center justify-between text-center py-3 sm:py-4 border-2 border-blue-400/60 shadow-lg shadow-blue-500/20">
            <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-blue-500 shadow-md shadow-blue-500/50">
              <span className="text-white text-xs leading-none">✓</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-4xl mb-2">⏱️</span>
              <span className="text-base font-semibold text-zinc-50">Duración y Meta</span>
            </div>
            <span className="rounded-full bg-blue-500/20 text-blue-400 border border-blue-400/30 px-3 py-1 text-xs font-medium">
              {roundMinutes} min · {winningScore} pts
            </span>
          </PremiumCard>
        </Link>

        {/* 5) Reglamento */}
        <Link href="/game/rules" className="block h-full min-h-[160px]">
          <PremiumCard className="relative h-full flex flex-col items-center justify-between text-center py-3 sm:py-4 border border-white/10">
            <div className="flex flex-col items-center">
              <span className="text-3xl mb-1.5">📋</span>
              <span className="text-base font-semibold text-zinc-50">Reglamento</span>
            </div>
            <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-zinc-400">
              Cómo se juega
            </span>
          </PremiumCard>
        </Link>

        {/* 6) Pistas para impostores */}
        <PremiumCard
          role="button"
          tabIndex={0}
          onClick={() => setHintDialogOpen(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setHintDialogOpen(true);
            }
          }}
          className="relative h-full flex flex-col items-center justify-between text-center min-h-[160px] py-3 sm:py-4 border border-white/10 cursor-pointer"
          aria-label="Configurar pista para impostores"
        >
          <div className="flex flex-col items-center">
            <span className="text-3xl mb-1.5">💡</span>
            <span className="text-sm font-semibold text-zinc-50 leading-tight px-1">Pistas impostores</span>
          </div>
          <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-zinc-400">
            {getHintModeLabel(settings.hintMode)}
          </span>
        </PremiumCard>
        </div>
      </div>

      {/* Dialog: elegir modo de pista */}
      <Dialog open={hintDialogOpen} onOpenChange={setHintDialogOpen}>
        <DialogContent className="max-w-md border-white/10 bg-zinc-900/95">
          <DialogHeader>
            <DialogTitle className="text-zinc-50">Pista para impostores</DialogTitle>
          </DialogHeader>
          <div className="grid gap-2 py-2">
            {HINT_MODE_OPTIONS.map((option) => {
              const isSelected = settings.hintMode === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleHintModeSelect(option.value)}
                  className={cn(
                    "flex items-center justify-between rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors",
                    isSelected
                      ? "border-blue-400/50 bg-blue-500/15 text-blue-400"
                      : "border-white/10 bg-white/5 text-zinc-50 hover:bg-white/10"
                  )}
                  aria-pressed={isSelected}
                  aria-label={option.label}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <span className="text-blue-400" aria-hidden>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Contenedor del botón al final del layout: flex-shrink-0 + safe-area en móviles */}
      <div className="flex-shrink-0 w-full px-6 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))]">
        <div className="flex justify-center">
          <Button
            onClick={handleStart}
            variant="primaryGlow"
            size="premium"
            className="w-full h-12 sm:h-14 min-h-[44px]"
          >
            Iniciar juego
          </Button>
        </div>
      </div>
    </div>
  );
}

function RevealPhase() {
  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const secretWord = useGameStore((state) => state.secretWord);
  const impostorIds = useGameStore((state) => state.impostorIds);
  const impostorHintWord = useGameStore((state) => state.impostorHintWord);
  const impostorHintCategoryName = useGameStore(
    (state) => state.impostorHintCategoryName,
  );
  const settings = useGameStore((state) => state.settings);
  const revealNext = useGameStore((state) => state.revealNext);

  const [hasSeen, setHasSeen] = useState(false);
  const coverY = useMotionValue(0);
  const peekTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const revealOpacity = useTransform(coverY, [0, -80, -220], [0, 0.6, 1]);
  const revealScale = useTransform(coverY, [0, -220], [0.98, 1]);
  const frontOpacity = useTransform(coverY, [0, -220], [1, 0.92]);

  useEffect(() => {
    setHasSeen(false);
    coverY.set(0);

    if (peekTimeoutRef.current) {
      clearTimeout(peekTimeoutRef.current);
      peekTimeoutRef.current = null;
    }

    return () => {
      if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);
    };
  }, [phase.type === "reveal" ? phase.currentPlayerId : null, coverY]);

  if (phase.type !== "reveal") return null;

  const currentPlayer = useMemo(
    () => players.find((p) => p.id === phase.currentPlayerId),
    [players, phase.currentPlayerId],
  );

  const isImpostor =
    currentPlayer != null && impostorIds.includes(currentPlayer.id);
  const remainingCount = phase.remainingPlayerIds.length;

  const getAvatarEmoji = (name: string): string => {
    const emojis = ["👤", "🎮", "🎯", "🎲", "🎪", "🎨", "🎭", "🎬", "🎧", "🎸"];
    const index = name.charCodeAt(0) % emojis.length;
    return emojis[index] ?? "👤";
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: { offset: { y: number } },
  ) => {
    const springConfig = {
      type: "spring" as const,
      stiffness: 250,
      damping: 25,
    };

    if (info.offset.y <= -120) {
      setHasSeen(true);

      if (peekTimeoutRef.current) clearTimeout(peekTimeoutRef.current);

      animate(coverY, -220, springConfig).then(() => {
        peekTimeoutRef.current = setTimeout(() => {
          animate(coverY, 0, springConfig);
          peekTimeoutRef.current = null;
        }, 500);
      });
    } else {
      animate(coverY, 0, springConfig);
    }
  };

  const handleNextPlayer = () => {
    if (peekTimeoutRef.current) {
      clearTimeout(peekTimeoutRef.current);
      peekTimeoutRef.current = null;
    }

    setHasSeen(false);
    coverY.set(0);
    revealNext();
  };

  return (
    <div className="w-full max-w-md relative overflow-hidden rounded-2xl border border-white/20 bg-card/70 backdrop-blur-xl p-6 transition-colors hover:border-primary/40">
      <div className="space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-semibold">
            Turno de {currentPlayer?.name}
          </h2>
          <p className="text-sm text-muted-foreground">
            {remainingCount > 0
              ? `Quedan ${remainingCount} jugador${remainingCount > 1 ? "es" : ""} por ver`
              : "Último jugador"}
          </p>
        </div>

        <div className="relative h-[360px] overflow-hidden rounded-lg border bg-card/50 backdrop-blur-md">
          <div
            className={cn(
              "pointer-events-none absolute inset-0 opacity-100",
              isImpostor
                ? "bg-[radial-gradient(circle_at_top,_hsl(var(--impostor)/0.22),_transparent_60%)]"
                : "bg-[radial-gradient(circle_at_top,_hsl(var(--crew)/0.20),_transparent_60%)]",
            )}
          />

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
                    {currentPlayer?.name
                      ? getAvatarEmoji(currentPlayer.name)
                      : "👤"}
                  </span>
                )}
              </div>
              <p className="text-3xl font-bold text-zinc-50">{currentPlayer?.name}</p>
            </div>

            <div className="space-y-4">
              {isImpostor ? (
                <p className="text-red-500 font-bold uppercase tracking-wide text-3xl drop-shadow-[0_0_12px_rgba(255,0,0,0.6)]">
                  Impostor
                </p>
              ) : null}

              {isImpostor ? (
                <div className="space-y-3">
                  <p className="text-lg font-semibold">
                    {impostorIds.length > 1
                      ? "SOS UNO DE LOS IMPOSTORES"
                      : "SOS EL IMPOSTOR"}
                  </p>

                  {settings.hintMode === "easy_similar" && impostorHintWord && (
                    <div className="mt-3 rounded-lg bg-muted/50 p-3">
                      <p className="text-sm text-muted-foreground mb-1">
                        Tu pista:
                      </p>
                      <p className="text-xl font-semibold">
                        {impostorHintWord}
                      </p>
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
                    {currentPlayer?.name
                      ? getAvatarEmoji(currentPlayer.name)
                      : "👤"}
                  </span>
                </div>
              )}
            </div>

            <div className="absolute inset-0 bg-black/45" />

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
                          : "text-[hsl(var(--crew))]",
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

        {hasSeen && (
          <Button
            onClick={handleNextPlayer}
            variant="default"
            className="w-full h-12 rounded-xl font-semibold transition-all active:scale-[0.98]"
          >
            Jugador siguiente
          </Button>
        )}
      </div>
    </div>
  );
}

/** Sonido corto "tick" con Web Audio API. */
function playTickSound() {
  if (typeof window === "undefined") return
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 880
    osc.type = "sine"
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.08)
  } catch {
    // ignore if audio not allowed
  }
}

/** Tick sutil (volumen bajo) para countdown "Expuesto". */
function playTickSoundSubtle() {
  if (typeof window === "undefined") return
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 660
    osc.type = "sine"
    gain.gain.setValueAtTime(0.06, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.06)
  } catch {
    // ignore if audio not allowed
  }
}

/** Sonido de aplausos (archivo o generado con Web Audio API). */
function playApplause() {
  if (typeof window === "undefined") return
  try {
    const audio = new Audio("/sounds/applause.mp3")
    audio.volume = 0.5
    audio.play().catch(() => playApplauseGenerated())
  } catch {
    playApplauseGenerated()
  }
}

function playApplauseGenerated() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const duration = 1.8
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate
      const envelope = Math.exp(-t * 2) * (0.3 + 0.7 * Math.max(0, 1 - t / 0.4))
      data[i] = (Math.random() * 2 - 1) * envelope
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start()
  } catch {
    // ignore
  }
}

/** Sonido de vidrio rompiéndose (archivo o generado). */
function playGlassBreak() {
  if (typeof window === "undefined") return
  try {
    const audio = new Audio("/sounds/glass-break.mp3")
    audio.volume = 0.6
    audio.play().catch(() => playGlassBreakGenerated())
  } catch {
    playGlassBreakGenerated()
  }
}

function playGlassBreakGenerated() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    const duration = 0.4
    const bufferSize = ctx.sampleRate * duration
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate)
    const data = buffer.getChannelData(0)
    for (let i = 0; i < bufferSize; i++) {
      const t = i / ctx.sampleRate
      const envelope = Math.exp(-t * 12)
      data[i] = (Math.random() * 2 - 1) * envelope
    }
    const source = ctx.createBufferSource()
    source.buffer = buffer
    source.connect(ctx.destination)
    source.start()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.connect(gain)
    gain.connect(ctx.destination)
    osc.frequency.value = 2800
    osc.type = "sine"
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15)
    osc.start(ctx.currentTime)
    osc.stop(ctx.currentTime + 0.15)
  } catch {
    // ignore
  }
}

function CountdownScreen() {
  const phase = useGameStore((state) => state.phase)
  const players = useGameStore((state) => state.players)
  const firstPlayerIdForRound = useGameStore((state) => state.firstPlayerIdForRound)
  const advanceToDebate = useGameStore((state) => state.advanceToDebate)

  const [count, setCount] = useState(3)
  const hasPlayedTick = useRef(false)

  const firstPlayer = useMemo(() => {
    if (phase.type !== "play") return null
    return players.find((p) => p.id === firstPlayerIdForRound)
  }, [phase, players, firstPlayerIdForRound])

  useEffect(() => {
    if (phase.type !== "play" || phase.playSubPhase !== "countdown") return
    setCount(3)
    hasPlayedTick.current = false
  }, [phase])

  useEffect(() => {
    if (phase.type !== "play" || phase.playSubPhase !== "countdown") return
    if (count <= 0) {
      advanceToDebate()
      return
    }
    if (!hasPlayedTick.current) {
      hasPlayedTick.current = true
      playTickSound()
    }
    const t = setTimeout(() => {
      if (count - 1 <= 0) {
        advanceToDebate()
        return
      }
      playTickSound()
      setCount((c) => c - 1)
    }, 1000)
    return () => clearTimeout(t)
  }, [phase, count, advanceToDebate])

  if (phase.type !== "play" || phase.playSubPhase !== "countdown") return null

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center px-3 sm:px-4">
      <p
        className="text-base sm:text-lg font-semibold mb-2"
        style={{ color: "hsl(50 100% 60%)" }}
      >
        {firstPlayer?.name ?? "Jugador"} empieza.
      </p>
      <p className="text-lg sm:text-xl font-bold text-white mb-6 sm:mb-8">¡Prepárate!</p>
      <motion.div
        key={count}
        initial={{ scale: 0.3, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 1.2, opacity: 0 }}
        transition={{
          type: "spring",
          stiffness: 400,
          damping: 15,
        }}
        className="text-8xl sm:text-9xl font-black tabular-nums text-white leading-none"
      >
        {count > 0 ? count : ""}
      </motion.div>
    </div>
  )
}

function DebateTimerScreen() {
  const phase = useGameStore((state) => state.phase)
  const settings = useGameStore((state) => state.settings)
  const startVote = useGameStore((state) => state.startVote)
  const roundSeconds = settings.roundSeconds

  const [secondsLeft, setSecondsLeft] = useState(roundSeconds)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (phase.type !== "play" || phase.playSubPhase !== "debate") return
    setSecondsLeft(roundSeconds)
    intervalRef.current = setInterval(() => {
      setSecondsLeft((s) => {
        if (s <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          startVote()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [phase, roundSeconds, startVote])

  const displayMinutes = Math.floor(secondsLeft / 60)
  const displaySeconds = secondsLeft % 60
  const displayTime = `${displayMinutes}:${displaySeconds.toString().padStart(2, "0")}`
  const progress = roundSeconds > 0 ? secondsLeft / roundSeconds : 0
  const circumference = 2 * Math.PI * 90
  const strokeDashoffset = circumference * (1 - progress)

  if (phase.type !== "play" || phase.playSubPhase !== "debate") return null

  return (
    <div className="flex flex-col items-center text-center px-3 sm:px-4 min-h-[70vh]">
      <div className="flex items-center justify-center gap-2 mb-2">
        <MessageCircle className="size-7 sm:size-8 text-white" strokeWidth={2} aria-hidden />
        <h1 className="text-2xl sm:text-3xl font-bold text-white">Debate</h1>
      </div>
      <p className="text-white/90 text-sm max-w-sm mb-6 sm:mb-8">
        Uno por uno, los jugadores dicen una palabra o frase relacionada con la palabra secreta.
      </p>

      <motion.div
        className="relative flex items-center justify-center w-56 h-56 sm:w-64 sm:h-64 mb-6"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 200 200"
          aria-hidden
        >
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="12"
          />
          <motion.circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="hsl(280 70% 75%)"
            strokeWidth="12"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          />
        </svg>
        <span className="text-4xl font-bold tabular-nums text-white">
          {displayTime}
        </span>
      </motion.div>

      <p className="text-white/90 text-sm mb-8">
        Pará el cronómetro cuando estén listos para votar.
      </p>

      <Button
        onClick={startVote}
        variant="primaryGlow"
        size="lg"
        className="w-full max-w-sm rounded-2xl py-6 text-lg font-semibold"
      >
        Votar
      </Button>
    </div>
  )
}

function PlayPhase() {
  const phase = useGameStore((state) => state.phase)

  if (phase.type !== "play") return null

  return (
    <>
      {phase.playSubPhase === "countdown" && <CountdownScreen />}
      {phase.playSubPhase === "debate" && <DebateTimerScreen />}
    </>
  )
}

function VotePhase() {
  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const settings = useGameStore((state) => state.settings);
  const selectVote = useGameStore((state) => state.selectVote);
  const confirmVote = useGameStore((state) => state.confirmVote);
  const impostorGuessWord = useGameStore((state) => state.impostorGuessWord);
  const [guessDialogOpen, setGuessDialogOpen] = useState(false);
  const [guessInput, setGuessInput] = useState("");

  if (phase.type !== "vote") return null;

  const maxVotes = settings.impostorsCount;
  const selectedVoteIds = phase.selectedVoteIds;

  const handleSelectVote = (playerId: string) => {
    const error = selectVote(playerId);
    if (error) toast.error(error);
  };

  const handleGuessConfirm = () => {
    const guess = guessInput.trim();
    if (!guess) return;
    const ok = impostorGuessWord(guess);
    if (ok) {
      setGuessDialogOpen(false);
      setGuessInput("");
    } else {
      toast.error("Incorrecto");
    }
  };

  return (
    <>
      <div className="w-full max-w-md min-h-[100dvh] flex flex-col px-3 sm:px-0">
        <div className="flex-1 flex flex-col min-h-0 overflow-y-auto items-center text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Votación</h1>
          <p className="text-white/90 text-sm mb-4 max-w-sm">
            {maxVotes > 1
              ? `Elegí hasta ${maxVotes} jugadores (máximo ${maxVotes} votos).`
              : "Discutí en grupo y decidí a quién quieren eliminar."}
          </p>
          {maxVotes > 1 && (
            <p className="text-sm font-medium text-white/80 mb-3">
              Seleccionados: {selectedVoteIds.length}/{maxVotes}
            </p>
          )}
          <h2 className="text-lg sm:text-xl font-bold text-white mb-4">
            ¿Quién creen que es el Impostor?
          </h2>

          <div className="grid grid-cols-2 gap-2.5 w-full mb-6">
            {players.map((player) => {
              const isSelected = selectedVoteIds.includes(player.id);
              const atLimit = selectedVoteIds.length >= maxVotes;
              const disabled = !isSelected && atLimit;
              return (
                <button
                  key={player.id}
                  type="button"
                  disabled={disabled}
                  onClick={() => handleSelectVote(player.id)}
                  className={cn(
                    "flex flex-col items-center justify-center rounded-xl border-2 py-4 px-3 transition-all active:scale-[0.98] min-h-[110px]",
                    "bg-card/90 border-white/20",
                    isSelected &&
                      "border-primary bg-primary/20",
                    disabled && !isSelected && "opacity-60 cursor-not-allowed"
                  )}
                  aria-pressed={isSelected}
                  aria-label={`Votar a ${player.name}`}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-white mb-2 shrink-0">
                    {player.avatar ? (
                      <Image
                        src={player.avatar}
                        alt=""
                        width={40}
                        height={40}
                        className="rounded-full object-cover size-10"
                      />
                    ) : (
                      <User className="size-5" aria-hidden />
                    )}
                  </div>
                  <span className="text-sm font-semibold text-white truncate w-full text-center">
                    {player.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col flex-shrink-0 w-full px-6 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] space-y-4">
          <Button
            onClick={() => {
              const err = confirmVote();
              if (err) toast.error(err);
            }}
            disabled={selectedVoteIds.length !== maxVotes}
            variant="primaryGlow"
            size="lg"
            className="w-full rounded-2xl py-5 sm:py-6 text-base sm:text-lg font-bold min-h-[48px]"
          >
            Confirmar voto
          </Button>
          <Button
            onClick={() => setGuessDialogOpen(true)}
            variant="outline"
            className="w-full rounded-2xl border-white/20 bg-white/5 text-white hover:bg-white/10 min-h-[48px]"
          >
            Adivinar palabra
          </Button>
        </div>
      </div>

      <Dialog
        open={guessDialogOpen}
        onOpenChange={(open) => {
          setGuessDialogOpen(open);
          if (!open) setGuessInput("");
        }}
      >
        <DialogContent className="max-w-md border-primary/30 bg-card backdrop-blur-xl">
          <DialogHeader>
            <DialogTitle className="text-white">Adivinar palabra</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <Input
              value={guessInput}
              onChange={(e) => setGuessInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleGuessConfirm();
              }}
              placeholder="Escribí la palabra"
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
              autoFocus
              aria-label="Palabra a adivinar"
            />
            <Button
              onClick={handleGuessConfirm}
              disabled={!guessInput.trim()}
              variant="accent"
              className="w-full rounded-2xl"
            >
              Confirmar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ResultCountdownScreen() {
  const phase = useGameStore((state) => state.phase)
  const advanceToResult = useGameStore((state) => state.advanceToResult)

  const [count, setCount] = useState(3)
  const hasPlayedTick = useRef(false)

  useEffect(() => {
    if (phase.type !== "result_countdown") return
    setCount(3)
    hasPlayedTick.current = false
  }, [phase.type])

  useEffect(() => {
    if (phase.type !== "result_countdown") return
    if (count <= 0) {
      const t = setTimeout(() => advanceToResult(), 500)
      return () => clearTimeout(t)
    }
    if (!hasPlayedTick.current) {
      hasPlayedTick.current = true
      playTickSoundSubtle()
    }
    const t = setTimeout(() => {
      if (count - 1 <= 0) {
        playTickSoundSubtle()
        setCount(0)
        return
      }
      playTickSoundSubtle()
      setCount((c) => c - 1)
    }, 1000)
    return () => clearTimeout(t)
  }, [phase.type, count, advanceToResult])

  if (phase.type !== "result_countdown") return null

  return (
    <div className="flex min-h-[75vh] flex-col items-center justify-center text-center px-4">
      <motion.div
        className="mb-8 text-6xl sm:text-7xl"
        animate={{ x: [-10, 10, -10] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden
      >
        👀
      </motion.div>
      <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2">
        Expuesto
      </h2>
      <p className="text-xl text-white/95 mb-6">
        en 3, 2, 1...
      </p>
      <AnimatePresence mode="wait">
        {count > 0 && (
          <motion.div
            key={count}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.2, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 18,
            }}
            className="text-[clamp(5rem,22vw,9rem)] font-black tabular-nums text-white leading-none"
          >
            {count}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/** Efecto visual de vidrio roto / impacto cuando gana el impostor. */
function GlassBreakEffect() {
  const cracks = useMemo(
    () =>
      Array.from({ length: 12 }, (_, i) => {
        const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.5
        const len = 0.4 + Math.random() * 0.5
        const x2 = 50 + Math.cos(angle) * len * 100
        const y2 = 50 + Math.sin(angle) * len * 100
        return {
          d: `M 50 50 L ${x2} ${y2}`,
          delay: i * 0.03,
        }
      }),
    []
  )

  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{
        opacity: [0, 0.9, 0.7],
        scale: [0.95, 1.02, 1],
      }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,hsl(10_100%_60%_/_0.25)_0%,transparent_60%)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      />
      <svg
        className="absolute inset-0 w-full h-full opacity-70"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {cracks.map((c, i) => (
          <motion.path
            key={i}
            d={c.d}
            fill="none"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="0.4"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{
              duration: 0.35,
              delay: c.delay,
              ease: "easeOut",
            }}
          />
        ))}
      </svg>
    </motion.div>
  )
}

function ResultPhase() {
  const router = useRouter();
  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const resetRound = useGameStore((state) => state.resetRound);
  const resetAll = useGameStore((state) => state.resetAll);

  const [showEffects, setShowEffects] = useState(true);
  const [windowSize, setWindowSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  }, []);

  useEffect(() => {
    if (phase.type !== "result") return;
    if (phase.winner === "crew") {
      playApplause();
    } else {
      playGlassBreak();
      if (typeof navigator !== "undefined" && navigator.vibrate) {
        navigator.vibrate([100, 50, 100]);
      }
    }
    const timer = setTimeout(() => setShowEffects(false), 4000);
    return () => clearTimeout(timer);
  }, [phase]);

  if (phase.type !== "result") return null;

  const impostors = players.filter((p) => phase.impostorIds.includes(p.id));
  const isCrewWin = phase.winner === "crew";

  const impostorNames =
    impostors.length === 1
      ? impostors[0]?.name ?? ""
      : impostors.map((p) => p.name).join(", ");

  return (
    <div className="relative w-full min-h-[100dvh] flex flex-col">
      {/* Efecto tripulación gana: confeti */}
      {showEffects && isCrewWin && windowSize.width > 0 && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          numberOfPieces={200}
          recycle={false}
          colors={["#00E5FF", "#00FF88", "#FFD700"]}
          initialVelocityY={20}
          gravity={0.3}
        />
      )}

      {/* Efecto impostor gana: vidrio roto + shake en el contenido */}
      {showEffects && !isCrewWin && <GlassBreakEffect />}

      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto">
        <motion.div
          className="w-full max-w-md flex flex-col items-center text-center px-3"
          animate={
            showEffects && !isCrewWin
              ? {
                  x: [0, -6, 6, -4, 4, -2, 2, 0],
                }
              : undefined
          }
          transition={{
            duration: 0.5,
            ease: "easeOut",
          }}
        >
          <div className="relative w-full max-w-[200px] mx-auto mb-4 flex justify-center">
            <Image
              src={isCrewWin ? "/justicia.png" : "/jocker.png"}
              alt=""
              width={160}
              height={160}
              className="object-contain w-full h-auto max-h-40"
              priority
              aria-hidden
            />
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {isCrewWin ? "¡Has pillado a un Impostor!" : "¡El Impostor gana!"}
          </h1>
          <p className="text-white/90 text-sm mb-6">
            {isCrewWin
              ? "¡Victoria! Ganan los Civiles."
              : "El Impostor se impuso. ¡A revancha!"}
          </p>

          <div className="w-full rounded-2xl bg-card/95 border border-white/10 overflow-hidden mb-6">
            <div className="px-4 py-3 border-b border-white/10">
              <p className="text-xs text-white/70">Palabra secreta</p>
              <p className="text-lg font-bold text-white mt-0.5">{phase.secretWord}</p>
            </div>
            <div className="px-4 py-3">
              <p className="text-xs text-white/70">Impostor{impostors.length > 1 ? "es" : ""}</p>
              <p className="text-lg font-bold text-white mt-0.5">{impostorNames}</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="flex flex-col flex-shrink-0 w-full px-6 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] space-y-4">
        <Button
          variant="accent"
          size="lg"
          className="w-full rounded-2xl py-5 sm:py-6 text-base sm:text-lg font-semibold min-h-[48px]"
          onClick={() => router.push("/game/score")}
        >
          Continuar
        </Button>
        <div className="flex gap-2 w-full">
          <Button
            onClick={resetAll}
            variant="outline"
            className="flex-1 rounded-2xl border-white/30 bg-white/10 text-white hover:bg-white/20"
          >
            Nueva partida
          </Button>
          <Button
            onClick={resetRound}
            variant="secondary"
            className="flex-1 rounded-2xl"
          >
            Revancha
          </Button>
        </div>
      </div>
    </div>
  );
}

function ScorePhase() {
  const router = useRouter();
  const players = useGameStore((state) => state.players);
  const lastRoundResult = useGameStore((state) => state.lastRoundResult);
  const roundNumber = useGameStore((state) => state.roundNumber);
  const nextRound = useGameStore((state) => state.nextRound);
  const resetAll = useGameStore((state) => state.resetAll);

  const sortedPlayers = [...players].sort((a, b) => b.score - a.score);
  const winnerLabel =
    lastRoundResult?.winner === "crew"
      ? "Tripulación"
      : lastRoundResult?.winner === "impostor"
        ? "Impostor"
        : null;

  const handleNextRound = () => {
    const error = nextRound();
    if (error) toast.error(error);
  };

  const handleFinishGame = () => {
    resetAll();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-zinc-50">Puntajes</h1>
        {roundNumber > 0 && (
          <span className="text-sm text-zinc-400">Ronda {roundNumber}</span>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between min-h-0">
        <div className="flex flex-col gap-6">
          {winnerLabel && (
            <PremiumCard className="text-center">
              <p className="text-sm text-zinc-400">Ganador de la ronda anterior</p>
              <p
                className={cn(
                  "text-2xl font-bold",
                  lastRoundResult?.winner === "crew"
                    ? "text-emerald-400"
                    : "text-amber-400"
                )}
              >
                {lastRoundResult?.winner === "crew" ? "🎉 " : "🕵️ "}
                {winnerLabel}
              </p>
            </PremiumCard>
          )}

          <PremiumCard>
            <h2 className="mb-4 text-sm font-medium text-zinc-400">
              Clasificación
            </h2>
            <ul className="space-y-3">
              {sortedPlayers.map((player, index) => (
                <li
                  key={player.id}
                  className="flex items-center gap-4 rounded-xl border border-primary/30 bg-gradient-to-br from-card to-card/50 px-4 py-3 transition-colors hover:border-primary/60"
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
        </div>

        <div className="flex flex-col flex-shrink-0 w-full px-6 pt-10 pb-[calc(2.5rem+env(safe-area-inset-bottom))] space-y-4 items-center">
          <Button
            variant="primaryGlow"
            size="premium"
            onClick={handleNextRound}
            className="w-full"
          >
            Siguiente ronda
          </Button>
          <Button
            variant="outline"
            size="lg"
            onClick={handleFinishGame}
            className="w-full rounded-full border-white/20 bg-white/5 hover:bg-white/10"
          >
            Finalizar partida
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function GamePage() {
  const phase = useGameStore((state) => state.phase);

  return (
    <div className="w-full">
      {phase.type === "setup" && <SetupPhase />}
      {phase.type === "reveal" && <RevealPhase />}
      {phase.type === "play" && <PlayPhase />}
      {phase.type === "vote" && <VotePhase />}
      {phase.type === "result_countdown" && <ResultCountdownScreen />}
      {phase.type === "result" && <ResultPhase />}
      {phase.type === "score" && <ScorePhase />}
    </div>
  );
}
