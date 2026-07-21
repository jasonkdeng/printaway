import { describe, expect, it } from "vitest";

import { authOptions } from "./auth";

describe("authOptions", () => {
  it("uses Google as the only provider and JWT sessions", () => {
    expect(authOptions.session?.strategy).toBe("jwt");
    expect(authOptions.providers).toHaveLength(1);
    expect(authOptions.providers[0]?.id).toBe("google");
  });

  it("uses the stable Google subject rather than an email address", async () => {
    const token = await authOptions.callbacks?.jwt?.({
      token: { email: "avery@example.ca" },
      account: { provider: "google", providerAccountId: "google-subject-123", type: "oauth" },
      user: { id: "internal-user", email: "avery@example.ca", emailVerified: null },
      profile: undefined,
      trigger: "signIn",
      isNewUser: false,
      session: undefined,
    });

    expect(token?.sub).toBe("google-subject-123");
  });

  it("exposes the stable subject to the server session without provider tokens", async () => {
    const session = await authOptions.callbacks?.session?.({
      session: { user: { email: "avery@example.ca" }, expires: "2099-01-01" },
      token: { sub: "google-subject-123" },
      user: { id: "internal-user", email: "avery@example.ca", emailVerified: null },
      trigger: "update",
      newSession: undefined,
    });

    expect((session?.user as { id?: string } | undefined)?.id).toBe("google-subject-123");
    expect(session).not.toHaveProperty("accessToken");
    expect(session).not.toHaveProperty("refreshToken");
  });
});
