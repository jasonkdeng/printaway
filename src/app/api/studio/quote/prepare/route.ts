import { NextRequest, NextResponse } from "next/server";

import { manualReviewEstimateService } from "@/features/studio/domain/studio-estimate";
import { hashRateLimitAddress, createQuoteSubmissionService, prepareQuoteRequestSchema } from "@/features/studio/server/quote-submission";
import { createSupabaseStudioRepositories } from "@/server/adapters/supabase-studio";
import { getStudioServerConfiguration } from "@/server/config/studio";
import { validateStudioCapabilities } from "@/features/studio/domain/studio-configuration";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const configuration = getStudioServerConfiguration();
  if (!configuration.submissionEnabled || !configuration.privacyPolicyVersion) {
    return NextResponse.json({ kind: "provider_unavailable", operation: "quote_submission" }, { status: 503 });
  }
  const input = prepareQuoteRequestSchema.safeParse(await request.json().catch(() => null));
  if (!input.success) return NextResponse.json({ kind: "validation", code: "invalid_request" }, { status: 400 });
  const issues = validateStudioCapabilities(input.data.configuration, configuration.capabilities);
  if (issues.length) return NextResponse.json({ kind: "validation", issues }, { status: 400 });
  try {
    const repositories = createSupabaseStudioRepositories();
    const allowed = await repositories.consumeRateLimit(
      hashRateLimitAddress(request.headers.get("x-forwarded-for"), process.env["STUDIO_RATE_LIMIT_SECRET"]!),
      10,
    );
    if (!allowed) return NextResponse.json({ kind: "rate_limited", retryAfterSeconds: 900 }, { status: 429 });
    const service = createQuoteSubmissionService({
      ...repositories,
      privacyPolicyVersion: configuration.privacyPolicyVersion,
      estimate: await manualReviewEstimateService.estimate(input.data.configuration),
    });
    return NextResponse.json(await service.prepare(input.data));
  } catch {
    return NextResponse.json({ kind: "provider_unavailable", operation: "quote_submission" }, { status: 503 });
  }
}
