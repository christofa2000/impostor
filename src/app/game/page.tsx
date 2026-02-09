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
import type { GameSettings } from "@/features/game/models/settings";
import { useGameStore } from "@/features/game/store/useGameStore";
import { MIN_PLAYERS } from "@/lib/constants";
import { PremiumCard } from "@/components/ui/premium-card";
import { cn } from "@/lib/utils";
import { animate, motion, useMotionValue, useTransform } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

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
    <div className="flex min-h-screen flex-col max-w-md mx-auto w-full px-4">
      {/* Hero image */}
      <div className="flex justify-center pt-4 pb-2">
        <Image
          src="/impostor.png"
          alt="Impostor"
          width={120}
          height={120}
          sizes="(max-width: 640px) 96px, 120px"
          className="h-auto w-[96px] sm:w-[120px]"
          priority={false}
        />
      </div>

      {/* Header: nombre del juego */}
      <div className="flex flex-col items-center text-center py-3 pb-5">
        <h1
          className="text-3xl font-semibold uppercase tracking-widest bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent"
        >
          Impostor
        </h1>
      </div>

      {/* Grid of tiles */}
      <div className="grid grid-cols-2 gap-4 pb-28">
        {/* 1) Jugadores */}
        <Link href="/game/players" className="block">
          <PremiumCard
            className={cn(
              "relative flex flex-col items-center justify-center text-center min-h-[140px]",
              playersOk
                ? "ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-transparent border-emerald-400/30"
                : "border border-amber-400/30"
            )}
          >
            {playersOk && (
              <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/90 shadow-lg">
                <span className="text-white text-xs leading-none">✓</span>
              </div>
            )}
            <span className="text-4xl mb-2">👥</span>
            <span className="text-base font-semibold text-zinc-50">Jugadores</span>
            <span
              className={cn(
                "mt-2 rounded-full px-3 py-1 text-xs font-medium",
                playersOk ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              )}
            >
              {players.length} {players.length === 1 ? "jugador" : "jugadores"}
            </span>
            {!playersOk && (
              <span className="mt-1.5 text-xs text-amber-400/90">Falta configurar</span>
            )}
          </PremiumCard>
        </Link>

        {/* 2) Impostores */}
        <PremiumCard className="flex flex-col items-center justify-center text-center min-h-[140px] border border-white/10">
          <span className="text-4xl mb-1">🕵️</span>
          <span className="text-base font-semibold text-zinc-50">Impostores</span>
          <span className="mt-1 text-3xl font-bold tabular-nums text-zinc-50">
            {settings.impostorsCount}
          </span>
          <div className="mt-3 flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 p-0.5">
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
        </PremiumCard>

        {/* 3) Categorías */}
        <Link href="/game/categories" className="block">
          <PremiumCard
            className={cn(
              "relative flex flex-col items-center justify-center text-center min-h-[140px]",
              categoriesOk
                ? "ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-transparent border-emerald-400/30"
                : "border border-amber-400/30"
            )}
          >
            {categoriesOk && (
              <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/90 shadow-lg">
                <span className="text-white text-xs leading-none">✓</span>
              </div>
            )}
            <span className="text-4xl mb-2">📚</span>
            <span className="text-base font-semibold text-zinc-50">Categorías</span>
            <span
              className={cn(
                "mt-2 rounded-full px-3 py-1 text-xs font-medium",
                categoriesOk ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"
              )}
            >
              {settings.categoryIds.length}{" "}
              {settings.categoryIds.length === 1 ? "categoría" : "categorías"}
            </span>
            {!categoriesOk && (
              <span className="mt-1.5 text-xs text-amber-400/90">Falta configurar</span>
            )}
          </PremiumCard>
        </Link>

        {/* 4) Duración y Meta — siempre OK, mostrar valor */}
        <Link href="/game/duration" className="block">
          <PremiumCard className="relative flex flex-col items-center justify-center text-center min-h-[140px] ring-2 ring-emerald-400/60 ring-offset-2 ring-offset-transparent border-emerald-400/30">
            <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/90 shadow-lg">
              <span className="text-white text-xs leading-none">✓</span>
            </div>
            <span className="text-4xl mb-2">⏱️</span>
            <span className="text-base font-semibold text-zinc-50">Duración y Meta</span>
            <span className="mt-2 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-400">
              {roundMinutes} min · {winningScore} pts
            </span>
          </PremiumCard>
        </Link>

        {/* 5) Reglamento */}
        <Link href="/game/rules" className="block">
          <PremiumCard className="relative flex flex-col items-center justify-center text-center min-h-[140px] border border-white/10">
            <span className="text-3xl mb-1.5">📋</span>
            <span className="text-base font-semibold text-zinc-50">Reglamento</span>
            <span className="mt-2 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-zinc-400">
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
          className="relative flex flex-col items-center justify-center text-center min-h-[140px] border border-white/10 cursor-pointer"
          aria-label="Configurar pista para impostores"
        >
          <span className="text-3xl mb-1.5">💡</span>
          <span className="text-sm font-semibold text-zinc-50 leading-tight px-1">Pistas impostores</span>
          <span className="mt-2 rounded-full bg-white/10 px-2.5 py-1 text-xs font-medium text-zinc-400">
            {getHintModeLabel(settings.hintMode)}
          </span>
        </PremiumCard>
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
                      ? "border-emerald-400/50 bg-emerald-500/15 text-emerald-400"
                      : "border-white/10 bg-white/5 text-zinc-50 hover:bg-white/10"
                  )}
                  aria-pressed={isSelected}
                  aria-label={option.label}
                >
                  <span>{option.label}</span>
                  {isSelected && (
                    <span className="text-emerald-400" aria-hidden>✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Fixed bottom CTA */}
      <div className="fixed inset-x-0 bottom-0 z-50 max-w-md mx-auto w-full left-0 right-0">
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92),rgba(0,0,0,0))]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(255,255,255,0.06),rgba(255,255,255,0))]" />
        </div>
        <div className="relative z-10 px-4 pb-6 pt-10">
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
    </div>
  );
}

