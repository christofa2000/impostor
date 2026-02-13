"use client";

import { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const PWA_DISMISS_KEY = "pwa-install-dismissed";
const PWA_DISMISS_DAYS = 7;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
}

function wasDismissedRecently(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = localStorage.getItem(PWA_DISMISS_KEY);
    if (!raw) return false;
    const t = Number(raw);
    return Date.now() - t < PWA_DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch {
    return false;
  }
}

function setDismissed(): void {
  try {
    localStorage.setItem(PWA_DISMISS_KEY, String(Date.now()));
  } catch {
    // ignore
  }
}

export function PwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [iosDialogOpen, setIosDialogOpen] = useState(false);

  const handleInstall = useCallback(() => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choice) => {
      if (choice.outcome === "accepted") setShowAndroid(false);
      setDeferredPrompt(null);
    });
  }, [deferredPrompt]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (isStandalone() || wasDismissedRecently()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
    };

    if (isIOS()) {
      setShowIOS(true);
      return;
    }

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstall);
  }, []);

  const handleDismiss = useCallback(() => {
    setDismissed();
    setShowAndroid(false);
    setShowIOS(false);
    setIosDialogOpen(false);
  }, []);

  if (!showAndroid && !showIOS) return null;

  if (showIOS) {
    return (
      <Dialog open={iosDialogOpen} onOpenChange={setIosDialogOpen}>
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 safe-area-padding">
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="shadow-lg">
              Añadir a pantalla de inicio
            </Button>
          </DialogTrigger>
        </div>
        <DialogContent className="max-w-[min(90vw,360px)]">
          <DialogHeader>
            <DialogTitle>Instalar Impostor en iOS</DialogTitle>
            <DialogDescription>
              Sigue estos pasos para instalar la app en tu iPhone o iPad:
            </DialogDescription>
            <ol className="list-decimal list-inside space-y-2 text-left text-sm text-muted-foreground" aria-label="Pasos de instalación">
              <li>Toca el botón compartir en la barra inferior de Safari.</li>
              <li>Desliza y elige &quot;Añadir a pantalla de inicio&quot;.</li>
              <li>Pulsa &quot;Añadir&quot; en la esquina superior derecha.</li>
            </ol>
          </DialogHeader>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={handleDismiss}>
              No mostrar de nuevo
            </Button>
            <Button size="sm" onClick={() => setIosDialogOpen(false)}>
              Entendido
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 flex -translate-x-1/2 gap-2 safe-area-padding">
      <Button variant="outline" size="sm" onClick={handleDismiss} className="shadow-lg">
        Ahora no
      </Button>
      <Button variant="secondary" size="sm" onClick={handleInstall} className="shadow-lg">
        Instalar app
      </Button>
    </div>
  );
}
