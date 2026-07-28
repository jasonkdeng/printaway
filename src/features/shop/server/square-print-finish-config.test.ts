import { describe, expect, it } from "vitest";

import { getSquarePrintFinishModifierIds } from "./square-print-finish-config";

describe("Square Print Finish modifier configuration", () => {
  it("accepts the two individual modifier IDs from the shared modifier list", () => {
    expect(getSquarePrintFinishModifierIds({
      SQUARE_PRINT_FINISH_MATTE_MODIFIER_ID: "matte-modifier",
      SQUARE_PRINT_FINISH_GLOSSY_MODIFIER_ID: "glossy-modifier",
    })).toEqual({ Matte: "matte-modifier", Glossy: "glossy-modifier" });
  });

  it("rejects an incomplete modifier configuration", () => {
    expect(() => getSquarePrintFinishModifierIds({ SQUARE_PRINT_FINISH_MATTE_MODIFIER_ID: "matte-modifier" })).toThrow();
  });
});
