import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import StudioPage from "./page";

const { getStudioServerConfiguration } = vi.hoisted(() => ({ getStudioServerConfiguration: vi.fn() }));

vi.mock("@/server/config/studio", () => ({ getStudioServerConfiguration }));

afterEach(() => {
  cleanup();
  getStudioServerConfiguration.mockReset();
});

describe("StudioPage", () => {
  it("describes enabled quote submission as available for manual review", () => {
    getStudioServerConfiguration.mockReturnValue({
      submissionEnabled: true,
      privacyPolicyVersion: "2026-07-20",
      capabilities: null,
    });

    render(<StudioPage />);

    expect(screen.getByText(/request can be submitted for manual review/i)).toBeVisible();
    expect(screen.queryByText(/quote submission is not available yet/i)).not.toBeInTheDocument();
  });
});
