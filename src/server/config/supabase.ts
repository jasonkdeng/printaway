import "server-only";

import { z } from "zod";

const supabaseServerConfigSchema = z.object({
  SUPABASE_URL: z.url(),
  SUPABASE_PUBLISHABLE_KEY: z.string().min(1),
});

const supabaseAdminConfigSchema = supabaseServerConfigSchema.extend({
  SUPABASE_SECRET_KEY: z.string().min(1),
});

export type SupabaseServerConfig = z.infer<typeof supabaseServerConfigSchema>;
export type SupabaseAdminConfig = z.infer<typeof supabaseAdminConfigSchema>;

export function getSupabaseServerConfig(
  environment: Partial<Record<"SUPABASE_URL" | "SUPABASE_PUBLISHABLE_KEY", string | undefined>>,
): SupabaseServerConfig {
  return supabaseServerConfigSchema.parse({
    SUPABASE_URL: environment.SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY: environment.SUPABASE_PUBLISHABLE_KEY,
  });
}

export function getSupabaseServerConfigFromEnvironment(): SupabaseServerConfig {
  return getSupabaseServerConfig({
    SUPABASE_URL: process.env["SUPABASE_URL"],
    SUPABASE_PUBLISHABLE_KEY: process.env["SUPABASE_PUBLISHABLE_KEY"],
  });
}

export function getSupabaseAdminConfigFromEnvironment(): SupabaseAdminConfig {
  return supabaseAdminConfigSchema.parse({
    SUPABASE_URL: process.env["SUPABASE_URL"],
    SUPABASE_PUBLISHABLE_KEY: process.env["SUPABASE_PUBLISHABLE_KEY"],
    SUPABASE_SECRET_KEY: process.env["SUPABASE_SECRET_KEY"],
  });
}
