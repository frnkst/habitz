import { expect, test } from "@playwright/test";

test("shows the owner login on a mobile viewport", async ({ page }) => {
  await page.goto("/login");
  await expect(
    page.getByRole("heading", { name: "Make room for progress." }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Continue with GitHub" }),
  ).toBeVisible();
});
