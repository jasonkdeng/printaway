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
