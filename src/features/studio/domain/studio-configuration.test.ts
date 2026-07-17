import { describe, expect, it } from "vitest";

import { configurationFromDraft, validateStudioCapabilities, type StudioCapabilities } from "./studio-configuration";

const capabilities: StudioCapabilities = {
  materials: [{
    name: "PLA",
    description: "Approved test content.",
    properties: "Approved test property.",
    uses: "Approved test use.",
    limitations: "Approved test limitation.",
    colours: ["Black"],
    finishes: ["Default"],
  }],
  buildVolumeMm: { length: 100, width: 80, height: 60 },
};

function configuration() {
  return configurationFromDraft({
    description: "  A test bracket.  ",
    references: [],
    material: "PLA",
    dimensions: { lengthMm: "80", widthMm: "60", heightMm: "40" },
    finish: "Default",
    quantity: "2",
  })!;
}

describe("Studio configuration", () => {
  it("normalizes a complete draft into typed values", () => {
    expect(configuration()).toMatchObject({
      description: "A test bracket.",
      dimensionsMm: { length: 80, width: 60, height: 40 },
      quantity: 2,
    });
  });

  it("accepts a build-volume fit through a rotated orientation", () => {
    const value = { ...configuration(), dimensionsMm: { length: 60, width: 100, height: 80 } };
    expect(validateStudioCapabilities(value, capabilities)).toEqual([]);
  });

  it("returns stable incompatibility and volume issues", () => {
    expect(validateStudioCapabilities({ ...configuration(), finish: "Glossy" }, capabilities)).toMatchObject([
      { code: "incompatible_finish", field: "finish" },
    ]);
    expect(validateStudioCapabilities({ ...configuration(), dimensionsMm: { length: 101, width: 81, height: 61 } }, capabilities)).toMatchObject([
      { code: "outside_build_volume", field: "dimensions" },
    ]);
  });

  it("does not make a claim while capabilities are unconfigured", () => {
    expect(validateStudioCapabilities(configuration(), null)).toEqual([]);
  });
});
