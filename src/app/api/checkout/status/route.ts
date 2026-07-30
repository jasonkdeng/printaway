import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { createSupabaseCheckoutRepository } from "@/server/adapters/supabase-checkout";
import { getAccountSession } from "@/server/auth/account-session";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const account = await getAccountSession();
  if (!account) return NextResponse.json({ kind: "unauthorized" }, { status: 401 });
  const checkoutId = z.uuid().safeParse(request.nextUrl.searchParams.get("checkout"));
  if (!checkoutId.success) return NextResponse.json({ kind: "invalid_checkout" }, { status: 400 });

  try {
    const status = await createSupabaseCheckoutRepository().readStatus(account.accountId, checkoutId.data);
    if (!status) return NextResponse.json({ kind: "not_found" }, { status: 404 });
    return NextResponse.json(status);
  } catch {
    return NextResponse.json({ kind: "status_unavailable" }, { status: 503 });
  }
}
