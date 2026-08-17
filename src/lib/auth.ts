import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { getAppConfig } from "@/lib/config";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function stringValue(value: unknown): string | null {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return null;
}

export function getGitHubUserId(user: User): string | null {
  const githubIdentity = user.identities?.find(
    (identity) => identity.provider === "github",
  );
  const identityData = githubIdentity?.identity_data;

  return (
    stringValue(identityData?.provider_id) ??
    stringValue(identityData?.sub) ??
    stringValue(user.user_metadata.provider_id) ??
    stringValue(user.user_metadata.sub) ??
    stringValue(githubIdentity?.identity_id)
  );
}

export function isOwner(user: User): boolean {
  return getGitHubUserId(user) === getAppConfig().allowedGitHubUserId;
}

export async function getAuthorizedUser(): Promise<User | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user && isOwner(user) ? user : null;
}

export async function requireOwner(): Promise<User> {
  const user = await getAuthorizedUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
