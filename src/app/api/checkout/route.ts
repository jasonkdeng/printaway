import { randomUUID } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { checkoutRequestSchema } from "@/features/cart/domain/checkout";
import { revalidateAccountCartLines } from "@/features/cart/server/account-cart-api";
import { createCheckoutService } from "@/features/cart/server/checkout-service";
import { getSquarePrintFinishModifierIdsFromEnvironment } from "@/features/shop/server/square-print-finish-config";
import { getSquareVariationIdsFromEnvironment } from "@/features/shop/server/square-variation-config";
import { SquareCheckoutAdapter, SquareCheckoutError } from "@/server/adapters/square-checkout";
import { createSupabaseCartRepository } from "@/server/adapters/supabase-cart";
import { createSupabaseCheckoutRepository } from "@/server/adapters/supabase-checkout";
import { getAccountSession } from "@/server/auth/account-session";
import { getSquareServerConfigFromEnvironment } from "@/server/config/square";
import { getOptionalSquareCheckoutConfigFromEnvironment } from "@/server/config/square-checkout";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const config = getOptionalSquareCheckoutConfigFromEnvironment();
  if (!config?.SQUARE_CHECKOUT_ENABLED) {
    return NextResponse.json({ kind: "checkout_unavailable" }, { status: 503 });
  }
  const payload = checkoutRequestSchema.safeParse(await request.json().catch(() => null));
  if (!payload.success) {
    return NextResponse.json({ kind: "invalid_checkout", issues: payload.error.issues.map((issue) => ({ path: issue.path, message: issue.message })) }, { status: 400 });
  }

  try {
    const adapter = new SquareCheckoutAdapter(
      getSquareServerConfigFromEnvironment(),
      getSquareVariationIdsFromEnvironment(),
      getSquarePrintFinishModifierIdsFromEnvironment(),
    );
    const service = createCheckoutService({
      getAccount: getAccountSession,
      cartRepository: createSupabaseCartRepository(),
      checkoutRepository: createSupabaseCheckoutRepository(),
      revalidate: revalidateAccountCartLines,
      paymentLinkGateway: adapter,
      checkoutReturnUrl: config.SQUARE_CHECKOUT_RETURN_URL,
      createCheckoutId: randomUUID,
    });
    const result = await service.create(payload.data);
    return NextResponse.json(result.body, { status: result.status });
  } catch (error) {
    if (error instanceof SquareCheckoutError && error.code === "catalog_mismatch") {
      return NextResponse.json({ kind: "catalog_mismatch" }, { status: 409 });
    }
    return NextResponse.json({ kind: "checkout_unavailable" }, { status: 503 });
  }
}
