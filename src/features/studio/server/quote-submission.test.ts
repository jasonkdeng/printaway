import { describe, expect, it, vi } from "vitest";

import { createQuoteSubmissionService, hashRateLimitAddress } from "./quote-submission";

const request = {
  configuration: {
    description: "A test bracket.",
    references: [],
    material: "PLA" as const,
    dimensionsMm: { length: 80, width: 60, height: 40 },
    finish: "Default" as const,
    quantity: 2,
  },
  contact: { name: "Avery", email: "avery@example.ca", phone: undefined, company: undefined },
  consent: { privacyConsent: true as const },
  idempotencyKey: "9e5e3a5f-e103-4a94-9d36-3b4a43e86fa4",
};

describe("Quote submission service", () => {
  it("prepares and finalizes a description-only request", async () => {
    const quoteRepository = {
      prepare: vi.fn().mockResolvedValue({ intentId: "11111111-1111-4111-8111-111111111111", publicReference: "PA-TEST", existing: false }),
      finalize: vi.fn().mockResolvedValue({ status: "submitted", publicReference: "PA-TEST" }),
      findExpiredIntentIds: vi.fn(),
      removeExpired: vi.fn(),
    };
    const referenceRepository = {
      prepare: vi.fn().mockResolvedValue([]),
      verify: vi.fn().mockResolvedValue(true),
      removeExpired: vi.fn(),
    };
    const service = createQuoteSubmissionService({ quoteRepository, referenceRepository, privacyPolicyVersion: "2026-07-15", estimate: { status: "manual_review", values: null } });

    const prepared = await service.prepare(request);
    await expect(service.finalize({ intentId: prepared.intentId })).resolves.toEqual({ status: "submitted", publicReference: "PA-TEST" });
    expect(referenceRepository.prepare).toHaveBeenCalledWith(prepared.intentId, []);
  });

  it("uses an HMAC so the raw address is not stored by rate limiting", () => {
    expect(hashRateLimitAddress("192.0.2.4", "secret")).not.toContain("192.0.2.4");
    expect(hashRateLimitAddress("192.0.2.4", "secret")).toBe(hashRateLimitAddress("192.0.2.4", "secret"));
  });
});
