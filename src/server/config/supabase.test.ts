import { describe, expect, it } from "vitest";

import { getSupabaseServerConfig } from "./supabase";

describe("getSupabaseServerConfig", () => {
  it("parses a server-side Supabase URL and publishable key", () => {
    expect(getSupabaseServerConfig({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "publishable-key",
    })).toEqual({
      SUPABASE_URL: "https://example.supabase.co",
      SUPABASE_PUBLISHABLE_KEY: "publishable-key",
    });
  });

  it("rejects incomplete configuration", () => {
    expect(() => getSupabaseServerConfig({ SUPABASE_URL: "not-a-url" })).toThrow();
  });
});
