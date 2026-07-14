import { describe, expect, it } from "vitest";

import { getSquareVariationIds } from "./square-variation-config";

describe("getSquareVariationIds", () => {
  it("maps each initial product to a configured Square variation", () => {
    expect(getSquareVariationIds({
      SQUARE_MONITOR_RISER_VARIATION_ID: "monitor",
      SQUARE_DESK_TRAY_VARIATION_ID: "tray",
      SQUARE_COAT_HANGER_VARIATION_ID: "hanger",
      SQUARE_KEYCAP_FIDGET_VARIATION_ID: "keycap",
    })).toEqual({
      "monitor-riser": "monitor",
      "desk-tray": "tray",
      "coat-hanger": "hanger",
      "keycap-fidget": "keycap",
    });
  });

  it("requires an explicit mapping for every product", () => {
    expect(() => getSquareVariationIds({ SQUARE_MONITOR_RISER_VARIATION_ID: "monitor" })).toThrow();
  });
});
