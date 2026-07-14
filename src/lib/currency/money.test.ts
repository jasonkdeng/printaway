import { describe, expect, it } from "vitest";

import { formatMoney, moneySchema } from "./money";

describe("moneySchema", () => {
  it("accepts non-negative CAD minor-unit amounts", () => {
    expect(moneySchema.parse({ amountMinor: 1099, currency: "CAD" })).toEqual({
      amountMinor: 1099,
      currency: "CAD",
    });
  });

  it("rejects a non-CAD currency and fractional minor units", () => {
    expect(() => moneySchema.parse({ amountMinor: 10.5, currency: "CAD" })).toThrow();
    expect(() => moneySchema.parse({ amountMinor: 1099, currency: "USD" })).toThrow();
  });
});

describe("formatMoney", () => {
  it("formats CAD from integer minor units", () => {
    expect(formatMoney({ amountMinor: 1099, currency: "CAD" })).toBe("$10.99");
  });
});
