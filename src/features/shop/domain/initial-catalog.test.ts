import { describe, expect, it } from "vitest";

import { initialCatalogProductSchema, initialCatalogProducts, priceForPrintFinish } from "./initial-catalog";

describe("initial catalog fixtures", () => {
  it("contains approved CAD base prices, shared Print Finish options, content, and temporary media states", () => {
    expect(initialCatalogProducts.map((product) => initialCatalogProductSchema.parse(product).basePrice.amountMinor)).toEqual([1200, 300, 200, 300]);
    expect(initialCatalogProducts.map((product) => initialCatalogProductSchema.parse(product).finishOptions)).toEqual([
      [{ name: "Standard", surcharge: { amountMinor: 0, currency: "CAD" } }, { name: "Matte", surcharge: { amountMinor: 100, currency: "CAD" } }, { name: "Glossy", surcharge: { amountMinor: 200, currency: "CAD" } }],
      [{ name: "Standard", surcharge: { amountMinor: 0, currency: "CAD" } }, { name: "Matte", surcharge: { amountMinor: 100, currency: "CAD" } }, { name: "Glossy", surcharge: { amountMinor: 200, currency: "CAD" } }],
      [{ name: "Standard", surcharge: { amountMinor: 0, currency: "CAD" } }, { name: "Matte", surcharge: { amountMinor: 100, currency: "CAD" } }, { name: "Glossy", surcharge: { amountMinor: 200, currency: "CAD" } }],
      [{ name: "Standard", surcharge: { amountMinor: 0, currency: "CAD" } }, { name: "Matte", surcharge: { amountMinor: 100, currency: "CAD" } }, { name: "Glossy", surcharge: { amountMinor: 200, currency: "CAD" } }],
    ]);
    expect(initialCatalogProducts.every((product) => product.mediaStatus === "placeholder_pending_approved_media")).toBe(true);
    expect(initialCatalogProducts.every((product) => !product.summary.includes("pending approval") && product.limitations.every((limitation) => !limitation.includes("pending approval")))).toBe(true);
    expect(initialCatalogProducts.find((product) => product.id === "monitor-riser")?.summary).toContain("90 mm");
    expect(initialCatalogProducts.find((product) => product.id === "coat-hanger")?.dimensionsMm).toEqual({ length: 400, width: 10, height: 150 });
    expect(initialCatalogProducts.find((product) => product.id === "keycap-fidget")?.limitations).toContain("Contains small parts. Choking hazard. Not for children under 3 years.");
  });

  it("adds the selected shared Print Finish option to the product base price", () => {
    const monitorRiser = initialCatalogProductSchema.parse(initialCatalogProducts[0]);

    expect(priceForPrintFinish(monitorRiser, "Standard")).toEqual({ amountMinor: 1200, currency: "CAD" });
    expect(priceForPrintFinish(monitorRiser, "Matte")).toEqual({ amountMinor: 1300, currency: "CAD" });
    expect(priceForPrintFinish(monitorRiser, "Glossy")).toEqual({ amountMinor: 1400, currency: "CAD" });
    expect(priceForPrintFinish(monitorRiser, "Default")).toBeNull();
  });
});
