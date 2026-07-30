import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";

import { z } from "zod";

const squarePaymentUpdatedEventSchema = z.object({
  event_id: z.string().min(1),
  type: z.literal("payment.updated"),
  created_at: z.string().datetime(),
  data: z.object({
    object: z.object({
      payment: z.object({
        id: z.string().min(1),
        order_id: z.string().min(1),
        status: z.string().min(1),
      }),
    }),
  }),
});

export type SquarePaymentUpdatedEvent = {
  eventId: string;
  eventType: "payment.updated";
  occurredAt: string;
  squarePaymentId: string;
  squareOrderId: string;
  paymentStatus: string;
};

export function verifySquareWebhookSignature(input: {
  rawBody: string;
  signature: string | null;
  signatureKey: string;
  notificationUrl: string;
}): boolean {
  if (!input.signature) return false;
  const expected = createHmac("sha256", input.signatureKey)
    .update(input.notificationUrl + input.rawBody)
    .digest();
  let received: Buffer;
  try {
    received = Buffer.from(input.signature, "base64");
  } catch {
    return false;
  }
  return expected.length === received.length && timingSafeEqual(expected, received);
}

export function parseSquarePaymentUpdatedEvent(value: unknown): SquarePaymentUpdatedEvent | null {
  const parsed = squarePaymentUpdatedEventSchema.safeParse(value);
  if (!parsed.success) return null;
  return {
    eventId: parsed.data.event_id,
    eventType: parsed.data.type,
    occurredAt: parsed.data.created_at,
    squarePaymentId: parsed.data.data.object.payment.id,
    squareOrderId: parsed.data.data.object.payment.order_id,
    paymentStatus: parsed.data.data.object.payment.status,
  };
}
