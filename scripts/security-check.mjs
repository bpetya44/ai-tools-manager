#!/usr/bin/env node

// Security check script to verify no secrets are committed
import { readFileSync, existsSync } from "fs";
import { execSync } from "child_process";

console.log("🔒 Security Check");
console.log("================");

let hasIssues = false;

// Check 1: Verify .env files are ignored
console.log("\n1. Checking environment files...");
try {
  const result = execSync(
    "git check-ignore .env backend/.env frontend/.env.local",
    {
      encoding: "utf8",
      stdio: "pipe",
    }
  );
  console.log("✅ All .env files are properly ignored");
} catch (error) {
  console.log("❌ Some .env files are not ignored!");
  hasIssues = true;
}

// Check 2: Look for hardcoded secrets in tracked files
console.log("\n2. Scanning for potential secrets...");
try {
  const trackedFiles = execSync("git ls-files", { encoding: "utf8" });
  const files = trackedFiles.trim().split("\n");

  const suspiciousPatterns = [
    /password\s*=\s*["'][^"']{6,}["']/i,
    /secret\s*=\s*["'][^"']{6,}["']/i,
    /key\s*=\s*["'][^"']{20,}["']/i,
    /token\s*=\s*["'][^"']{20,}["']/i,
  ];

  // Patterns that are safe (redacting passwords, etc.)
  const safePatterns = [
    /\[REDACTED\]/i,
    /password.*=.*\[REDACTED\]/i,
    /token\?: string/i, // TypeScript type definitions
  ];

  let foundSecrets = false;

  for (const file of files) {
    if (file.includes("node_modules") || file.includes("vendor")) continue;

    try {
      const content = readFileSync(file, "utf8");

      for (const pattern of suspiciousPatterns) {
        if (pattern.test(content)) {
          // Check if this is a safe pattern (like redacting passwords)
          const isSafe = safePatterns.some((safePattern) =>
            safePattern.test(content)
          );
          if (!isSafe) {
            console.log(`⚠️  Potential secret found in: ${file}`);
            foundSecrets = true;
            hasIssues = true;
          }
        }
      }
    } catch (error) {
      // Skip binary files or files that can't be read
    }
  }

  if (!foundSecrets) {
    console.log("✅ No obvious hardcoded secrets found");
  }
} catch (error) {
  console.log("❌ Error scanning files:", error.message);
  hasIssues = true;
}

// Check 3: Verify .gitignore is comprehensive
console.log("\n3. Checking .gitignore coverage...");
try {
  const gitignoreContent = readFileSync(".gitignore", "utf8");
  const requiredPatterns = [
    ".env",
    ".env.*",
    "*.key",
    "*.pem",
    "*.log",
    "node_modules/",
    "vendor/",
    "storage/",
  ];

  let missingPatterns = [];
  for (const pattern of requiredPatterns) {
    if (!gitignoreContent.includes(pattern)) {
      missingPatterns.push(pattern);
    }
  }

  if (missingPatterns.length === 0) {
    console.log("✅ .gitignore covers all essential patterns");
  } else {
    console.log(
      "❌ Missing patterns in .gitignore:",
      missingPatterns.join(", ")
    );
    hasIssues = true;
  }
} catch (error) {
  console.log("❌ Could not read .gitignore file");
  hasIssues = true;
}

// Check 4: Verify no sensitive files are tracked
console.log("\n4. Checking tracked sensitive files...");
try {
  const trackedSensitive = execSync(
    'git ls-files | grep -E "\\.(env|key|pem|p12|pfx)$"',
    { encoding: "utf8", stdio: "pipe" }
  );

  if (trackedSensitive.trim()) {
    console.log("❌ Sensitive files are tracked:");
    console.log(trackedSensitive);
    hasIssues = true;
  } else {
    console.log("✅ No sensitive files are tracked");
  }
} catch (error) {
  // No sensitive files found (exit code 1 from grep)
  console.log("✅ No sensitive files are tracked");
}

// Final result
console.log("\n" + "=".repeat(50));
if (hasIssues) {
  console.log("❌ Security issues found! Please review and fix.");
  process.exit(1);
} else {
  console.log("✅ Security check passed! Repository is secure.");
}
