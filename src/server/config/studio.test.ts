import { describe, expect, it } from "vitest";

import { getStudioServerConfiguration } from "./studio";

const capabilities = JSON.stringify({
  materials: [{ name: "PLA", description: "Description", properties: "Properties", uses: "Uses", limitations: "Limitations", colours: ["Black"], finishes: ["Default"] }],
  buildVolumeMm: { length: 100, width: 100, height: 100 },
});

describe("Studio server configuration", () => {
  it("keeps submission disabled without every required production value", () => {
    expect(getStudioServerConfiguration({ STUDIO_SUBMISSION_ENABLED: "true" }).submissionEnabled).toBe(false);
  });

  it("accepts approved capabilities only when the gated configuration is complete", () => {
    const configuration = getStudioServerConfiguration({
      STUDIO_SUBMISSION_ENABLED: "true",
      STUDIO_PRIVACY_POLICY_VERSION: "2026-07-15",
      STUDIO_CAPABILITIES_JSON: capabilities,
      SUPABASE_SECRET_KEY: "secret",
      STUDIO_RATE_LIMIT_SECRET: "rate-limit-secret",
    });
    expect(configuration.submissionEnabled).toBe(true);
    expect(configuration.capabilities?.materials[0]?.name).toBe("PLA");
  });
});
