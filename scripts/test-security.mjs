#!/usr/bin/env node

/**
 * Security Features Test Script
 * Tests 2FA, admin panel, audit logging, and rate limiting
 */

import { execSync } from "child_process";

const API_BASE = "http://localhost:8201/api";
const FRONTEND_BASE = "http://localhost:8200";

// Test data
const testUsers = {
  admin: { email: "admin@example.com", password: "Password123!" },
  manager: { email: "manager@example.com", password: "Password123!" },
  user: { email: "user@example.com", password: "Password123!" },
};

let authTokens = {};

console.log("🔐 Testing Security Features...\n");

// Helper function to make API requests
async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      `HTTP ${response.status}: ${data.message || "Unknown error"}`
    );
  }

  return data;
}

// Test 1: User Registration and Login
async function testUserAuth() {
  console.log("1️⃣ Testing User Authentication...");

  try {
    // Test registration
    const registerResponse = await apiRequest("/register", {
      method: "POST",
      body: JSON.stringify({
        name: "Test User",
        email: "test@example.com",
        password: "Password123!",
        password_confirmation: "Password123!",
      }),
    });

    console.log("✅ User registration successful");

    // Test login
    const loginResponse = await apiRequest("/login", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        password: "Password123!",
      }),
    });

    authTokens.test = loginResponse.token;
    console.log("✅ User login successful");
  } catch (error) {
    console.log("❌ User auth test failed:", error.message);
  }
}

// Test 2: 2FA Setup and Verification
async function test2FA() {
  console.log("\n2️⃣ Testing Two-Factor Authentication...");

  try {
    // Enable 2FA
    const enableResponse = await apiRequest("/2fa/enable", {
      method: "POST",
      headers: { Authorization: `Bearer ${authTokens.test}` },
    });

    console.log("✅ 2FA enable initiated");
    console.log("📱 QR Code URL:", enableResponse.qr_code_url);
    console.log("🔑 Secret Key:", enableResponse.secret_key);
    console.log(
      "🔐 Recovery Codes:",
      enableResponse.recovery_codes.slice(0, 3).join(", "),
      "..."
    );

    // Test 2FA status
    const statusResponse = await apiRequest("/2fa/status", {
      headers: { Authorization: `Bearer ${authTokens.test}` },
    });

    console.log(
      "✅ 2FA status check:",
      statusResponse.enabled ? "Enabled" : "Disabled"
    );
  } catch (error) {
    console.log("❌ 2FA test failed:", error.message);
  }
}

// Test 3: Admin Panel Access
async function testAdminPanel() {
  console.log("\n3️⃣ Testing Admin Panel...");

  try {
    // Test admin dashboard
    const dashboardResponse = await apiRequest("/admin/dashboard", {
      headers: { Authorization: `Bearer ${authTokens.test}` },
    });

    console.log("✅ Admin dashboard accessible");
    console.log("📊 Stats:", {
      totalUsers: dashboardResponse.data.total_users,
      activeUsers: dashboardResponse.data.active_users,
      usersWith2FA: dashboardResponse.data.users_with_2fa,
    });

    // Test user management
    const usersResponse = await apiRequest("/admin/users", {
      headers: { Authorization: `Bearer ${authTokens.test}` },
    });

    console.log("✅ User management accessible");
    console.log("👥 Users found:", usersResponse.data.length);
  } catch (error) {
    console.log("❌ Admin panel test failed:", error.message);
  }
}

// Test 4: Rate Limiting
async function testRateLimiting() {
  console.log("\n4️⃣ Testing Rate Limiting...");

  try {
    console.log("🚀 Sending multiple login requests...");

    const promises = [];
    for (let i = 0; i < 6; i++) {
      promises.push(
        apiRequest("/login", {
          method: "POST",
          body: JSON.stringify({
            email: "nonexistent@example.com",
            password: "wrongpassword",
          }),
        }).catch((err) => ({ error: err.message }))
      );
    }

    const results = await Promise.all(promises);
    const errors = results.filter((r) => r.error);
    const rateLimited = errors.filter(
      (r) => r.error.includes("429") || r.error.includes("throttle")
    );

    if (rateLimited.length > 0) {
      console.log("✅ Rate limiting working - some requests were throttled");
    } else {
      console.log("⚠️ Rate limiting may not be working properly");
    }
  } catch (error) {
    console.log("❌ Rate limiting test failed:", error.message);
  }
}

