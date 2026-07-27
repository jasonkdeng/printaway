import { describe, expect, it } from "vitest";

import { SupabaseCartRepository } from "./supabase-cart";

const row = {
  line_id: "monitor-riser:Default:white",
  product_id: "monitor-riser",
  product_name: "Monitor Riser",
  finish: "Default",
  colour: "white",
  quantity: 2,
  maximum_quantity: 3,
  unit_price_minor: 500,
  currency: "CAD",
};

describe("SupabaseCartRepository", () => {
  it("maps validated database rows to a provider-neutral cart snapshot", async () => {
    const repository = new SupabaseCartRepository({
      read: async () => [row],
      replace: async () => [row],
    });

    await expect(repository.read("google-subject-123")).resolves.toEqual({
      lines: [{
        id: "monitor-riser:Default:white",
        productId: "monitor-riser",
        name: "Monitor Riser",
        finish: "Default",
        colour: "white",
        quantity: 2,
        maximumQuantity: 3,
        unitPrice: { amountMinor: 500, currency: "CAD" },
      }],
    });
  });

  it("rejects a database row with a non-CAD money value", async () => {
    const repository = new SupabaseCartRepository({
      read: async () => [{ ...row, currency: "USD" }],
      replace: async () => [],
    });

    await expect(repository.read("google-subject-123")).rejects.toThrow();
  });
});
