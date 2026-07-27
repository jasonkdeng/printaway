import { describe, expect, it } from "vitest";

import { normalizeCartLines } from "./cart-repository";

const line = {
  id: "monitor-riser:Default:white",
  productId: "monitor-riser",
  name: "Monitor Riser",
  finish: "Default",
  colour: "white",
  maximumQuantity: 3,
  unitPrice: { amountMinor: 500, currency: "CAD" as const },
};

describe("normalizeCartLines", () => {
  it("merges duplicate account-cart lines and clamps them to inventory", () => {
    expect(normalizeCartLines([
      { ...line, quantity: 2 },
      { ...line, quantity: 2 },
    ])).toEqual({ lines: [{ ...line, quantity: 3 }] });
  });

  it("excludes lines that are no longer sellable", () => {
    expect(normalizeCartLines([{ ...line, maximumQuantity: 0, quantity: 1 }])).toEqual({ lines: [] });
  });
});
