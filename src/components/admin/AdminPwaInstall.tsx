"use client";

import React, { useEffect, useState } from "react";
import { Download, X, Share, PlusSquare } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function AdminPwaInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);

  useEffect(() => {
    // 1. Register Scoped Service Worker for /admin
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      try {
        navigator.serviceWorker
          .register("/admin-sw.js", { scope: "/admin" })
          .then((reg) => {
            console.log("[AdminPWA] ServiceWorker registered for scope:", reg.scope);
          })
          .catch((err) => {
            console.warn("[AdminPWA] ServiceWorker registration skipped/failed:", err);
          });
      } catch (err) {
        console.warn("[AdminPWA] ServiceWorker exception:", err);
      }
    }

    // 2. Detect Standalone / Already Installed Mode
    const checkStandalone = () => {
      const isStandaloneMode =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      setIsStandalone(Boolean(isStandaloneMode));
    };

    checkStandalone();

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari =
      userAgent.includes("safari") &&
      !userAgent.includes("chrome") &&
      !userAgent.includes("crios") &&
      !userAgent.includes("fxios");

    setIsIos(isIosDevice);

    const isIosDismissed = localStorage.getItem("gs_studio_pwa_ios_dismissed") === "true";
    if (isIosDevice && isSafari && !isStandalone && !isIosDismissed) {
      setShowIosGuide(true);
    }

    // 4. Capture beforeinstallprompt for Chrome / Android / Edge
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, [isStandalone]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    try {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
    } catch (err) {
      console.warn("[AdminPWA] Install prompt exception:", err);
    }
  };

  const dismissIosGuide = () => {
    setShowIosGuide(false);
    try {
      localStorage.setItem("gs_studio_pwa_ios_dismissed", "true");
    } catch {
      // ignore
    }
  };

  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Chrome / Android Install Button */}
      {deferredPrompt && (
        <button
          type="button"
          onClick={handleInstallClick}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#9A3412] hover:bg-[#b03c15] text-white text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 animate-in fade-in duration-300"
          title="Install Green Steel Studio on this device"
        >
          <Download className="w-3.5 h-3.5 shrink-0" />
          <span>Install App</span>
        </button>
      )}

      {/* iOS Safari Share Sheet Instruction Banner */}
      {isIos && showIosGuide && (
        <aside
          role="region"
          aria-label="PWA install instructions for iOS"
          className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 bg-[#18181B] text-[#FAF8F5] p-4 rounded-2xl shadow-2xl border border-white/10 flex items-start gap-3 animate-in slide-in-from-bottom-5 duration-300"
        >
          <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center shrink-0 mt-0.5">
            <Share className="w-4 h-4 text-amber-300" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white">Install Studio on iPhone</h4>
            <p className="text-[11px] text-white/70 mt-1 leading-relaxed">
              Tap the <span className="inline-flex items-center text-white font-semibold">Share icon <Share className="w-3 h-3 mx-1 inline" /></span> at the bottom of Safari, then choose <span className="text-white font-semibold inline-flex items-center">Add to Home Screen <PlusSquare className="w-3 h-3 mx-1 inline" /></span>.
            </p>
          </div>
          <button
            type="button"
            onClick={dismissIosGuide}
            className="text-white/50 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            aria-label="Dismiss iOS install instructions"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}
    </>
  );
}

