#!/usr/bin/env node

// Development environment check script
import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Read environment variables
const envPath = join(__dirname, "..", "frontend", ".env.local");
let apiUrl = "http://localhost:8201/api";

try {
  const envContent = readFileSync(envPath, "utf8");
  const match = envContent.match(/NEXT_PUBLIC_API_URL=(.+)/);
  if (match) {
    apiUrl = match[1];
  }
} catch (error) {
  console.log("⚠️  No .env.local found, using default API URL");
}

console.log("🔍 Development Environment Check");
console.log("================================");
console.log(`API URL: ${apiUrl}`);

// Test health endpoint
const healthUrl = `${apiUrl}/health`;

try {
  console.log("\n📡 Testing API health endpoint...");
  const response = await fetch(healthUrl);

  if (response.ok) {
    const data = await response.json();
    console.log("✅ API is healthy!");
    console.log(`   Environment: ${data.environment}`);
    console.log(`   Version: ${data.version}`);
    console.log(`   Timestamp: ${data.timestamp}`);
  } else {
    console.log(
      `❌ API health check failed: ${response.status} ${response.statusText}`
    );
  }
} catch (error) {
  console.log(`❌ Cannot reach API: ${error.message}`);
  console.log("\n🔧 Troubleshooting:");
  console.log(
    "   1. Make sure Docker containers are running: docker compose ps"
  );
  console.log(
    "   2. Check if backend is accessible: curl http://localhost:8201/api/health"
  );
  console.log("   3. Verify .env.local has correct NEXT_PUBLIC_API_URL");
  process.exit(1);
}

console.log("\n🎉 Environment check completed successfully!");
