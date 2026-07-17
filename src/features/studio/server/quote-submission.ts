import { createHmac, randomUUID } from "node:crypto";

import { z } from "zod";

import { studioConfigurationSchema, type StudioConfiguration } from "@/features/studio/domain/studio-configuration";
import type { StudioEstimate } from "@/features/studio/domain/studio-estimate";
import { quoteConsentSchema, quoteContactSchema, type QuoteConsent, type QuoteContact } from "@/features/studio/domain/quote-request";

export const prepareQuoteRequestSchema = z.object({
  configuration: studioConfigurationSchema,
  contact: quoteContactSchema,
  consent: quoteConsentSchema,
  idempotencyKey: z.string().uuid(),
});

export const finalizeQuoteRequestSchema = z.object({ intentId: z.string().uuid() });

export type PrepareQuoteRequest = z.infer<typeof prepareQuoteRequestSchema>;
export type FinalizeQuoteRequest = z.infer<typeof finalizeQuoteRequestSchema>;

export type UploadGrant = { referenceId: string; signedUploadUrl: string; expiresAt: string };
export type PrepareQuoteResult = { intentId: string; publicReference: string; uploads: UploadGrant[] };
export type FinalizeQuoteResult = { status: "submitted"; publicReference: string };

export interface ReferenceUploadRepository {
  prepare(intentId: string, references: StudioConfiguration["references"]): Promise<UploadGrant[]>;
  verify(intentId: string): Promise<boolean>;
  removeExpired(intentIds: string[]): Promise<void>;
}

export interface QuoteRepository {
  prepare(input: {
    intentId: string;
    publicReference: string;
    idempotencyKey: string;
    configuration: StudioConfiguration;
    contact: QuoteContact;
    consent: QuoteConsent;
    privacyPolicyVersion: string;
    estimate: StudioEstimate;
  }): Promise<{ intentId: string; publicReference: string; existing: boolean }>;
  finalize(intentId: string): Promise<FinalizeQuoteResult>;
  findExpiredIntentIds(now: Date): Promise<string[]>;
  removeExpired(intentIds: string[]): Promise<void>;
}

export interface QuoteSubmissionService {
  prepare(request: PrepareQuoteRequest): Promise<PrepareQuoteResult>;
  finalize(request: FinalizeQuoteRequest): Promise<FinalizeQuoteResult>;
}

export function createPublicReference(): string {
  return `PA-${randomUUID().replaceAll("-", "").slice(0, 10).toUpperCase()}`;
}

export function hashRateLimitAddress(address: string | null, secret: string): string {
  return createHmac("sha256", secret).update(address ?? "unknown").digest("hex");
}

export function createQuoteSubmissionService(dependencies: {
  quoteRepository: QuoteRepository;
  referenceRepository: ReferenceUploadRepository;
  privacyPolicyVersion: string;
  estimate: StudioEstimate;
}): QuoteSubmissionService {
  return {
    async prepare(request) {
      const prepared = await dependencies.quoteRepository.prepare({
        intentId: randomUUID(),
        publicReference: createPublicReference(),
        idempotencyKey: request.idempotencyKey,
        configuration: request.configuration,
        contact: request.contact,
        consent: request.consent,
        privacyPolicyVersion: dependencies.privacyPolicyVersion,
        estimate: dependencies.estimate,
      });
      const uploads = await dependencies.referenceRepository.prepare(prepared.intentId, request.configuration.references);
      return { intentId: prepared.intentId, publicReference: prepared.publicReference, uploads };
    },
    async finalize(request) {
      const complete = await dependencies.referenceRepository.verify(request.intentId);
      if (!complete) throw new Error("incomplete_uploads");
      return dependencies.quoteRepository.finalize(request.intentId);
    },
  };
}
