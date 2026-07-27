import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  findExpiredIntentIds: vi.fn(),
  removeExpiredReferences: vi.fn(),
  removeExpiredQuotes: vi.fn(),
}));

vi.mock("@/server/adapters/supabase-studio", () => ({
  createSupabaseStudioRepositories: () => ({
    quoteRepository: {
      findExpiredIntentIds: mocks.findExpiredIntentIds,
      removeExpired: mocks.removeExpiredQuotes,
    },
    referenceRepository: { removeExpired: mocks.removeExpiredReferences },
  }),
}));

import { GET } from "./route";

describe("studio retention route", () => {
  beforeEach(() => {
    mocks.findExpiredIntentIds.mockResolvedValue(["quote-1"]);
    mocks.removeExpiredReferences.mockResolvedValue(undefined);
    mocks.removeExpiredQuotes.mockResolvedValue(undefined);
    vi.stubEnv("CRON_SECRET", "scheduled-secret");
    vi.stubEnv("STUDIO_CRON_SECRET", "");
  });

  afterEach(() => vi.unstubAllEnvs());

  it("accepts Vercel's CRON_SECRET authorization header", async () => {
    const response = await GET(new NextRequest("https://printaway.vercel.app/api/internal/studio-retention", {
      headers: { authorization: "Bearer scheduled-secret" },
    }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ removed: 1 });
    expect(mocks.removeExpiredReferences).toHaveBeenCalledWith(["quote-1"]);
    expect(mocks.removeExpiredQuotes).toHaveBeenCalledWith(["quote-1"]);
  });

  it("rejects an incorrect secret", async () => {
    const response = await GET(new NextRequest("https://printaway.vercel.app/api/internal/studio-retention", {
      headers: { authorization: "Bearer incorrect" },
    }));

    expect(response.status).toBe(401);
  });
});
