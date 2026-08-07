import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SiteHeader } from "./site-header";

describe("SiteHeader", () => {
  it("keeps the wordmark, navigation, and account actions in distinct header zones", () => {
    render(<SiteHeader account={null} authenticationAvailable />);

    expect(screen.getByRole("link", { name: "Printaway home" })).toHaveClass("h-6");
    expect(screen.getByRole("link", { name: "Shop" })).toHaveClass("h-6");
    expect(screen.getByRole("button", { name: "Sign in with Google" })).toHaveClass("h-6");
    expect(screen.getByRole("link", { name: "Cart" }).parentElement).toHaveClass("justify-self-end");
    expect(screen.getByRole("link", { name: "Shop" }).parentElement).toHaveClass("justify-self-center");
  });
});
