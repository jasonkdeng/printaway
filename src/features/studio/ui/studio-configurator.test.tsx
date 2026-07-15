import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";

import { StudioConfigurator } from "./studio-configurator";

afterEach(cleanup);

describe("StudioConfigurator", () => {
  it("completes all six steps, updates the readout, and preserves reviewed input", async () => {
    const user = userEvent.setup();
    render(<StudioConfigurator />);

    expect(screen.getAllByRole("button", { name: /Step \d of 6/ })).toHaveLength(6);
    expect(screen.getByRole("heading", { name: "Add a reference" })).toBeVisible();
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(3);
    expect(screen.getByText("Manual review required")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Continue to material" }));
    expect(screen.getByRole("alert")).toHaveFocus();
    expect(screen.getAllByText("Describe the object or choose a supported reference file.")).toHaveLength(2);

    await user.type(screen.getByLabelText("Project description"), "A replacement bracket.");
    await user.click(screen.getByRole("button", { name: "Continue to material" }));
    expect(screen.getByRole("heading", { name: "Choose a material" })).toBeVisible();

    await user.selectOptions(screen.getByLabelText("Material preference"), "PLA");
    await user.click(screen.getByRole("button", { name: "Continue to size" }));
    await user.type(screen.getByLabelText("Length (mm)"), "120");
    await user.type(screen.getByLabelText("Width (mm)"), "80");
    await user.type(screen.getByLabelText("Height (mm)"), "30");
    await user.click(screen.getByRole("button", { name: "Continue to finish" }));

    await user.selectOptions(screen.getByLabelText("Finish preference"), "Glossy");
    await user.click(screen.getByRole("button", { name: "Continue to quantity" }));
    await user.clear(screen.getByLabelText("Quantity"));
    await user.type(screen.getByLabelText("Quantity"), "25");
    await user.click(screen.getByRole("button", { name: "Continue to review" }));

    expect(screen.getByRole("heading", { name: "Review the request" })).toBeVisible();
    expect(screen.getAllByText("120 × 80 × 30 mm")).toHaveLength(2);
    expect(screen.getAllByText("Glossy")).toHaveLength(2);
    expect(screen.getAllByText("25")).toHaveLength(2);

    await user.type(screen.getByLabelText("Name"), "Avery");
    await user.type(screen.getByLabelText("Email"), "avery@example.ca");
    await user.click(screen.getByLabelText(/I consent to Printaway collecting/));
    await user.click(screen.getByRole("button", { name: "Check request" }));

    expect(screen.getByRole("status")).toHaveTextContent(
      "Configuration complete. Quote submission is not available yet.",
    );
    expect(screen.getByRole("button", { name: "Submit quote request" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: /Step 1 of 6: Reference, complete/ }));
    expect(screen.getByLabelText("Project description")).toHaveValue("A replacement bracket.");
  });

  it("keeps selected files local and reports unsupported file types", async () => {
    const user = userEvent.setup();
    render(<StudioConfigurator />);
    const input = screen.getByLabelText("Choose reference files");

    await user.upload(input, new File(["model"], "bracket.stl", { type: "model/stl" }));
    expect(screen.getByText("bracket.stl")).toBeVisible();
    expect(screen.getByText(/Selected locally. Files are not uploaded/)).toBeVisible();

    await user.upload(input, new File(["model"], "bracket.obj", { type: "text/plain" }));
    expect(screen.getAllByText("Choose a supported reference file type.")).toHaveLength(2);
  });
});
