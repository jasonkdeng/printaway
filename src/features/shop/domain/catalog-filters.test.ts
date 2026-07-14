import { describe, expect, it } from "vitest";

import { parseShopFilters } from "./catalog-filters";

describe("parseShopFilters", () => {
  it("accepts the documented material and availability filters", () => {
    expect(parseShopFilters({ material: "recycled-paper", availability: "available" })).toEqual({
      material: "recycled-paper",
      availability: "available",
    });
  });

  it("rejects filters outside the product contract", () => {
    expect(() => parseShopFilters({ use: "wall-art" })).toThrow();
  });
});
