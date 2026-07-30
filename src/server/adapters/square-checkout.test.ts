import { describe, expect, it } from "vitest";

import { SquareCheckoutAdapter } from "./square-checkout";

const config = {
  SQUARE_APPLICATION_ID: "app-id",
  SQUARE_LOCATION_ID: "location-id",
  SQUARE_ACCESS_TOKEN: "access-token",
  SQUARE_ENVIRONMENT: "sandbox" as const,
};
const variations = {
  "monitor-riser": "monitor-variation",
  "desk-tray": "tray-variation",
  "coat-hanger": "hanger-variation",
  "keycap-fidget": "keycap-variation",
};
const modifiers = { Matte: "matte-modifier", Glossy: "glossy-modifier" };
const line = {
  productId: "monitor-riser",
  finish: "Matte",
  colour: "white",
  quantity: 2,
  unitPrice: { amountMinor: 1300, currency: "CAD" as const },
};

describe("SquareCheckoutAdapter", () => {
  it("validates Square catalog pricing and creates an itemized hosted payment link", async () => {
    const requests: Array<{ url: string; init?: RequestInit }> = [];
    const fetchImplementation = async (input: URL | RequestInfo, init?: RequestInit): Promise<Response> => {
      const url = input.toString();
      requests.push({ url, init });
      if (url.endsWith("/monitor-variation")) {
        return Response.json({ object: { id: "monitor-variation", type: "ITEM_VARIATION", item_variation_data: { price_money: { amount: 1200, currency: "CAD" } } } });
      }
      if (url.endsWith("/matte-modifier")) {
        return Response.json({ object: { id: "matte-modifier", type: "MODIFIER", modifier_data: { name: "Matte", price_money: { amount: 100, currency: "CAD" } } } });
      }
      return Response.json({ payment_link: { id: "link-id", order_id: "order-id", url: "https://sandbox.square.link/u/example" } });
    };
    const adapter = new SquareCheckoutAdapter(config, variations, modifiers, fetchImplementation as typeof fetch);

    await expect(adapter.createPaymentLink({
      checkoutId: "checkout-id",
      idempotencyKey: "idempotency-key",
      buyerEmail: "buyer@example.ca",
      lines: [line],
      fulfillment: { kind: "shipping", postalCode: "N2L3G1" },
      shippingFee: { amountMinor: 500, currency: "CAD" },
      redirectUrl: "https://localhost:3000/checkout/return",
    })).resolves.toEqual({ paymentLinkId: "link-id", squareOrderId: "order-id", url: "https://sandbox.square.link/u/example" });

    const createRequest = requests.at(-1);
    expect(createRequest?.url).toBe("https://connect.squareupsandbox.com/v2/online-checkout/payment-links");
    expect(createRequest?.init?.headers).toMatchObject({ "Square-Version": "2026-07-15" });
    expect(JSON.parse(String(createRequest?.init?.body))).toMatchObject({
      idempotency_key: "idempotency-key",
      order: {
        location_id: "location-id",
        reference_id: "checkout-id",
        line_items: [{
          quantity: "2",
          catalog_object_id: "monitor-variation",
          note: "Colour: white",
          modifiers: [{ catalog_object_id: "matte-modifier" }],
        }],
      },
      checkout_options: {
        allow_tipping: false,
        ask_for_shipping_address: true,
        shipping_fee: { name: "Shipping", charge: { amount: 500, currency: "CAD" } },
      },
    });
  });

  it("fails closed when the Square catalog price differs from the approved price", async () => {
    const adapter = new SquareCheckoutAdapter(config, variations, modifiers, (async (input: URL | RequestInfo) => {
      if (input.toString().endsWith("/monitor-variation")) {
        return Response.json({ object: { id: "monitor-variation", type: "ITEM_VARIATION", item_variation_data: { price_money: { amount: 999, currency: "CAD" } } } });
      }
      return Response.json({ object: { id: "matte-modifier", type: "MODIFIER", modifier_data: { name: "Matte", price_money: { amount: 100, currency: "CAD" } } } });
    }) as typeof fetch);

    await expect(adapter.createPaymentLink({
      checkoutId: "checkout-id",
      idempotencyKey: "idempotency-key",
      buyerEmail: null,
      lines: [line],
      fulfillment: { kind: "pickup", pickupPointId: "waterloo-engineering-7" },
      shippingFee: { amountMinor: 0, currency: "CAD" },
      redirectUrl: "https://localhost:3000/checkout/return",
    })).rejects.toHaveProperty("code", "catalog_mismatch");
  });

  it("creates a base-price line without a Square modifier for the included standard finish", async () => {
    const requests: string[] = [];
    const adapter = new SquareCheckoutAdapter(config, variations, modifiers, (async (input: URL | RequestInfo) => {
      const url = input.toString();
      requests.push(url);
      if (url.endsWith("/monitor-variation")) {
        return Response.json({ object: { id: "monitor-variation", type: "ITEM_VARIATION", item_variation_data: { price_money: { amount: 1200, currency: "CAD" } } } });
      }
      return Response.json({ payment_link: { id: "link-id", order_id: "order-id", url: "https://sandbox.square.link/u/example" } });
    }) as typeof fetch);

    await adapter.createPaymentLink({
      checkoutId: "checkout-id",
      idempotencyKey: "idempotency-key",
      buyerEmail: null,
      lines: [{ ...line, finish: "Standard", unitPrice: { amountMinor: 1200, currency: "CAD" } }],
      fulfillment: { kind: "pickup", pickupPointId: "waterloo-engineering-7" },
      shippingFee: { amountMinor: 0, currency: "CAD" },
      redirectUrl: "https://localhost:3000/checkout/return",
    });

    expect(requests).toEqual([
      "https://connect.squareupsandbox.com/v2/catalog/object/monitor-variation",
      "https://connect.squareupsandbox.com/v2/online-checkout/payment-links",
    ]);
  });
});
