import { describe, expect, it } from "vitest";

import { studioSteps } from "./studio-steps";

describe("studioSteps", () => {
  it("preserves the documented six-step Studio sequence", () => {
    expect(studioSteps).toEqual([
      "Reference",
      "Material",
      "Size",
      "Finish",
      "Quantity",
      "Review and submit",
    ]);
  });
});
