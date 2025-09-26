import { test, expect } from "@playwright/test";

test.describe("Tools Management", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the frontend
    await page.goto("http://localhost:8200");
  });

  test("should allow admin to create, edit, and delete tools", async ({
    page,
  }) => {
    // Login as admin
    await page.click("text=Sign in");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');

    // Wait for redirect to home page
    await page.waitForURL("http://localhost:8200/");

    // Navigate to tools page
    await page.click("text=Tools");
    await page.waitForURL("http://localhost:8200/tools");

    // Check that tools are displayed
    await expect(page.locator("h1")).toContainText("Tools");

    // Check that "Add Tool" button is visible for admin
    await expect(page.locator("text=Add Tool")).toBeVisible();

    // Click Add Tool
    await page.click("text=Add Tool");
    await page.waitForURL("http://localhost:8200/tools/new");

    // Fill in the form
    await page.fill('input[name="name"]', "Playwright Test Tool");
    await page.fill('input[name="url"]', "https://playwright.dev");
    await page.fill(
      'textarea[name="description"]',
      "A tool created by Playwright test"
    );

    // Select first category
    await page.selectOption('select[name="category_id"]', { index: 1 });

    // Submit the form
    await page.click('button[type="submit"]');

    // Wait for redirect back to tools list
    await page.waitForURL("http://localhost:8200/tools");

    // Verify the tool was created
    await expect(page.locator("text=Playwright Test Tool")).toBeVisible();

    // Find and click Edit link for the tool we just created
    const toolRow = page
      .locator("text=Playwright Test Tool")
      .locator("..")
      .locator("..");
    await toolRow.locator("text=Edit").click();

    // Wait for edit page
    await page.waitForURL(/http:\/\/localhost:8200\/tools\/\d+\/edit/);

    // Update the tool name
    await page.fill('input[name="name"]', "Updated Playwright Test Tool");
    await page.click('button[type="submit"]');

    // Wait for redirect back to tools list
    await page.waitForURL("http://localhost:8200/tools");

    // Verify the tool was updated
    await expect(
      page.locator("text=Updated Playwright Test Tool")
    ).toBeVisible();

    // Delete the tool
    const updatedToolRow = page
      .locator("text=Updated Playwright Test Tool")
      .locator("..")
      .locator("..");
    await updatedToolRow.locator("text=Delete").click();

    // Confirm deletion in dialog
    page.on("dialog", (dialog) => dialog.accept());

    // Verify the tool was deleted
    await expect(
      page.locator("text=Updated Playwright Test Tool")
    ).not.toBeVisible();
  });

  test("should allow regular user to view tools but not create/edit/delete", async ({
    page,
  }) => {
    // Login as regular user
    await page.click("text=Sign in");
    await page.fill('input[name="email"]', "user@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');

    // Wait for redirect to home page
    await page.waitForURL("http://localhost:8200/");

    // Navigate to tools page
    await page.click("text=Tools");
    await page.waitForURL("http://localhost:8200/tools");

    // Check that tools are displayed
    await expect(page.locator("h1")).toContainText("Tools");

    // Check that "Add Tool" button is NOT visible for regular user
    await expect(page.locator("text=Add Tool")).not.toBeVisible();

    // Check that Edit and Delete links are not visible
    const firstToolRow = page.locator("li").first();
    await expect(firstToolRow.locator("text=Edit")).not.toBeVisible();
    await expect(firstToolRow.locator("text=Delete")).not.toBeVisible();

    // Try to navigate directly to add tool page
    await page.goto("http://localhost:8200/tools/new");

    // Should be redirected back to tools page
    await page.waitForURL("http://localhost:8200/tools");
  });

  test("should allow manager to create and edit tools but not delete", async ({
    page,
  }) => {
    // Login as manager
    await page.click("text=Sign in");
    await page.fill('input[name="email"]', "manager@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');

    // Wait for redirect to home page
    await page.waitForURL("http://localhost:8200/");

    // Navigate to tools page
    await page.click("text=Tools");
    await page.waitForURL("http://localhost:8200/tools");

    // Check that "Add Tool" button is visible for manager
    await expect(page.locator("text=Add Tool")).toBeVisible();

    // Check that Edit links are visible but Delete links are not
    const firstToolRow = page.locator("li").first();
    await expect(firstToolRow.locator("text=Edit")).toBeVisible();
    await expect(firstToolRow.locator("text=Delete")).not.toBeVisible();
  });

  test("should allow searching and filtering tools", async ({ page }) => {
    // Login as admin
    await page.click("text=Sign in");
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.click('button[type="submit"]');

    // Wait for redirect to home page
    await page.waitForURL("http://localhost:8200/");

    // Navigate to tools page
    await page.click("text=Tools");
    await page.waitForURL("http://localhost:8200/tools");

    // Test search functionality
    await page.fill('input[name="search"]', "Google");
    await page.click('button[type="submit"]');

    // Should find Google Analytics
    await expect(page.locator("text=Google Analytics")).toBeVisible();

    // Test category filter
    await page.selectOption('select[name="category"]', { index: 2 }); // Marketing category
    await page.click('button[type="submit"]');

    // Should show only Marketing tools
    await expect(page.locator("text=HubSpot")).toBeVisible();
  });
});
