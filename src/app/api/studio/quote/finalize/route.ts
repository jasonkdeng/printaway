import { NextRequest, NextResponse } from "next/server";

import { createQuoteSubmissionService, finalizeQuoteRequestSchema } from "@/features/studio/server/quote-submission";
import { createSupabaseStudioRepositories } from "@/server/adapters/supabase-studio";
import { getStudioServerConfiguration } from "@/server/config/studio";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const configuration = getStudioServerConfiguration();
  if (!configuration.submissionEnabled || !configuration.privacyPolicyVersion) {
    return NextResponse.json({ kind: "provider_unavailable", operation: "quote_submission" }, { status: 503 });
  }
  const input = finalizeQuoteRequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ kind: "validation", code: "invalid_request" }, { status: 400 });
  try {
    const repositories = createSupabaseStudioRepositories();
    const service = createQuoteSubmissionService({ ...repositories, privacyPolicyVersion: configuration.privacyPolicyVersion, estimate: { status: "manual_review", values: null } });
    return NextResponse.json(await service.finalize(input.data));
  } catch (error) {
    const code = error instanceof Error && error.message === "incomplete_uploads" ? "incomplete_uploads" : "provider_unavailable";
    return NextResponse.json({ kind: code === "incomplete_uploads" ? "validation" : "provider_unavailable", code }, { status: code === "incomplete_uploads" ? 409 : 503 });
  }
}
