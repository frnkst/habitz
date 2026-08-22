import { Sparkles } from "lucide-react";
import { redirect } from "next/navigation";

import { signInWithGitHub } from "@/app/actions";
import { LoginButton } from "@/components/login-button";
import { DataUnavailable } from "@/components/data-unavailable";
import { getAuthorizedUser } from "@/lib/auth";
import { isServiceUnavailableError } from "@/lib/retry";

export const dynamic = "force-dynamic";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  let user;
  try {
    user = await getAuthorizedUser();
  } catch (error) {
    if (isServiceUnavailableError(error)) {
      return <DataUnavailable />;
    }
    throw error;
  }
  if (user) {
    redirect("/");
  }
  const { error } = await searchParams;

  return (
    <main className="relative flex min-h-dvh items-center justify-center overflow-hidden px-5 py-10">
      <div className="aurora absolute inset-0 -z-10" />
      <div className="absolute -top-16 -right-20 size-56 rounded-full border-[38px] border-white/25" aria-hidden="true" />
      <div className="absolute -bottom-24 -left-16 size-64 rounded-full border-[44px] border-[#c9f0df]/65" aria-hidden="true" />
      <section className="glass-panel relative w-full max-w-sm overflow-hidden rounded-[2.25rem] p-7 sm:p-8">
        <div className="absolute top-0 right-0 h-28 w-28 rounded-bl-[4rem] bg-[#ffd9e7]/75" aria-hidden="true" />
        <div className="relative mb-14 flex size-12 items-center justify-center rounded-[1rem] bg-gradient-to-br from-[#7457d9] to-[#9b86f2] text-white shadow-xl shadow-violet-950/20">
          <Sparkles className="size-5" aria-hidden="true" />
        </div>
        <p className="eyebrow mb-3 text-violet-700">
          Your private rhythm
        </p>
        <h1 className="display-title text-[3.7rem] leading-[0.88]">
          Make room
          <br />
          <span className="bg-gradient-to-r from-[#7457d9] to-[#a17ce6] bg-clip-text text-transparent">
            for progress.
          </span>
        </h1>
        <p className="mt-5 max-w-[18rem] text-[0.95rem] leading-6 text-muted-foreground">
          A calm, private home for the everyday choices that add up.
        </p>
        {error ? (
          <p
            className="mt-5 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700"
            role="alert"
          >
            {error}
          </p>
        ) : null}
        <form action={signInWithGitHub} className="mt-9">
          <LoginButton />
        </form>
      </section>
    </main>
  );
}
