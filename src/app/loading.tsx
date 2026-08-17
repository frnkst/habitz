export default function Loading() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-5xl animate-pulse px-4 py-5 sm:px-6">
      <div className="mb-7 flex items-center justify-between">
        <div className="size-9 rounded-[0.9rem] bg-[#173b2d]/15" />
        <div className="size-9 rounded-full bg-white/70" />
      </div>
      <div className="mb-5 h-24 w-3/4 rounded-3xl bg-white/55" />
      <div className="h-64 rounded-[1.85rem] bg-white/70" />
      <div className="mt-7 grid grid-cols-2 gap-2 sm:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-28 rounded-[1.35rem] bg-white/70" />
        ))}
      </div>
    </main>
  );
}
