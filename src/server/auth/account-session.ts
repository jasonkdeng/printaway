import "server-only";

import { getServerSession } from "next-auth/next";

import { authOptions } from "@/auth";

export type AccountSession = {
  accountId: string;
  email: string | null;
};

export async function getAccountSession(): Promise<AccountSession | null> {
  const session = await getServerSession(authOptions);
  const accountId = session?.user?.id;
  if (!accountId) {
    return null;
  }
  return { accountId, email: session.user.email ?? null };
}
