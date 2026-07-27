import { NextRequest, NextResponse } from "next/server";

import { createAccountCartHandlers, revalidateAccountCartLines } from "@/features/cart/server/account-cart-api";
import { createSupabaseCartRepository } from "@/server/adapters/supabase-cart";
import { getAccountSession } from "@/server/auth/account-session";

export const runtime = "nodejs";

function handlers() {
  return createAccountCartHandlers({ getAccount: getAccountSession, revalidate: revalidateAccountCartLines, repository: createSupabaseCartRepository() });
}

export async function GET() {
  const result = await handlers().read();
  return NextResponse.json(result.body, { status: result.status });
}

export async function PUT(request: NextRequest) {
  const result = await handlers().replace(await request.json().catch(() => null));
  return NextResponse.json(result.body, { status: result.status });
}