function RevealPhase() {
  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const secretWord = useGameStore((state) => state.secretWord);
  const impostorId = useGameStore((state) => state.impostorId);
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

  const isImpostor = currentPlayer?.id === impostorId;
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
    <div className="w-full max-w-md relative overflow-hidden rounded-2xl border border-border/40 bg-card/70 backdrop-blur-xl shadow-xl p-6 transition-colors hover:border-primary/40">
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
              <p className="text-lg font-semibold">{currentPlayer?.name}</p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                <div
                  className={cn(
                    "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide border",
                    isImpostor
                      ? "border-[hsl(var(--impostor)/0.45)] bg-[hsl(var(--impostor)/0.12)] text-[hsl(var(--impostor))]"
                      : "border-[hsl(var(--crew)/0.45)] bg-[hsl(var(--crew)/0.12)] text-[hsl(var(--crew))]",
                  )}
                >
                  <span
                    className={cn(
                      "h-2 w-2 rounded-full animate-pulse",
                      isImpostor
                        ? "bg-[hsl(var(--impostor))]"
                        : "bg-[hsl(var(--crew))]",
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
                      : "text-[hsl(var(--crew))]",
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
            className={cn(
              "w-full h-12 rounded-xl font-semibold transition-all active:scale-[0.98]",
              isImpostor
                ? "shadow-[0_0_0_1px_hsl(var(--impostor)/0.45),0_12px_40px_-18px_hsl(var(--impostor)/0.55)]"
                : "shadow-[0_0_0_1px_hsl(var(--crew)/0.45),0_12px_40px_-18px_hsl(var(--crew)/0.55)]",
            )}
          >
            Jugador siguiente
          </Button>
        )}
      </div>
    </div>
  );
}

