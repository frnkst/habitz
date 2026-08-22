"use client";

import { useFormStatus } from "react-dom";
import { ArrowRight, GitBranch } from "lucide-react";

import { HabitzLoader } from "@/components/habitz-loader";
import { Button } from "@/components/ui/button";

export function LoginButton() {
  const { pending } = useFormStatus();

  return (
    <Button
      className="h-14 w-full rounded-2xl bg-gradient-to-br from-[#7457d9] to-[#8e72e7] px-5 text-base text-white shadow-xl shadow-violet-950/20 hover:from-[#684bcf] hover:to-[#8265df]"
      type="submit"
      disabled={pending}
    >
      {pending ? (
        <HabitzLoader compact inverted label="Opening GitHub" />
      ) : (
        <>
          <GitBranch className="size-5" aria-hidden="true" />
          Continue with GitHub
          <ArrowRight className="ml-auto size-4 text-[#f0ebff]" />
        </>
      )}
    </Button>
  );
}
