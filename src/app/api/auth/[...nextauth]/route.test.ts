import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const handler = vi.fn();
  return {
    configured: vi.fn(),
    handler,
    nextAuth: vi.fn(() => handler),
  };
});

vi.mock("next-auth", () => ({ default: mocks.nextAuth }));
vi.mock("@/auth", () => ({
  authOptions: {},
  isAuthenticationConfigured: mocks.configured,
}));

import { GET } from "./route";

describe("Auth.js route handler", () => {
  beforeEach(() => {
    mocks.configured.mockReturnValue(true);
    mocks.handler.mockResolvedValue(new Response(null, { status: 302 }));
    mocks.handler.mockClear();
  });

  it("forwards the App Router context to NextAuth", async () => {
    const request = new NextRequest("https://localhost:3000/api/auth/signin/google?callbackUrl=%2Fcart");
    const context = { params: Promise.resolve({ nextauth: ["signin", "google"] }) };

    await GET(request, context as never);

    expect(mocks.handler).toHaveBeenCalledWith(request, context);
  });

  it("returns a safe response when authentication is unavailable", async () => {
    mocks.configured.mockReturnValue(false);
    const response = await GET(new NextRequest("https://localhost:3000/api/auth/signin/google"), { params: Promise.resolve({ nextauth: ["signin", "google"] }) } as never);

    expect(response.status).toBe(503);
    await expect(response.text()).resolves.toBe("Authentication is not configured.");
    expect(mocks.handler).not.toHaveBeenCalled();
  });
});
