import { describe, expect, it } from "vitest";

import { referenceUploadMaxBytes } from "./reference-upload";
import {
  createInitialStudioDraft,
  studioFoundationOptions,
  studioReducer,
  validateStudioStep,
} from "./studio-draft";

describe("Studio draft validation", () => {
  it("accepts a description or valid local reference and rejects invalid reference metadata", () => {
    const emptyDraft = createInitialStudioDraft();
    expect(validateStudioStep(emptyDraft, "Reference")).toMatchObject([
      { code: "reference_required", field: "description" },
    ]);

    expect(validateStudioStep({ ...emptyDraft, description: "A replacement bracket." }, "Reference")).toEqual([]);
    expect(validateStudioStep({
      ...emptyDraft,
      references: [{ id: "reference-1", fileName: "bracket.step", byteLength: referenceUploadMaxBytes }],
    }, "Reference")).toEqual([]);

    expect(validateStudioStep({
      ...emptyDraft,
      references: [{ id: "reference-2", fileName: "bracket.obj", byteLength: 128 }],
    }, "Reference")).toMatchObject([
      { code: "unsupported_file_type", field: "references" },
    ]);
  });

  it("requires approved preference names without asserting compatibility", () => {
    const draft = createInitialStudioDraft();

    expect(studioFoundationOptions).toEqual({
      materials: ["PLA", "ABS"],
      finishes: ["Default", "Glossy"],
    });
    expect(validateStudioStep(draft, "Material")).toMatchObject([
      { code: "material_required", field: "material" },
    ]);
    expect(validateStudioStep({ ...draft, material: "PLA" }, "Material")).toEqual([]);
    expect(validateStudioStep(draft, "Finish")).toMatchObject([
      { code: "finish_required", field: "finish" },
    ]);
    expect(validateStudioStep({ ...draft, finish: "Glossy" }, "Finish")).toEqual([]);
  });

  it("requires positive dimensions and a positive whole-number quantity", () => {
    const draft = createInitialStudioDraft();

    expect(validateStudioStep(draft, "Size").map((issue) => issue.field)).toEqual([
      "lengthMm",
      "widthMm",
      "heightMm",
    ]);
    expect(validateStudioStep({
      ...draft,
      dimensions: { lengthMm: "120.5", widthMm: "-2", heightMm: "30" },
    }, "Size")).toMatchObject([
      { code: "dimension_positive", field: "widthMm" },
    ]);
    expect(validateStudioStep({
      ...draft,
      dimensions: { lengthMm: "120.5", widthMm: "80", heightMm: "30" },
    }, "Size")).toEqual([]);

    expect(validateStudioStep({ ...draft, quantity: "1.5" }, "Quantity")).toMatchObject([
      { code: "quantity_whole", field: "quantity" },
    ]);
    expect(validateStudioStep({ ...draft, quantity: "25" }, "Quantity")).toEqual([]);
  });

  it("uses the approved contact and privacy-consent boundary on review", () => {
    const draft = createInitialStudioDraft();
    const issues = validateStudioStep(draft, "Review and submit");

    expect(issues.map((issue) => issue.field)).toEqual(["name", "email", "privacyConsent"]);
    expect(validateStudioStep({
      ...draft,
      contact: { name: "Avery", email: "avery@example.ca", phone: "", company: "" },
      privacyConsent: true,
    }, "Review and submit")).toEqual([]);
  });
});

describe("studioReducer", () => {
  it("preserves entered values while moving between completed steps", () => {
    const initial = createInitialStudioDraft();
    const described = studioReducer(initial, { type: "set_description", value: "A replacement bracket." });
    const completed = studioReducer(described, { type: "complete_step", stepIndex: 0 });
    const advanced = studioReducer(completed, { type: "set_step", stepIndex: 1 });
    const revisited = studioReducer(advanced, { type: "set_step", stepIndex: 0 });

    expect(revisited.description).toBe("A replacement bracket.");
    expect(revisited.completedStepIndexes).toEqual([0]);
    expect(revisited.currentStepIndex).toBe(0);
  });
});
