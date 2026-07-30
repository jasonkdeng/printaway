import { createHmac } from "node:crypto";

import { describe, expect, it } from "vitest";

import { parseSquarePaymentUpdatedEvent, verifySquareWebhookSignature } from "./square-webhook";

describe("Square webhook boundary", () => {
  it("validates the signature using the exact notification URL and raw body", () => {
    const rawBody = "{\"type\":\"payment.updated\"}";
    const notificationUrl = "https://example.test/api/webhooks/square";
    const signatureKey = "signature-key";
    const signature = createHmac("sha256", signatureKey).update(notificationUrl + rawBody).digest("base64");

    expect(verifySquareWebhookSignature({ rawBody, notificationUrl, signatureKey, signature })).toBe(true);
    expect(verifySquareWebhookSignature({ rawBody: `${rawBody} `, notificationUrl, signatureKey, signature })).toBe(false);
  });

  it("maps a completed payment event without exposing the provider payload", () => {
    expect(parseSquarePaymentUpdatedEvent({
      event_id: "event-id",
      type: "payment.updated",
      created_at: "2026-07-28T12:00:00.000Z",
      data: { object: { payment: { id: "payment-id", order_id: "order-id", status: "COMPLETED" } } },
    })).toEqual({
      eventId: "event-id",
      eventType: "payment.updated",
      occurredAt: "2026-07-28T12:00:00.000Z",
      squarePaymentId: "payment-id",
      squareOrderId: "order-id",
      paymentStatus: "COMPLETED",
    });
  });
});
