import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { getAppConfig } from "@/lib/config";
import {
  isTransientReadError,
  retryTransientRead,
  ServiceUnavailableError,
  type ReadError,
} from "@/lib/retry";
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
  const operation = "authentication";
  const { data, error } = await retryTransientRead<{ user: User | null }>(
    () => supabase.auth.getUser(),
    (readError: ReadError) => {
      console.warn("Retrying transient Habitz authentication", {
        code: readError.code,
        message: readError.message,
      });
    },
  );

  if (error) {
    if (isTransientReadError(error)) {
      console.error("Habitz authentication failed", {
        code: error.code,
        message: error.message,
      });
      throw new ServiceUnavailableError(operation, error);
    }
    if (error.name !== "AuthSessionMissingError") {
      console.warn("Habitz session is not valid", {
        code: error.code,
        message: error.message,
      });
    }
    return null;
  }

  const user = data?.user ?? null;
  return user && isOwner(user) ? user : null;
}

export async function requireOwner(): Promise<User> {
  const user = await getAuthorizedUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}
