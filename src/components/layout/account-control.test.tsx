import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountControl } from "./account-control";

const { signOut } = vi.hoisted(() => ({ signOut: vi.fn() }));

vi.mock("next-auth/react", () => ({ signOut }));

afterEach(() => {
  cleanup();
  signOut.mockReset();
});

describe("AccountControl", () => {
  it("provides a direct Google sign-in action to anonymous visitors", () => {
    render(<AccountControl account={null} authenticationAvailable />);

    const signIn = screen.getByRole("link", { name: "Sign in with Google" });
    expect(signIn).toHaveAttribute(
      "href",
      "/api/auth/signin/google?callbackUrl=%2Fcart",
    );
    expect(signIn).toHaveClass("h-6", "bg-white", "font-body");
    expect(screen.getByTestId("google-logo")).toHaveAttribute("viewBox", "0 0 18 18");
  });

  it("identifies the signed-in account and provides sign-out", async () => {
    const user = userEvent.setup();
    render(<AccountControl account={{ accountId: "google-subject-123", email: "avery@example.ca" }} authenticationAvailable />);

    expect(screen.getByText("avery@example.ca")).toBeVisible();
    await user.click(screen.getByRole("button", { name: "Sign out" }));

    expect(signOut).toHaveBeenCalledWith({ callbackUrl: "/" });
  });

  it("does not advertise account sign-in when required OAuth configuration is unavailable", () => {
    render(<AccountControl account={null} authenticationAvailable={false} />);

    expect(screen.queryByRole("link", { name: "Sign in with Google" })).not.toBeInTheDocument();
  });
});
