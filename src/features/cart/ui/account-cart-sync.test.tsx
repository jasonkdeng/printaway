import { render, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { AccountCartSync } from "./account-cart-sync";

const line = { id: "monitor-riser:Default:white", productId: "monitor-riser", name: "Monitor Riser", finish: "Default", colour: "white", quantity: 1, maximumQuantity: 3, unitPrice: { amountMinor: 500, currency: "CAD" as const } };
const cart = { getSnapshot: vi.fn(() => ({ lines: [line] })), replace: vi.fn() };

vi.mock("./browser-cart-store", () => ({ useCart: () => cart }));

afterEach(() => {
  vi.unstubAllGlobals();
  window.sessionStorage.clear();
  cart.getSnapshot.mockClear();
  cart.replace.mockClear();
});

describe("AccountCartSync", () => {
  it("merges the anonymous cart into an empty signed-in cart before replacing local state", async () => {
    const fetchMock = vi.fn()
      .mockResolvedValueOnce(Response.json({ lines: [] }))
      .mockResolvedValueOnce(Response.json({ lines: [line] }));
    vi.stubGlobal("fetch", fetchMock);

    render(<AccountCartSync accountId="google-subject-123" />);

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock).toHaveBeenLastCalledWith("/api/cart", expect.objectContaining({ method: "PUT" }));
    expect(cart.replace).toHaveBeenCalledWith({ lines: [line] });
  });

  it("clears a cached account cart when no account is available", async () => {
    window.sessionStorage.setItem("printaway-account-cart-subject-v1", "google-subject-123");
    const clear = vi.fn();
    Object.assign(cart, { clear });

    render(<AccountCartSync accountId={null} />);

    await waitFor(() => expect(clear).toHaveBeenCalled());
    expect(window.sessionStorage.getItem("printaway-account-cart-subject-v1")).toBeNull();
    delete (cart as { clear?: () => void }).clear;
  });
});
