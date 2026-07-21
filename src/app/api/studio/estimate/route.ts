import { NextRequest, NextResponse } from "next/server";

import { studioConfigurationSchema, validateStudioCapabilities } from "@/features/studio/domain/studio-configuration";
import { manualReviewEstimateService } from "@/features/studio/domain/studio-estimate";
import { createSupabaseStudioRepositories } from "@/server/adapters/supabase-studio";
import { hashRateLimitAddress } from "@/features/studio/server/quote-submission";
import { getStudioServerConfiguration } from "@/server/config/studio";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const configuration = studioConfigurationSchema.safeParse(await request.json().catch(() => null));
  if (!configuration.success) return NextResponse.json({ kind: "validation", code: "invalid_configuration" }, { status: 400 });
  const serverConfiguration = getStudioServerConfiguration();
  const issues = validateStudioCapabilities(configuration.data, serverConfiguration.capabilities);
  if (issues.length) return NextResponse.json({ kind: "validation", issues }, { status: 400 });
  if (!serverConfiguration.submissionEnabled) {
    return NextResponse.json({ status: "manual_review", values: null });
  }
  try {
    const secret = process.env["STUDIO_RATE_LIMIT_SECRET"]!;
    const repositories = createSupabaseStudioRepositories();
    const allowed = await repositories.consumeRateLimit(hashRateLimitAddress(request.headers.get("x-forwarded-for"), secret), 60);
    if (!allowed) return NextResponse.json({ kind: "rate_limited", retryAfterSeconds: 900 }, { status: 429 });
    return NextResponse.json(await manualReviewEstimateService.estimate(configuration.data));
  } catch {
    return NextResponse.json({ status: "unavailable", code: "service_unavailable", values: null }, { status: 503 });
  }
}
