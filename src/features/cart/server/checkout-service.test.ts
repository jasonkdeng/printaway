import { describe, expect, it } from "vitest";

import type { CartLine } from "../domain/cart";
import { createCheckoutService } from "./checkout-service";

const line: CartLine = {
  id: "monitor-riser:Matte:white",
  productId: "monitor-riser",
  name: "Monitor Riser",
  finish: "Matte",
  colour: "white",
  quantity: 1,
  maximumQuantity: 4,
  unitPrice: { amountMinor: 1300, currency: "CAD" },
};

function dependencies() {
  let saved = { lines: [line] };
  return {
    getAccount: async () => ({ accountId: "google-account", email: "buyer@example.ca" }),
    cartRepository: {
      read: async () => saved,
      replace: async (_accountId: string, lines: readonly CartLine[]) => {
        saved = { lines: [...lines] };
        return saved;
      },
    },
    checkoutRepository: {
      findByIdempotencyKey: async () => null,
      create: async (order: never) => order,
      readStatus: async () => null,
      recordPaymentEvent: async () => undefined,
      removeExpired: async () => 0,
    },
    revalidate: async (lines: readonly CartLine[]) => ({ lines }),
    paymentLinkGateway: {
      createPaymentLink: async () => ({
        paymentLinkId: "link-id",
        squareOrderId: "order-id",
        url: "https://square.link/u/example",
      }),
    },
    checkoutReturnUrl: "https://localhost:3000/checkout/return",
    createCheckoutId: () => "3f111c51-3bb1-41e4-9f15-652bda63dc6b",
  };
}

describe("checkout service", () => {
  it("requires an authenticated account", async () => {
    const deps = dependencies();
    const service = createCheckoutService({ ...deps, getAccount: async () => null });
    await expect(service.create({
      idempotencyKey: "3f111c51-3bb1-41e4-9f15-652bda63dc6c",
      fulfillment: { kind: "pickup", pickupPointId: "waterloo-engineering-7" },
    })).resolves.toEqual({ status: 401, body: { kind: "unauthorized" } });
  });

  it("creates an itemized payment link and persists its Square order reference", async () => {
    let created: unknown;
    const deps = dependencies();
    const service = createCheckoutService({
      ...deps,
      checkoutRepository: {
        ...deps.checkoutRepository,
        create: async (order) => {
          created = order;
          return order;
        },
      },
    });
    await expect(service.create({
      idempotencyKey: "3f111c51-3bb1-41e4-9f15-652bda63dc6c",
      fulfillment: { kind: "shipping", postalCode: "N2L3G1" },
    })).resolves.toEqual({
      status: 200,
      body: { kind: "ready", checkoutId: "3f111c51-3bb1-41e4-9f15-652bda63dc6b", url: "https://square.link/u/example" },
    });
    expect(created).toMatchObject({
      squareOrderId: "order-id",
      shippingMinor: 500,
      merchandiseSubtotalMinor: 1300,
    });
  });

  it("updates the account cart and requires review when revalidation changes it", async () => {
    const deps = dependencies();
    const service = createCheckoutService({ ...deps, revalidate: async () => ({ lines: [] }) });
    await expect(service.create({
      idempotencyKey: "3f111c51-3bb1-41e4-9f15-652bda63dc6c",
      fulfillment: { kind: "pickup", pickupPointId: "markham-pacific-mall" },
    })).resolves.toEqual({ status: 409, body: { kind: "cart_changed", cart: { lines: [] } } });
  });
});
