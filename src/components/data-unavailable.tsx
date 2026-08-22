import { RotateCw } from "lucide-react";

import { HabitzLoader } from "@/components/habitz-loader";

export function DataUnavailable() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5">
      <div className="aurora absolute inset-0 -z-10" />
      <section className="glass-panel max-w-md rounded-[2rem] p-7 text-center">
        <HabitzLoader label="Reconnecting" />
        <p className="eyebrow mt-6 text-violet-700">A brief pause</p>
        <h1 className="mt-2 text-3xl">Your habits could not load</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The service did not respond after a few retries. Reload the page in a
          moment.
        </p>
        <a
          href=""
          className="mt-6 inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-[#7457d9] to-[#8e72e7] px-6 text-sm font-bold text-white shadow-lg shadow-violet-950/15"
        >
          <RotateCw className="size-4" />
          Reload
        </a>
      </section>
    </main>
  );
}
