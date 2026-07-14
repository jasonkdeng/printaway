import { describe, expect, it } from "vitest";

import { getInitialCatalogProduct, listInitialCatalogMaterials, listInitialCatalogProducts } from "./catalog";

describe("initial catalog access", () => {
  it("filters the approved catalog by material", () => {
    expect(listInitialCatalogProducts("ABS").map((product) => product.slug)).toEqual(["coat-hanger"]);
  });

  it("returns no available products while every approved fixture is sold out", () => {
    expect(listInitialCatalogProducts(undefined, "available")).toEqual([]);
  });

  it("returns a stable product by slug and exposes known materials", () => {
    expect(getInitialCatalogProduct("desk-tray")?.name).toBe("Desk Tray");
    expect(getInitialCatalogProduct("missing")).toBeNull();
    expect(listInitialCatalogMaterials()).toEqual(["PLA", "ABS"]);
  });
});
