import { expect, test } from "@playwright/test";

test("the home page exposes the Shop gallery and six-step Studio console", async ({ page }) => {
  await page.goto("/");

  await expect(page.getByRole("heading", { name: "Objects made in small runs." })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Configure a print with control." })).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(6);
  await expect(page.getByRole("link", { name: "View the full Shop" })).toHaveAttribute("href", "/shop");
  await expect(page.getByRole("link", { name: "Configure a print" })).toHaveAttribute("href", "/studio");
});

test("the homepage preserves its core actions at a mobile width", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");

  await expect(page.getByRole("link", { name: "View the full Shop" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Configure a print" })).toBeVisible();
});

test("the Shop preserves availability filter state and offers recovery", async ({ page }) => {
  await page.goto("/shop?availability=available");

  await expect(page.getByLabel("Availability")).toHaveValue("available");
  await expect(page.getByRole("list", { name: "Initial product catalog" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Clear filter" })).toHaveAttribute("href", "/shop");
});

test("the product configuration remains visible and stable at review widths", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("/_next/webpack-hmr")) {
      consoleErrors.push(message.text());
    }
  });

  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/shop/monitor-riser");

    await expect(page.getByRole("heading", { name: "Monitor Riser" })).toBeVisible();
    await expect(page.getByRole("group", { name: "Select a configuration" })).toBeVisible();

    const finish = page.getByRole("combobox", { name: "Finish" });
    const colour = page.getByRole("combobox", { name: "Colour" });
    const quantity = page.getByRole("combobox", { name: "Quantity" });

    await expect(finish).toBeVisible();
    await expect(colour).toBeVisible();
    await expect(quantity).toBeVisible();
    await expect(finish).toHaveCSS("background-color", "rgb(245, 242, 237)");
    await expect(finish).toHaveCSS("color", "rgb(10, 10, 11)");
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }

  await page.getByRole("combobox", { name: "Finish" }).focus();
  await expect(page.getByRole("combobox", { name: "Finish" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("combobox", { name: "Colour" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("combobox", { name: "Quantity" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Add to cart" })).toBeFocused();

  expect(consoleErrors).toEqual([]);
});

test("the cart gives an empty-state recovery message", async ({ page }) => {
  await page.goto("/cart");

  await expect(page.getByRole("heading", { name: "Your cart is empty." })).toBeVisible();
  await expect(page.getByText("Add an available Shop object to begin.")).toBeVisible();
});

test("the Studio foundation remains ordered, operable, and stable at review widths", async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("/_next/webpack-hmr")) {
      consoleErrors.push(message.text());
    }
  });

  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/studio");

    const stepHeading = page.getByRole("heading", { name: "Add a reference" });
    const readout = page.getByRole("complementary", { name: "Live readout" });
    await expect(stepHeading).toBeVisible();
    await expect(readout).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);

    const stepBox = await stepHeading.boundingBox();
    const readoutBox = await readout.boundingBox();
    expect(stepBox).not.toBeNull();
    expect(readoutBox).not.toBeNull();
    if (width < 1024) {
      expect(stepBox!.y).toBeLessThan(readoutBox!.y);
    } else {
      expect(stepBox!.x).toBeLessThan(readoutBox!.x);
    }
  }

  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto("/studio");
  const description = page.getByLabel("Project description");
  await description.focus();
  await page.keyboard.type("A replacement bracket.");
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Choose reference files")).toBeFocused();
  await page.keyboard.press("Tab");
  const continueToMaterial = page.getByRole("button", { name: "Continue to material" });
  await expect(continueToMaterial).toBeFocused();
  await continueToMaterial.click();
  await expect(page.getByRole("heading", { name: "Choose a material" })).toBeVisible();

  await page.getByLabel("Material preference").selectOption("PLA");
  await page.getByRole("button", { name: "Continue to size" }).click();
  await page.getByLabel("Length (mm)").fill("120");
  await page.getByLabel("Width (mm)").fill("80");
  await page.getByLabel("Height (mm)").fill("30");
  await page.getByRole("button", { name: "Continue to finish" }).click();
  await page.getByLabel("Finish preference").selectOption("Glossy");
  await page.getByRole("button", { name: "Continue to quantity" }).click();
  await page.getByRole("spinbutton", { name: "Quantity" }).fill("25");
  await page.getByRole("button", { name: "Continue to review" }).click();
  await page.getByRole("textbox", { name: "Name", exact: true }).fill("Avery");
  await page.getByRole("textbox", { name: "Email", exact: true }).fill("avery@example.ca");
  await page.getByLabel(/I consent to Printaway collecting/).check();
  await page.getByRole("button", { name: "Check request" }).click();

  await expect(page.getByRole("status")).toHaveText("Configuration complete. Quote submission is not available yet.");
  await expect(page.getByRole("button", { name: "Submit quote request" })).toBeDisabled();
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByRole("spinbutton", { name: "Quantity" })).toHaveValue("25");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  expect(consoleErrors).toEqual([]);
});
