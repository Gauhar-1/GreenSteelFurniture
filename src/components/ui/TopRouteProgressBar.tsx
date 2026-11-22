"use client";

import React, { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

export function TopRouteProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // When path or query params change, complete the bar and fade out
    setProgress(100);
    const timeout = setTimeout(() => {
      setIsVisible(false);
      setProgress(0);
    }, 300);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Listen for custom trigger events from InteractiveLinkCard or TactileButton
    const timers = new Set<ReturnType<typeof setTimeout>>();

    const clearAllTimers = () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };

    const handleStart = () => {
      clearAllTimers();
      setIsVisible(true);
      setProgress(25);
      const t1 = setTimeout(() => {
        setProgress(65);
        timers.delete(t1);
      }, 150);
      timers.add(t1);

      const t2 = setTimeout(() => {
        setProgress(85);
        timers.delete(t2);
      }, 400);
      timers.add(t2);
    };

    const handleStop = () => {
      clearAllTimers();
      setProgress(100);
      const t3 = setTimeout(() => {
        setIsVisible(false);
        setProgress(0);
        timers.delete(t3);
      }, 250);
      timers.add(t3);
    };

    window.addEventListener("route-transition-start", handleStart);
    window.addEventListener("route-transition-stop", handleStop);

    return () => {
      clearAllTimers();
      window.removeEventListener("route-transition-start", handleStart);
      window.removeEventListener("route-transition-stop", handleStop);
    };
  }, []);

  if (!isVisible && progress === 0) return null;

  return (
    <div
      aria-hidden="true"
      className="fixed top-0 left-0 right-0 z-[100] h-0.5 bg-transparent pointer-events-none"
    >
      <div
        className="h-full bg-[#9A3412] transition-all duration-300 ease-out shadow-[0_0_8px_#9A3412]"
        style={{
          width: `${progress}%`,
          opacity: isVisible ? 1 : 0,
        }}
      />
    </div>
  );
}
