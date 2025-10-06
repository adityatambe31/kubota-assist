/**
 * Environment variable validation and configuration
 * Provides type-safe access to environment variables
 */

interface EnvConfig {
  // Database
  MONGODB_URI: string;

  // AI Services
  OPENAI_API_KEY: string;
  GEMINI_API_KEY: string;

  // AWS Services
  AWS_ACCESS_KEY_ID: string;
  AWS_SECRET_ACCESS_KEY: string;
  AWS_KMS_KEY_ID: string;
  AWS_REGION: string;

  // Clerk Authentication
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
  CLERK_SECRET_KEY: string;
  NEXT_PUBLIC_CLERK_SIGN_IN_URL: string;
  NEXT_PUBLIC_CLERK_SIGN_UP_URL: string;
  NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL: string;
  NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL: string;

  // JIRA Integration (optional)
  JIRA_BASE_URL?: string;
  JIRA_USERNAME?: string;
  JIRA_API_TOKEN?: string;
  JIRA_PROJECT_KEY?: string;

  // Application
  NODE_ENV: "development" | "production" | "test";
  NEXT_PUBLIC_APP_URL: string;
}

/**
 * Validates that all required environment variables are present
 */
function validateEnv(): EnvConfig {
  const requiredVars = [
    "MONGODB_URI",
    "OPENAI_API_KEY",
    "GEMINI_API_KEY",
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_KMS_KEY_ID",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY",
    "CLERK_SECRET_KEY",
  ];

  const missing = requiredVars.filter((varName) => !process.env[varName]);

  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(", ")}. ` +
        "Please check your .env.local file."
    );
  }

  return {
    // Database
    MONGODB_URI: process.env.MONGODB_URI!,

    // AI Services
    OPENAI_API_KEY: process.env.OPENAI_API_KEY!,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY!,

    // AWS Services
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID!,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY!,
    AWS_KMS_KEY_ID: process.env.AWS_KMS_KEY_ID!,
    AWS_REGION: process.env.AWS_REGION || "ca-central-1",

    // Clerk Authentication
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY!,
    NEXT_PUBLIC_CLERK_SIGN_IN_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_IN_URL || "/sign-in",
    NEXT_PUBLIC_CLERK_SIGN_UP_URL:
      process.env.NEXT_PUBLIC_CLERK_SIGN_UP_URL || "/sign-up",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL || "/",
    NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL:
      process.env.NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL || "/",

    // JIRA Integration (optional)
    JIRA_BASE_URL: process.env.JIRA_BASE_URL,
    JIRA_USERNAME: process.env.JIRA_USERNAME,
    JIRA_API_TOKEN: process.env.JIRA_API_TOKEN,
    JIRA_PROJECT_KEY: process.env.JIRA_PROJECT_KEY,

    // Application
    NODE_ENV: (process.env.NODE_ENV as EnvConfig["NODE_ENV"]) || "development",
    NEXT_PUBLIC_APP_URL:
      process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  };
}

// Export validated environment configuration
export const env = validateEnv();

// Helper functions
export const isDevelopment = () => env.NODE_ENV === "development";
export const isProduction = () => env.NODE_ENV === "production";
export const isTest = () => env.NODE_ENV === "test";

// Type export for use in other modules
export type { EnvConfig };
