import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountControl } from "./account-control";

const { signIn, signOut } = vi.hoisted(() => ({ signIn: vi.fn(), signOut: vi.fn() }));

vi.mock("next-auth/react", () => ({ signIn, signOut }));

afterEach(() => {
  cleanup();
  signIn.mockReset();
  signOut.mockReset();
});

describe("AccountControl", () => {
  it("starts Google OAuth directly for anonymous visitors", async () => {
    const user = userEvent.setup();
    render(<AccountControl account={null} authenticationAvailable />);

    const signInControl = screen.getByRole("button", { name: "Sign in with Google" });
    expect(signInControl).toHaveClass("h-6", "rounded-[8px]", "bg-[#131314]", "font-body");
    expect(screen.getByTestId("google-logo")).toHaveClass("size-3");
    expect(screen.getByTestId("google-logo")).toHaveAttribute("viewBox", "0 0 18 18");
    await user.click(signInControl);
    expect(signIn).toHaveBeenCalledWith("google", { callbackUrl: "/cart" });
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

    expect(screen.queryByRole("button", { name: "Sign in with Google" })).not.toBeInTheDocument();
  });
});
