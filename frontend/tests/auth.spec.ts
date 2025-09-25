import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the frontend
    await page.goto("http://localhost:8200");
  });

  test("should login successfully with seeded admin user", async ({ page }) => {
    // Click on login link
    await page.click("text=Sign in");

    // Fill in login form
    await page.fill('input[name="email"]', "admin@example.com");
    await page.fill('input[name="password"]', "Password123!");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect and check if we're on the home page
    await page.waitForURL("http://localhost:8200/");

    // Verify we're logged in (you might need to adjust this based on your UI)
    await expect(page).toHaveURL("http://localhost:8200/");

    // Check for any error messages
    const errorMessages = await page.locator(".bg-red-100").count();
    expect(errorMessages).toBe(0);
  });

  test("should register a new user successfully", async ({ page }) => {
    // Click on signup link
    await page.click("text=Sign up");

    // Fill in registration form
    await page.fill('input[name="name"]', "Test User");
    await page.fill('input[name="email"]', "testuser@example.com");
    await page.fill('input[name="password"]', "Password123!");
    await page.fill('input[name="password_confirmation"]', "Password123!");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for redirect
    await page.waitForURL("http://localhost:8200/");

    // Verify we're logged in
    await expect(page).toHaveURL("http://localhost:8200/");

    // Check for any error messages
    const errorMessages = await page.locator(".bg-red-100").count();
    expect(errorMessages).toBe(0);
  });

  test("should show error for invalid credentials", async ({ page }) => {
    // Click on login link
    await page.click("text=Sign in");

    // Fill in invalid credentials
    await page.fill('input[name="email"]', "invalid@example.com");
    await page.fill('input[name="password"]', "wrongpassword");

    // Submit form
    await page.click('button[type="submit"]');

    // Wait for error message
    await page.waitForSelector(".bg-red-100");

    // Verify error message is displayed
    const errorMessage = await page.locator(".bg-red-100").textContent();
    expect(errorMessage).toContain("Invalid credentials");
  });
});
