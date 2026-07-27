import { describe, expect, it } from "vitest";

import type { CartLine } from "../domain/cart";
import { createAccountCartHandlers } from "./account-cart-api";

const line: CartLine = {
  id: "monitor-riser:Default:white",
  productId: "monitor-riser",
  name: "Monitor Riser",
  finish: "Default",
  colour: "white",
  quantity: 2,
  maximumQuantity: 3,
  unitPrice: { amountMinor: 500, currency: "CAD" },
};

describe("createAccountCartHandlers", () => {
  it("does not expose an account cart to an anonymous request", async () => {
    const handlers = createAccountCartHandlers({
      getAccount: async () => null,
      revalidate: async (lines) => ({ lines }),
      repository: { read: async () => ({ lines: [] }), replace: async () => ({ lines: [] }) },
    });

    await expect(handlers.read()).resolves.toEqual({ status: 401, body: { kind: "unauthorized" } });
  });

  it("normalizes and persists a signed-in cart", async () => {
    let saved: readonly CartLine[] = [];
    const handlers = createAccountCartHandlers({
      getAccount: async () => ({ accountId: "google-subject-123", email: "avery@example.ca" }),
      revalidate: async (lines) => ({ lines }),
      repository: {
        read: async () => ({ lines: saved }),
        replace: async (_accountId, lines) => {
          saved = lines;
          return { lines };
        },
      },
    });

    await expect(handlers.replace({ lines: [line, { ...line, quantity: 2 }] })).resolves.toEqual({
      status: 200,
      body: { lines: [{ ...line, quantity: 3 }] },
    });
  });

  it("uses server-revalidated lines instead of client-provided prices or stock", async () => {
    const verified = { ...line, maximumQuantity: 1, unitPrice: { amountMinor: 700, currency: "CAD" as const } };
    const handlers = createAccountCartHandlers({
      getAccount: async () => ({ accountId: "google-subject-123", email: null }),
      revalidate: async () => ({ lines: [verified] }),
      repository: { read: async () => ({ lines: [] }), replace: async (_accountId, lines) => ({ lines }) },
    });

    await expect(handlers.replace({ lines: [{ ...line, maximumQuantity: 10, unitPrice: { amountMinor: 1, currency: "CAD" } }] })).resolves.toEqual({
      status: 200,
      body: { lines: [verified] },
    });
  });
});
