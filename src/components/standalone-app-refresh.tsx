"use client";

import { useEffect } from "react";

const BACKGROUND_REFRESH_AFTER_MS = 2 * 60 * 1000;

function isStandalone() {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    ("standalone" in navigator &&
      (navigator as Navigator & { standalone?: boolean }).standalone === true)
  );
}

export function StandaloneAppRefresh() {
  useEffect(() => {
    if (!isStandalone()) return;

    let hiddenAt: number | null = null;
    const refreshAfterResume = () => {
      if (document.visibilityState === "hidden") {
        hiddenAt = Date.now();
        return;
      }
      if (
        hiddenAt !== null &&
        Date.now() - hiddenAt >= BACKGROUND_REFRESH_AFTER_MS
      ) {
        window.location.reload();
      }
      hiddenAt = null;
    };
    const refreshRestoredPage = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };

    document.addEventListener("visibilitychange", refreshAfterResume);
    window.addEventListener("pageshow", refreshRestoredPage);
    return () => {
      document.removeEventListener("visibilitychange", refreshAfterResume);
      window.removeEventListener("pageshow", refreshRestoredPage);
    };
  }, []);

  return null;
}
