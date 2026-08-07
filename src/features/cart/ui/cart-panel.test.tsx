import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it } from "vitest";

import { CartPanel } from "./cart-panel";

const cart = {
  lines: [{
    id: "monitor-riser:Matte:white",
    productId: "monitor-riser",
    name: "Monitor Riser",
    finish: "Matte",
    colour: "white",
    quantity: 1,
    maximumQuantity: 4,
    unitPrice: { amountMinor: 1300, currency: "CAD" },
  }],
};

describe("CartPanel", () => {
  beforeEach(() => {
    window.sessionStorage.setItem("printaway-cart-v1", JSON.stringify(cart));
  });

  afterEach(() => {
    window.sessionStorage.clear();
  });

  it("presents accessible fulfillment choices, approved pickup points, and shipping totals", async () => {
    const user = userEvent.setup();
    render(<CartPanel signedIn />);

    expect(screen.getByRole("group", { name: "Fulfillment" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Engineering 7 First Floor C&D/ })).toBeInTheDocument();
    expect(screen.getByText("Merchandise subtotal")).toBeInTheDocument();
    expect(screen.getAllByText("$13.00")).toHaveLength(2);

    await user.click(screen.getByRole("radio", { name: "Shipping" }));

    expect(screen.getByRole("textbox", { name: /Shipping postal code/ })).toBeInTheDocument();
    expect(screen.getByText("$18.00")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue to checkout" })).toBeEnabled();
  });
});
