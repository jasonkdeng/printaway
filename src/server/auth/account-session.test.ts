import { describe, expect, it, vi } from "vitest";

const { getServerSession } = vi.hoisted(() => ({ getServerSession: vi.fn() }));

vi.mock("next-auth/next", () => ({ getServerSession }));
vi.mock("@/auth", () => ({ authOptions: {} }));

import { getAccountSession } from "./account-session";

describe("getAccountSession", () => {
  it("returns the stable account subject and optional email from an authenticated session", async () => {
    getServerSession.mockResolvedValue({ user: { id: "google-subject-123", email: "avery@example.ca" } });

    await expect(getAccountSession()).resolves.toEqual({ accountId: "google-subject-123", email: "avery@example.ca" });
  });

  it("returns null for an anonymous request", async () => {
    getServerSession.mockResolvedValue(null);

    await expect(getAccountSession()).resolves.toBeNull();
  });

  it("does not use an email address as an account identifier", async () => {
    getServerSession.mockResolvedValue({ user: { email: "avery@example.ca" } });

    await expect(getAccountSession()).resolves.toBeNull();
  });
});
