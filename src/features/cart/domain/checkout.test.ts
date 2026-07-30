import { describe, expect, it } from "vitest";

import { checkoutRequestSchema, shippingFeeFor } from "./checkout";

describe("checkout domain", () => {
  it("normalizes an approved shipping postal code and applies the shipping fee below CAD 30", () => {
    const request = checkoutRequestSchema.parse({
      idempotencyKey: "3f111c51-3bb1-41e4-9f15-652bda63dc6b",
      fulfillment: { kind: "shipping", postalCode: "n2l 3g1" },
    });

    expect(request.fulfillment).toEqual({ kind: "shipping", postalCode: "N2L3G1" });
    expect(shippingFeeFor({ amountMinor: 2999, currency: "CAD" }, request.fulfillment)).toEqual({
      amountMinor: 500,
      currency: "CAD",
    });
  });

  it("rejects shipping outside the approved service areas", () => {
    expect(() => checkoutRequestSchema.parse({
      idempotencyKey: "3f111c51-3bb1-41e4-9f15-652bda63dc6b",
      fulfillment: { kind: "shipping", postalCode: "K1A 0B1" },
    })).toThrow();
  });

  it("does not charge shipping for pickup or a qualifying merchandise subtotal", () => {
    const pickup = checkoutRequestSchema.parse({
      idempotencyKey: "3f111c51-3bb1-41e4-9f15-652bda63dc6b",
      fulfillment: { kind: "pickup", pickupPointId: "toronto-wellesley" },
    }).fulfillment;
    expect(shippingFeeFor({ amountMinor: 100, currency: "CAD" }, pickup).amountMinor).toBe(0);
    expect(shippingFeeFor({ amountMinor: 3000, currency: "CAD" }, { kind: "shipping", postalCode: "M4Y0H8" }).amountMinor).toBe(0);
  });
});
