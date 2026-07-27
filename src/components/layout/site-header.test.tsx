import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("uses one control height for the wordmark, navigation, and sign-in action", () => {
    render(<SiteHeader account={null} authenticationAvailable />);

    expect(screen.getByRole("link", { name: "Printaway home" })).toHaveClass("h-6");
    expect(screen.getByRole("link", { name: "Shop" })).toHaveClass("h-6");
    expect(screen.getByRole("link", { name: "Sign in with Google" })).toHaveClass("h-6");
  });
});
