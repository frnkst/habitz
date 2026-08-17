"use client";

import { AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
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
        <Button onClick={reset} className="mt-6 h-12 rounded-2xl bg-[#173b2d] px-6 font-bold hover:bg-[#24543f]">
          Try again
        </Button>
      </section>
    </main>
  );
}
