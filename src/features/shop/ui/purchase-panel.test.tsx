import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { PurchasePanel } from "./purchase-panel";

describe("PurchasePanel", () => {
  it("groups labelled controls, caps quantity, and announces the selected configuration", async () => {
    const user = userEvent.setup();

    render(
      <PurchasePanel
        colours={["Bone", "Graphite"]}
        finishes={["Matte", "Glossy"]}
        maximumQuantity={12}
        name="Monitor Riser"
        productId="monitor-riser"
        unitPrice={{ amountMinor: 12900, currency: "CAD" }}
      />,
    );

    expect(
      screen.getByRole("group", { name: "Select a configuration" }),
    ).toBeInTheDocument();

    const finish = screen.getByRole("combobox", { name: "Finish" });
    const colour = screen.getByRole("combobox", { name: "Colour" });
    const quantity = screen.getByRole("combobox", { name: "Quantity" });

    expect(quantity).toHaveTextContent("10");
    expect(quantity.querySelectorAll("option")).toHaveLength(10);

    await user.selectOptions(finish, "Glossy");
    await user.selectOptions(colour, "Graphite");
    await user.selectOptions(quantity, "3");
    await user.click(screen.getByRole("button", { name: "Add to cart" }));

    expect(finish).toHaveValue("Glossy");
    expect(colour).toHaveValue("Graphite");
    expect(quantity).toHaveValue("3");
    expect(screen.getByRole("status")).toHaveTextContent(
      "Added Monitor Riser to cart.",
    );
  });
});
