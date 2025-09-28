// Simple test to verify mobile menu functionality
// This can be run in the browser console for manual testing

export const testMobileMenu = () => {
  console.log("🧪 Testing Mobile Menu Functionality");

  // Test 1: Check if hamburger button exists
  const hamburger = document.querySelector('[data-testid="hamburger"]');
  if (hamburger) {
    console.log("✅ Hamburger button found");
  } else {
    console.log("❌ Hamburger button not found");
    return;
  }

  // Test 2: Check if mobile drawer exists when opened
  const openMenu = () => {
    (hamburger as HTMLElement).click();
    setTimeout(() => {
      const drawer = document.querySelector('[data-testid="mobile-drawer"]');
      if (drawer) {
        console.log("✅ Mobile drawer opens correctly");
      } else {
        console.log("❌ Mobile drawer does not open");
      }
    }, 100);
  };

  // Test 3: Check if title link works
  const titleLink = document.querySelector('a[aria-label="Go to home"]');
  if (titleLink && titleLink.getAttribute("href") === "/") {
    console.log("✅ Title link points to home");
  } else {
    console.log("❌ Title link not found or incorrect href");
  }

  // Test 4: Check password fields
  const passwordFields = document.querySelectorAll('input[type="password"]');
  const passwordToggles = document.querySelectorAll(
    'button[aria-label*="password"]'
  );

  if (passwordFields.length > 0) {
    console.log(`✅ Found ${passwordFields.length} password field(s)`);
  }

  if (passwordToggles.length > 0) {
    console.log(`✅ Found ${passwordToggles.length} password toggle(s)`);
  }

  console.log("🎉 Mobile menu test completed!");

  // Open menu for visual inspection
  openMenu();
};

// Auto-run test if in browser
if (typeof window !== "undefined") {
  // Wait for page to load
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", testMobileMenu);
  } else {
    testMobileMenu();
  }
}
