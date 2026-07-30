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

test("the header keeps its wordmark left, navigation centred, and account actions right", async ({ page }) => {
  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");

    const wordmark = page.getByRole("link", { name: "Printaway home" });
    const shop = page.getByRole("link", { name: "Shop", exact: true });
    const navigation = page.getByTestId("header-navigation");
    const actions = page.getByTestId("header-actions");
    await expect(wordmark).toBeVisible();
    await expect(shop).toBeVisible();
    expect((await wordmark.boundingBox())?.height).toBe(48);
    expect((await shop.boundingBox())?.height).toBe(48);

    const signIn = page.getByRole("link", { name: "Sign in with Google" });
    if (await signIn.count()) {
      expect((await signIn.boundingBox())?.height).toBe(48);
      await expect(signIn).toHaveCSS("border-radius", "8px");
      await expect(signIn).toHaveCSS("background-color", "rgb(19, 19, 20)");
    }

    const wordmarkBox = await wordmark.boundingBox();
    const navigationBox = await navigation.boundingBox();
    const actionsBox = await actions.boundingBox();
    expect(wordmarkBox).not.toBeNull();
    expect(navigationBox).not.toBeNull();
    expect(actionsBox).not.toBeNull();
    const horizontalPadding = width === 1440 ? 96 : 24;
    expect(wordmarkBox!.x).toBe(horizontalPadding);
    expect(Math.abs((navigationBox!.x + navigationBox!.width / 2) - width / 2)).toBeLessThanOrEqual(1);
    expect(Math.abs((actionsBox!.x + actionsBox!.width) - (width - horizontalPadding))).toBeLessThanOrEqual(1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }
});

test("the primary route titles share one display scale", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  const routes = [
    ["/", "Objects made in small runs."],
    ["/shop", "Objects made in small runs."],
    ["/studio", "Configure a print with control."],
    ["/materials", "Material reference"],
    ["/about", "About Printaway"],
    ["/privacy-policy", "Privacy and personal information"],
    ["/cart", "Your cart is empty."],
  ] as const;
  const fontSizes: string[] = [];

  for (const [route, heading] of routes) {
    await page.goto(route);
    const title = page.getByRole("heading", { name: heading, exact: true }).first();
    await expect(title).toBeVisible();
    fontSizes.push(await title.evaluate((element) => getComputedStyle(element).fontSize));
  }

  expect(fontSizes).toEqual(Array(routes.length).fill("96px"));
});

test("the Shop preserves availability filter state and offers recovery", async ({ page }) => {
  await page.goto("/shop?availability=available");

  await expect(page.getByLabel("Availability")).toHaveValue("available");
  const catalog = page.getByRole("list", { name: "Initial product catalog" });
  const emptyState = page.getByRole("heading", { name: "No objects match these filters." });
  await expect(catalog.or(emptyState)).toBeVisible();
  await expect(page.getByRole("link", { name: "Clear filter" })).toHaveAttribute("href", "/shop");
});

test("the product detail and its current availability state remain stable at review widths", async ({ page }) => {
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
    await expect(page.getByText(/Matte \+\$1\.00/)).toBeVisible();
    const configuration = page.getByRole("group", { name: "Select a configuration" });
    if (await configuration.count()) {
      await expect(page.getByRole("combobox", { name: "Print Finish" })).toBeVisible();
      await expect(page.getByRole("combobox", { name: "Colour" })).toBeVisible();
      await expect(page.getByRole("combobox", { name: "Quantity" })).toBeVisible();
    } else {
      await expect(page.getByText("This product is unavailable. Choose another object or return to Shop.")).toBeVisible();
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }

  expect(consoleErrors).toEqual([]);
});

test("every initial product links to its shared material limit at review widths", async ({ page }) => {
  const products = [
    ["monitor-riser", "PLA"],
    ["desk-tray", "PLA"],
    ["coat-hanger", "ABS"],
    ["keycap-fidget", "PLA"],
  ] as const;

  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    for (const [slug, material] of products) {
      await page.goto(`/shop/${slug}`);
      await expect(page.getByRole("link", { name: `Read ${material} material limits` })).toHaveAttribute("href", `/materials#${material.toLowerCase()}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
    }
  }
});

test("the cart gives an empty-state recovery message", async ({ page }) => {
  await page.goto("/cart");

  await expect(page.getByRole("heading", { name: "Your cart is empty." })).toBeVisible();
  await expect(page.getByText("Add an available Shop object to begin.")).toBeVisible();
});

test("the cart presents the approved fulfillment and policy boundary at review widths", async ({ page }) => {
  const cart = {
    lines: [{
      id: "monitor-riser:Matte:white",
      productId: "monitor-riser",
      name: "Monitor Riser",
      finish: "Matte",
      colour: "white",
      quantity: 1,
      maximumQuantity: 4,
      unitPrice: { amountMinor: 1300, currency: "CAD" },
    }],
  };

  for (const width of [320, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    await page.evaluate((snapshot) => window.sessionStorage.setItem("printaway-cart-v1", JSON.stringify(snapshot)), cart);
    await page.goto("/cart");

    await expect(page.getByRole("group", { name: "Fulfillment" })).toBeVisible();
    await page.getByRole("radio", { name: "Shipping" }).check();
    await expect(page.getByRole("textbox", { name: /Shipping postal code/ })).toBeVisible();
    await expect(page.getByText("$18.00")).toBeVisible();
    await expect(page.getByRole("link", { name: "Sign in with Google to checkout" })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  }

  await page.goto("/policies/returns");
  await expect(page.getByRole("heading", { name: "Refunds" })).toBeVisible();
  await expect(page.getByText(/within seven calendar days/)).toBeVisible();
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
