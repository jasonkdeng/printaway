import { describe, expect, it } from "vitest";

import { initialCatalogProductSchema, initialCatalogProducts } from "./initial-catalog";

describe("initial catalog fixtures", () => {
  it("contains only approved provisional CAD prices and temporary media states", () => {
    expect(initialCatalogProducts.map((product) => initialCatalogProductSchema.parse(product).provisionalPrice.amountMinor)).toEqual([500, 250, 105, 100]);
    expect(initialCatalogProducts.every((product) => product.mediaStatus === "placeholder_pending_approved_media")).toBe(true);
    expect(initialCatalogProducts.every((product) => product.summary === "Product summary pending approval." && product.limitations[0] === "Product limitations pending approval.")).toBe(true);
  });
});
