import { z } from "zod";

import { referenceUploadMetadataSchema, type ReferenceUploadMetadata } from "./reference-upload";

export const studioMaterialSchema = z.enum(["PLA", "ABS"]);
export const studioFinishSchema = z.enum(["Default", "Glossy"]);

export const studioConfigurationSchema = z.object({
  description: z.string().trim().max(4000).optional(),
  references: z.array(referenceUploadMetadataSchema.extend({ id: z.string().min(1).max(255) })).max(10),
  material: studioMaterialSchema,
  dimensionsMm: z.object({
    length: z.number().finite().positive(),
    width: z.number().finite().positive(),
    height: z.number().finite().positive(),
  }),
  finish: studioFinishSchema,
  quantity: z.number().int().positive(),
}).superRefine((value, context) => {
  if (!value.description && value.references.length === 0) {
    context.addIssue({ code: "custom", path: ["description"], message: "reference_required" });
  }
});

export type StudioConfiguration = z.infer<typeof studioConfigurationSchema>;
export type StudioReferenceForSubmission = ReferenceUploadMetadata & { id: string };

export type StudioCapabilityIssue = {
  code: "unsupported_material" | "incompatible_finish" | "outside_build_volume";
  field: "material" | "finish" | "dimensions";
  message: string;
};

export type StudioCapabilities = {
  materials: ReadonlyArray<{
    name: z.infer<typeof studioMaterialSchema>;
    description: string;
    properties: string;
    uses: string;
    limitations: string;
    colours: readonly string[];
    finishes: readonly z.infer<typeof studioFinishSchema>[];
  }>;
  buildVolumeMm: { length: number; width: number; height: number };
};

export function configurationFromDraft(input: {
  description: string;
  references: Array<{ id: string; fileName: string; byteLength: number }>;
  material: string | null;
  dimensions: { lengthMm: string; widthMm: string; heightMm: string };
  finish: string | null;
  quantity: string;
}): StudioConfiguration | null {
  const parsed = studioConfigurationSchema.safeParse({
    description: input.description.trim() || undefined,
    references: input.references,
    material: input.material,
    dimensionsMm: {
      length: Number(input.dimensions.lengthMm),
      width: Number(input.dimensions.widthMm),
      height: Number(input.dimensions.heightMm),
    },
    finish: input.finish,
    quantity: Number(input.quantity),
  });
  return parsed.success ? parsed.data : null;
}

function fitsBuildVolume(
  dimensions: StudioConfiguration["dimensionsMm"],
  buildVolume: StudioCapabilities["buildVolumeMm"],
): boolean {
  const objectAxes = [dimensions.length, dimensions.width, dimensions.height];
  const machineAxes = [buildVolume.length, buildVolume.width, buildVolume.height];
  return [
    [0, 1, 2], [0, 2, 1], [1, 0, 2], [1, 2, 0], [2, 0, 1], [2, 1, 0],
  ].some((permutation) => permutation.every((machineAxis, index) => objectAxes[index] <= machineAxes[machineAxis]));
}

export function validateStudioCapabilities(
  configuration: StudioConfiguration,
  capabilities: StudioCapabilities | null,
): StudioCapabilityIssue[] {
  if (!capabilities) return [];
  const material = capabilities.materials.find((item) => item.name === configuration.material);
  if (!material) return [{ code: "unsupported_material", field: "material", message: "Choose a supported material." }];
  if (!material.finishes.includes(configuration.finish)) {
    return [{ code: "incompatible_finish", field: "finish", message: "That finish is not available with this material." }];
  }
  if (!fitsBuildVolume(configuration.dimensionsMm, capabilities.buildVolumeMm)) {
    return [{ code: "outside_build_volume", field: "dimensions", message: "These dimensions do not fit the configured production volume." }];
  }
  return [];
}
