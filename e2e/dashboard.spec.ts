import { expect, test } from "@playwright/test";

test("opens dashboard", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Financial Analytics Dashboard")).toBeVisible();
  await expect(page.getByText("Total Revenue")).toBeVisible();
});
