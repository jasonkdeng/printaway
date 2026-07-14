import { z } from "zod";

export const referenceUploadMaxBytes = 10 * 1024 * 1024;
export const referenceUploadExtensions = [".stl", ".png", ".3mf", ".sldprt", ".step", ".sldasm"] as const;

const extensionPattern = new RegExp(`(${referenceUploadExtensions.map((extension) => extension.replace(".", "\\.")).join("|")})$`, "i");

export const referenceUploadMetadataSchema = z.object({
  fileName: z.string().trim().min(1).max(255).regex(extensionPattern, "unsupported_file_type"),
  byteLength: z.number().int().positive().max(referenceUploadMaxBytes, "file_too_large"),
});

export type ReferenceUploadMetadata = z.infer<typeof referenceUploadMetadataSchema>;
