import { NextRequest, NextResponse } from "next/server";

import { createSupabaseStudioRepositories } from "@/server/adapters/supabase-studio";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!process.env["STUDIO_CRON_SECRET"] || authorization !== `Bearer ${process.env["STUDIO_CRON_SECRET"]}`) {
    return new NextResponse(null, { status: 401 });
  }
  try {
    const repositories = createSupabaseStudioRepositories();
    const intentIds = await repositories.quoteRepository.findExpiredIntentIds(new Date());
    await repositories.referenceRepository.removeExpired(intentIds);
    await repositories.quoteRepository.removeExpired(intentIds);
    return NextResponse.json({ removed: intentIds.length });
  } catch {
    return NextResponse.json({ kind: "provider_unavailable", operation: "retention" }, { status: 503 });
  }
}
