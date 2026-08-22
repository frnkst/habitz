"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    try {
      const lastRecovery = Number(
        sessionStorage.getItem("habitz-error-recovery") ?? 0,
      );
      if (Date.now() - lastRecovery <= 60_000) return;
      sessionStorage.setItem("habitz-error-recovery", String(Date.now()));
      window.location.reload();
    } catch {
      // Storage can be unavailable in restricted iOS standalone contexts.
    }
  }, []);

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5">
      <div className="aurora absolute inset-0 -z-10" />
      <section className="glass-panel max-w-md rounded-[2rem] p-7 text-center">
        <span className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
          <AlertTriangle className="size-6" />
        </span>
        <p className="eyebrow mt-6 text-amber-700">A small pause</p>
        <h1 className="mt-2 text-3xl">Something went wrong</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          {error.message || "The application could not load this view."}
        </p>
        <Button
          onClick={() => window.location.reload()}
          className="mt-6 h-12 rounded-2xl bg-gradient-to-br from-[#7457d9] to-[#8e72e7] px-6 font-bold text-white shadow-lg shadow-violet-950/15 hover:from-[#684bcf] hover:to-[#8265df]"
        >
          Reload Habitz
        </Button>
      </section>
    </main>
  );
}
