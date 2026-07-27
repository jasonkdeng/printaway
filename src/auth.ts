import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

type AuthenticationEnvironment = Partial<Record<"GOOGLE_CLIENT_ID" | "GOOGLE_CLIENT_SECRET" | "AUTH_SECRET" | "NEXTAUTH_URL", string | undefined>>;

export function isAuthenticationConfigured(environment: AuthenticationEnvironment = process.env): boolean {
  const url = environment.NEXTAUTH_URL?.trim();
  if (!environment.GOOGLE_CLIENT_ID?.trim() || !environment.GOOGLE_CLIENT_SECRET?.trim() || !environment.AUTH_SECRET?.trim() || !url) return false;
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.hostname === "localhost";
  } catch {
    return false;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, account }) {
      if (account?.provider === "google" && account.providerAccountId) {
        token.sub = account.providerAccountId;
      }
      return token;
    },
    session({ session, token }) {
      if (session.user && typeof token.sub === "string") {
        session.user.id = token.sub;
      }
      return session;
    },
  },
};
