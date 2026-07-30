import { NextRequest, NextResponse } from "next/server";

import { createSupabaseStudioRepositories } from "@/server/adapters/supabase-studio";
import { createSupabaseCheckoutRepository } from "@/server/adapters/supabase-checkout";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (!process.env["CRON_SECRET"] || authorization !== `Bearer ${process.env["CRON_SECRET"]}`) {
    return new NextResponse(null, { status: 401 });
  }
  try {
    const repositories = createSupabaseStudioRepositories();
    const intentIds = await repositories.quoteRepository.findExpiredIntentIds(new Date());
    await repositories.referenceRepository.removeExpired(intentIds);
    await repositories.quoteRepository.removeExpired(intentIds);
    const checkoutOrdersRemoved = await createSupabaseCheckoutRepository().removeExpired(new Date());
    return NextResponse.json({ quoteRequestsRemoved: intentIds.length, checkoutOrdersRemoved });
  } catch {
    return NextResponse.json({ kind: "provider_unavailable", operation: "retention" }, { status: 503 });
  }
}
