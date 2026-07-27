import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import MaterialsPage from "./page";

describe("Materials page", () => {
  it("publishes shared heat and indoor-use guidance", () => {
    render(<MaterialsPage />);

    expect(screen.getByRole("heading", { name: "Material reference" })).toBeVisible();
    expect(screen.getByText(/below 60°C/i)).toBeVisible();
    expect(screen.getByText(/below 80°C/i)).toBeVisible();
    expect(screen.getByText(/Indoor use/i)).toBeVisible();
  });
});