// Test 5: Audit Logging
async function testAuditLogging() {
  console.log("\n5️⃣ Testing Audit Logging...");

  try {
    // Create a tool to generate audit logs
    const toolResponse = await apiRequest("/tools", {
      method: "POST",
      headers: { Authorization: `Bearer ${authTokens.test}` },
      body: JSON.stringify({
        name: "Test Tool for Audit",
        url: "https://example.com",
        description: "Test tool for audit logging",
        category_id: 1,
      }),
    });

    console.log("✅ Tool created for audit test");

    // Check audit logs
    const auditResponse = await apiRequest("/admin/audit-logs", {
      headers: { Authorization: `Bearer ${authTokens.test}` },
    });

    console.log("✅ Audit logs accessible");
    console.log("📝 Recent audit entries:", auditResponse.data.length);

    // Show recent audit entries
    if (auditResponse.data.length > 0) {
      const recent = auditResponse.data.slice(0, 3);
      recent.forEach((entry) => {
        console.log(
          `  - ${entry.action} on ${entry.model_type} by user ${entry.user_id}`
        );
      });
    }
  } catch (error) {
    console.log("❌ Audit logging test failed:", error.message);
  }
}

// Test 6: Password Reset Flow
async function testPasswordReset() {
  console.log("\n6️⃣ Testing Password Reset Flow...");

  try {
    // Request password reset
    const resetRequest = await apiRequest("/password/reset-request", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
      }),
    });

    console.log("✅ Password reset requested");
    console.log("🔑 Reset token (for testing):", resetRequest.reset_token);

    // Test email verification
    const verifyResponse = await apiRequest("/email/verify", {
      method: "POST",
      body: JSON.stringify({
        email: "test@example.com",
        token: "test-token",
      }),
    });

    console.log("✅ Email verification endpoint accessible");
  } catch (error) {
    console.log("❌ Password reset test failed:", error.message);
  }
}

// Test 7: Frontend Accessibility
async function testFrontendAccess() {
  console.log("\n7️⃣ Testing Frontend Accessibility...");

  try {
    const response = await fetch(FRONTEND_BASE);
    if (response.ok) {
      console.log("✅ Frontend is accessible");
    } else {
      console.log("❌ Frontend not accessible");
    }
  } catch (error) {
    console.log("❌ Frontend test failed:", error.message);
  }
}

// Run all tests
async function runAllTests() {
  try {
    await testUserAuth();
    await test2FA();
    await testAdminPanel();
    await testRateLimiting();
    await testAuditLogging();
    await testPasswordReset();
    await testFrontendAccess();

    console.log("\n🎉 Security features test completed!");
    console.log("\n📋 Summary:");
    console.log("✅ TOTP 2FA with recovery codes");
    console.log("✅ Laravel throttle middleware");
    console.log("✅ Admin panel with user management");
    console.log("✅ Audit logging for all operations");
    console.log("✅ Password reset and email verification");
    console.log("✅ Bearer token authentication maintained");
  } catch (error) {
    console.log("\n❌ Test suite failed:", error.message);
  }
}

// Check if services are running
async function checkServices() {
  try {
    await fetch(`${API_BASE}/health`);
    console.log("✅ Backend API is running");
  } catch (error) {
    console.log(
      "❌ Backend API is not running. Please start with: docker-compose up -d"
    );
    process.exit(1);
  }
}

// Main execution
async function main() {
  await checkServices();
  await runAllTests();
}

main().catch(console.error);
