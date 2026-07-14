import { describe, expect, it } from "vitest";

import { privacyConsentCopy, privacyPolicyPath, quoteConsentSchema, quoteContactSchema } from "./quote-request";

describe("quote contact boundary", () => {
  it("requires a name and email while accepting optional phone and company fields", () => {
    expect(quoteContactSchema.parse({ name: "Avery", email: "avery@example.ca", phone: "", company: "" })).toEqual({
      name: "Avery",
      email: "avery@example.ca",
      phone: undefined,
      company: undefined,
    });
  });

  it("rejects missing or invalid required contact details", () => {
    expect(() => quoteContactSchema.parse({ email: "not-an-email" })).toThrow();
    expect(() => quoteContactSchema.parse({ name: "", email: "avery@example.ca" })).toThrow();
    expect(() => quoteContactSchema.parse({ name: "Avery", email: "" })).toThrow();
  });
});

describe("quote consent boundary", () => {
  it("requires explicit privacy consent and links the supplied policy path", () => {
    expect(quoteConsentSchema.parse({ privacyConsent: true })).toEqual({ privacyConsent: true });
    expect(() => quoteConsentSchema.parse({ privacyConsent: false })).toThrow();
    expect(privacyPolicyPath).toBe("/privacy-policy");
    expect(privacyConsentCopy).toContain("printaway@gmail.com");
  });
});
