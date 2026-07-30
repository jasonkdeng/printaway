import { NextRequest, NextResponse } from "next/server";

import { parseSquarePaymentUpdatedEvent, verifySquareWebhookSignature } from "@/server/adapters/square-webhook";
import { createSupabaseCheckoutRepository } from "@/server/adapters/supabase-checkout";
import { getOptionalSquareCheckoutConfigFromEnvironment } from "@/server/config/square-checkout";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const config = getOptionalSquareCheckoutConfigFromEnvironment();
  if (!config) return NextResponse.json({ kind: "webhook_unavailable" }, { status: 503 });

  const rawBody = await request.text();
  const valid = verifySquareWebhookSignature({
    rawBody,
    signature: request.headers.get("x-square-hmacsha256-signature"),
    signatureKey: config.SQUARE_WEBHOOK_SIGNATURE_KEY,
    notificationUrl: config.SQUARE_WEBHOOK_NOTIFICATION_URL,
  });
  if (!valid) return NextResponse.json({ kind: "invalid_signature" }, { status: 403 });

  let parsedBody: unknown;
  try {
    parsedBody = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ kind: "invalid_event" }, { status: 400 });
  }
  const event = parseSquarePaymentUpdatedEvent(parsedBody);
  if (!event) return NextResponse.json({ received: true });

  try {
    await createSupabaseCheckoutRepository().recordPaymentEvent(event);
    return NextResponse.json({ received: true });
  } catch {
    return NextResponse.json({ kind: "webhook_processing_failed" }, { status: 500 });
  }
}