function PlayPhase() {
  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const startVote = useGameStore((state) => state.startVote);
  const nextTurn = useGameStore((state) => state.nextTurn);

  const [roundTimeRemaining, setRoundTimeRemaining] = useState(0);
  const [turnTimeRemaining, setTurnTimeRemaining] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (phase.type !== "play") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    let hasTriggeredTurnAdvance = false;
    let hasTriggeredRoundEnd = false;
    const initialTurnEndsAt = phase.turnEndsAt;
    const initialRoundEndsAt = phase.roundEndsAt;

    const updateTimers = () => {
      const now = Date.now();
      const roundRemaining = Math.max(
        0,
        Math.floor((phase.roundEndsAt - now) / 1000),
      );
      setRoundTimeRemaining(roundRemaining);

      if (phase.turnEndsAt) {
        const turnRemaining = Math.max(
          0,
          Math.floor((phase.turnEndsAt - now) / 1000),
        );
        setTurnTimeRemaining(turnRemaining);

        if (
          turnRemaining === 0 &&
          !hasTriggeredTurnAdvance &&
          phase.turnEndsAt === initialTurnEndsAt
        ) {
          hasTriggeredTurnAdvance = true;
          if (typeof navigator !== "undefined" && navigator.vibrate)
            navigator.vibrate(200);
          nextTurn();
        }
      } else {
        setTurnTimeRemaining(0);
      }

      if (
        roundRemaining === 0 &&
        !hasTriggeredRoundEnd &&
        phase.roundEndsAt === initialRoundEndsAt
      ) {
        hasTriggeredRoundEnd = true;
        startVote();
      }
    };

    updateTimers();
    intervalRef.current = setInterval(updateTimers, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    phase.type === "play" ? phase.roundEndsAt : null,
    phase.type === "play" ? phase.turnEndsAt : null,
    phase.type === "play" ? phase.turnPlayerId : null,
    nextTurn,
    startVote,
  ]);

  if (phase.type !== "play") return null;

  const currentTurnPlayer = players.find((p) => p.id === phase.turnPlayerId);
  const roundMinutes = Math.floor(roundTimeRemaining / 60);
  const roundSeconds = roundTimeRemaining % 60;
  const turnMinutes = Math.floor(turnTimeRemaining / 60);
  const turnSeconds = turnTimeRemaining % 60;

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
            <p className="text-sm text-muted-foreground mb-1">
              Tiempo del turno
            </p>
            <p className="text-3xl font-bold">
              {String(turnMinutes).padStart(2, "0")}:
              {String(turnSeconds).padStart(2, "0")}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-1">
              Tiempo de ronda
            </p>
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
  );
}

function VotePhase() {
  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const selectVote = useGameStore((state) => state.selectVote);
  const confirmVote = useGameStore((state) => state.confirmVote);

  if (phase.type !== "vote") return null;

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
              variant={
                phase.selectedPlayerId === player.id ? "default" : "outline"
              }
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
  );
}

function ResultPhase() {
  const router = useRouter();
  const phase = useGameStore((state) => state.phase);
  const players = useGameStore((state) => state.players);
  const resetRound = useGameStore((state) => state.resetRound);
  const resetAll = useGameStore((state) => state.resetAll);

  if (phase.type !== "result") return null;

  const impostor = players.find((p) => p.id === phase.impostorId);
  const isCrewWin = phase.winner === "crew";

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
          <p className="text-sm text-muted-foreground">
            La palabra secreta era:
          </p>
          <p className="text-xl font-bold">{phase.secretWord}</p>
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant="primaryGlow"
            size="premium"
            className="w-full"
            onClick={() => router.push("/game/score")}
          >
            Continuar
          </Button>
          <div className="flex gap-2">
            <Button onClick={resetAll} variant="outline" className="flex-1">
              Nueva partida
            </Button>
            <Button onClick={resetRound} className="flex-1">
              Revancha
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
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

      <div className="flex flex-1 flex-col gap-6 pb-28">
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
      {phase.type === "result" && <ResultPhase />}
      {phase.type === "score" && <ScorePhase />}
    </div>
  );
}
