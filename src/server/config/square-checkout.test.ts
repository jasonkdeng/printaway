import { describe, expect, it } from "vitest";

import { getSquareCheckoutConfig } from "./square-checkout";

describe("Square checkout configuration", () => {
  it("parses the complete server-only checkout configuration", () => {
    expect(getSquareCheckoutConfig({
      SQUARE_CHECKOUT_ENABLED: "true",
      SQUARE_CHECKOUT_RETURN_URL: "https://localhost:3000/checkout/return",
      SQUARE_WEBHOOK_NOTIFICATION_URL: "https://example.ngrok.app/api/webhooks/square",
      SQUARE_WEBHOOK_SIGNATURE_KEY: "signature-key",
    }).SQUARE_CHECKOUT_ENABLED).toBe(true);
  });

  it("rejects an incomplete or non-HTTPS production-style boundary", () => {
    expect(() => getSquareCheckoutConfig({
      SQUARE_CHECKOUT_ENABLED: "true",
      SQUARE_CHECKOUT_RETURN_URL: "not-a-url",
    })).toThrow();
  });
});
