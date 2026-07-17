import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type {
  QuoteRepository,
  ReferenceUploadRepository,
} from "@/features/studio/server/quote-submission";
import { getSupabaseAdminConfigFromEnvironment } from "@/server/config/supabase";

const bucket = "reference-uploads";
const signedUploadLifetimeSeconds = 600;

function client(): SupabaseClient {
  const config = getSupabaseAdminConfigFromEnvironment();
  return createClient(config.SUPABASE_URL, config.SUPABASE_SECRET_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

function storagePath(intentId: string, referenceId: string): string {
  return `${intentId}/${referenceId}`;
}

export function createSupabaseStudioRepositories(): {
  quoteRepository: QuoteRepository;
  referenceRepository: ReferenceUploadRepository;
  consumeRateLimit(key: string, limit: number): Promise<boolean>;
} {
  const supabase = client();
  const quoteRepository: QuoteRepository = {
    async prepare(input) {
      const existing = await supabase.from("quote_requests").select("id, public_reference").eq("idempotency_key", input.idempotencyKey).maybeSingle();
      if (existing.error) throw new Error("provider_unavailable");
      if (existing.data) return { intentId: existing.data.id, publicReference: existing.data.public_reference, existing: true };
      const inserted = await supabase.from("quote_requests").insert({
        id: input.intentId,
        public_reference: input.publicReference,
        idempotency_key: input.idempotencyKey,
        status: "pending_upload",
        configuration: input.configuration,
        estimate_status: input.estimate.status,
        name: input.contact.name,
        email: input.contact.email,
        phone: input.contact.phone,
        company: input.contact.company,
        consented_at: new Date().toISOString(),
        privacy_policy_version: input.privacyPolicyVersion,
        expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      }).select("id, public_reference").single();
      if (inserted.error) throw new Error("provider_unavailable");
      return { intentId: inserted.data.id, publicReference: inserted.data.public_reference, existing: false };
    },
    async finalize(intentId) {
      const updated = await supabase.from("quote_requests").update({ status: "submitted", submitted_at: new Date().toISOString() }).eq("id", intentId).in("status", ["pending_upload", "submitted"]).select("public_reference").single();
      if (updated.error) throw new Error("provider_unavailable");
      return { status: "submitted", publicReference: updated.data.public_reference };
    },
    async findExpiredIntentIds(now) {
      const result = await supabase.from("quote_requests").select("id").lt("expires_at", now.toISOString());
      if (result.error) throw new Error("provider_unavailable");
      return result.data.map((row) => row.id);
    },
    async removeExpired(intentIds) {
      if (!intentIds.length) return;
      const result = await supabase.from("quote_requests").delete().in("id", intentIds);
      if (result.error) throw new Error("provider_unavailable");
    },
  };
  const referenceRepository: ReferenceUploadRepository = {
    async prepare(intentId, references) {
      if (!references.length) return [];
      const records = references.map((reference) => ({
        quote_request_id: intentId,
        reference_id: reference.id,
        object_path: storagePath(intentId, reference.id),
        original_file_name: reference.fileName,
        byte_length: reference.byteLength,
        status: "pending_upload",
        expires_at: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString(),
      }));
      const inserted = await supabase.from("reference_uploads").upsert(records, { onConflict: "quote_request_id,reference_id" });
      if (inserted.error) throw new Error("provider_unavailable");
      const grants = await Promise.all(references.map(async (reference) => {
        const path = storagePath(intentId, reference.id);
        const signed = await supabase.storage.from(bucket).createSignedUploadUrl(path, { upsert: false });
        if (signed.error || !signed.data) throw new Error("provider_unavailable");
        return { referenceId: reference.id, signedUploadUrl: signed.data.signedUrl, expiresAt: new Date(Date.now() + signedUploadLifetimeSeconds * 1000).toISOString() };
      }));
      return grants;
    },
    async verify(intentId) {
      const records = await supabase.from("reference_uploads").select("object_path, byte_length").eq("quote_request_id", intentId);
      if (records.error) throw new Error("provider_unavailable");
      if (!records.data.length) return true;
      for (const record of records.data) {
        const slash = record.object_path.lastIndexOf("/");
        const listed = await supabase.storage.from(bucket).list(record.object_path.slice(0, slash), { search: record.object_path.slice(slash + 1) });
        if (listed.error || !listed.data.some((file) => file.name === record.object_path.slice(slash + 1) && file.metadata?.size === record.byte_length)) return false;
      }
      const marked = await supabase.from("reference_uploads").update({ status: "quarantined" }).eq("quote_request_id", intentId);
      if (marked.error) throw new Error("provider_unavailable");
      return true;
    },
    async removeExpired(intentIds) {
      if (!intentIds.length) return;
      const records = await supabase.from("reference_uploads").select("object_path").in("quote_request_id", intentIds);
      if (records.error) throw new Error("provider_unavailable");
      if (records.data.length) {
        const removed = await supabase.storage.from(bucket).remove(records.data.map((record) => record.object_path));
        if (removed.error) throw new Error("provider_unavailable");
      }
    },
  };
  return {
    quoteRepository,
    referenceRepository,
    async consumeRateLimit(key, limit) {
      const result = await supabase.rpc("consume_studio_rate_limit", { p_key: key, p_limit: limit });
      if (result.error) throw new Error("provider_unavailable");
      return Boolean(result.data);
    },
  };
}
