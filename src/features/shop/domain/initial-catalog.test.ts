import { describe, expect, it } from "vitest";

import { initialCatalogProductSchema, initialCatalogProducts } from "./initial-catalog";

describe("initial catalog fixtures", () => {
  it("contains approved CAD base prices, finish surcharges, content, and temporary media states", () => {
    expect(initialCatalogProducts.map((product) => initialCatalogProductSchema.parse(product).basePrice.amountMinor)).toEqual([1200, 300, 200, 300]);
    expect(initialCatalogProducts.map((product) => initialCatalogProductSchema.parse(product).glossyBaseSurcharge.amountMinor)).toEqual([200, 100, 50, 20]);
    expect(initialCatalogProducts.every((product) => product.mediaStatus === "placeholder_pending_approved_media")).toBe(true);
    expect(initialCatalogProducts.every((product) => !product.summary.includes("pending approval") && product.limitations.every((limitation) => !limitation.includes("pending approval")))).toBe(true);
    expect(initialCatalogProducts.find((product) => product.id === "monitor-riser")?.summary).toContain("90 mm");
    expect(initialCatalogProducts.find((product) => product.id === "coat-hanger")?.dimensionsMm).toEqual({ length: 400, width: 10, height: 150 });
    expect(initialCatalogProducts.find((product) => product.id === "keycap-fidget")?.limitations).toContain("Contains small parts. Choking hazard. Not for children under 3 years.");
  });
});
