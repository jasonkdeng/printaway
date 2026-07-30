import { describe, expect, it } from "vitest";

import { SupabaseCheckoutRepository } from "./supabase-checkout";

const order = {
  id: "3f111c51-3bb1-41e4-9f15-652bda63dc6b",
  accountId: "google-account",
  idempotencyKey: "3f111c51-3bb1-41e4-9f15-652bda63dc6c",
  squareOrderId: "square-order",
  paymentLinkId: "payment-link",
  paymentLinkUrl: "https://square.link/u/example",
  status: "pending" as const,
  cart: { lines: [] },
  fulfillment: { kind: "pickup" as const, pickupPointId: "waterloo-engineering-7" as const },
  merchandiseSubtotalMinor: 1300,
  shippingMinor: 0,
  currency: "CAD" as const,
};

const row = {
  id: order.id,
  account_id: order.accountId,
  idempotency_key: order.idempotencyKey,
  square_order_id: order.squareOrderId,
  square_payment_link_id: order.paymentLinkId,
  payment_link_url: order.paymentLinkUrl,
  status: order.status,
  cart_snapshot: order.cart,
  fulfillment_kind: "pickup",
  fulfillment_details: { pickupPointId: "waterloo-engineering-7" },
  merchandise_subtotal_minor: 1300,
  shipping_minor: 0,
  currency: "CAD",
};

describe("SupabaseCheckoutRepository", () => {
  it("maps provider rows without leaking provider field names", async () => {
    const repository = new SupabaseCheckoutRepository({
      findByIdempotencyKey: async () => row,
      create: async () => row,
      readStatus: async () => ({ id: order.id, status: "pending" }),
      recordPaymentEvent: async () => true,
      removeExpired: async () => 2,
    });

    await expect(repository.findByIdempotencyKey(order.accountId, order.idempotencyKey)).resolves.toEqual(order);
    await expect(repository.readStatus(order.accountId, order.id)).resolves.toEqual({ id: order.id, status: "pending" });
    await expect(repository.removeExpired(new Date("2026-07-28T12:00:00.000Z"))).resolves.toBe(2);
  });
});
