import { describe, expect, it } from "vitest";

import { CartStore, cartSubtotal } from "./cart";

const line = {
  productId: "monitor-riser",
  name: "Monitor Riser",
  finish: "Default",
  colour: "white",
  unitPrice: { amountMinor: 500, currency: "CAD" as const },
  maximumQuantity: 3,
};

describe("CartStore", () => {
  it("merges matching lines without exceeding the available quantity", () => {
    const cart = new CartStore();

    cart.add({ ...line, quantity: 2 });
    cart.add({ ...line, quantity: 2 });

    expect(cart.getSnapshot().lines).toEqual([{ ...line, id: "monitor-riser:Default:white", quantity: 3 }]);
  });

  it("updates quantities within the supported 1–10 and inventory range", () => {
    const cart = new CartStore();
    cart.add({ ...line, quantity: 1 });

    cart.updateQuantity("monitor-riser:Default:white", 10);

    expect(cart.getSnapshot().lines[0]?.quantity).toBe(3);
  });

  it("removes lines and calculates a CAD minor-unit subtotal", () => {
    const cart = new CartStore();
    cart.add({ ...line, quantity: 2 });

    expect(cartSubtotal(cart.getSnapshot().lines)).toEqual({ amountMinor: 1000, currency: "CAD" });

    cart.remove("monitor-riser:Default:white");
    expect(cart.getSnapshot().lines).toEqual([]);
  });

  it("replaces the snapshot when an account cart is restored", () => {
    const cart = new CartStore();
    cart.add({ ...line, quantity: 1 });

    cart.replace({ lines: [{ ...line, id: "monitor-riser:Default:white", quantity: 3 }] });

    expect(cart.getSnapshot().lines).toEqual([{ ...line, id: "monitor-riser:Default:white", quantity: 3 }]);
  });
});
