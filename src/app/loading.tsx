import { HabitzLoader } from "@/components/habitz-loader";

export default function Loading() {
  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5">
      <div className="aurora absolute inset-0 -z-20" />
      <div className="absolute top-[18%] left-[8%] -z-10 size-36 rounded-full bg-violet-300/30 blur-3xl" />
      <div className="absolute right-[4%] bottom-[18%] -z-10 size-44 rounded-full bg-emerald-200/35 blur-3xl" />
      <section className="glass-panel relative w-full max-w-xs overflow-hidden rounded-[2.25rem] px-8 py-10">
        <div className="absolute -top-14 -right-14 size-32 rounded-full border-[24px] border-[#ffd9e7]/60" />
        <HabitzLoader />
        <p className="mt-5 text-center text-xs leading-5 font-medium text-muted-foreground">
          A calm moment while everything falls into place.
        </p>
      </section>
    </main>
  );
}
