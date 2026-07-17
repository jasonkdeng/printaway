import "server-only";

import { z } from "zod";

import type { StudioCapabilities } from "@/features/studio/domain/studio-configuration";

const capabilitiesSchema = z.object({
  materials: z.array(z.object({
    name: z.enum(["PLA", "ABS"]),
    description: z.string().min(1),
    properties: z.string().min(1),
    uses: z.string().min(1),
    limitations: z.string().min(1),
    colours: z.array(z.string().min(1)).min(1),
    finishes: z.array(z.enum(["Default", "Glossy"])).min(1),
  })).min(1),
  buildVolumeMm: z.object({ length: z.number().positive(), width: z.number().positive(), height: z.number().positive() }),
});

export type StudioServerConfiguration = {
  submissionEnabled: boolean;
  privacyPolicyVersion: string | null;
  capabilities: StudioCapabilities | null;
};

export function getStudioServerConfiguration(environment: Record<string, string | undefined> = process.env): StudioServerConfiguration {
  let capabilities: ReturnType<typeof capabilitiesSchema.safeParse> | null = null;
  if (environment["STUDIO_CAPABILITIES_JSON"]) {
    try {
      capabilities = capabilitiesSchema.safeParse(JSON.parse(environment["STUDIO_CAPABILITIES_JSON"]));
    } catch {
      capabilities = null;
    }
  }
  const privacyPolicyVersion = environment["STUDIO_PRIVACY_POLICY_VERSION"]?.trim() || null;
  const submissionEnabled = environment["STUDIO_SUBMISSION_ENABLED"] === "true"
    && Boolean(privacyPolicyVersion)
    && Boolean(capabilities?.success)
    && Boolean(environment["SUPABASE_SECRET_KEY"])
    && Boolean(environment["STUDIO_RATE_LIMIT_SECRET"]);
  return {
    submissionEnabled,
    privacyPolicyVersion,
    capabilities: capabilities?.success ? capabilities.data : null,
  };
}
