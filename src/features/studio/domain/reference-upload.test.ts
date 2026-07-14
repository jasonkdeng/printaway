import { describe, expect, it } from "vitest";

import { referenceUploadMaxBytes, referenceUploadMetadataSchema } from "./reference-upload";

describe("reference upload metadata", () => {
  it("accepts the approved file types up to 10 MB", () => {
    expect(referenceUploadMetadataSchema.parse({ fileName: "bracket.STEP", byteLength: referenceUploadMaxBytes })).toEqual({
      fileName: "bracket.STEP",
      byteLength: referenceUploadMaxBytes,
    });
  });

  it("rejects unsupported types and oversized files", () => {
    expect(() => referenceUploadMetadataSchema.parse({ fileName: "reference.obj", byteLength: 1 })).toThrow();
    expect(() => referenceUploadMetadataSchema.parse({ fileName: "reference.stl", byteLength: referenceUploadMaxBytes + 1 })).toThrow();
  });
});
