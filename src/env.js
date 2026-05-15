import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().startsWith("postgres"),
    /** PostgREST origin (e.g. http://localhost:8080). On Vercel use your public API URL, not localhost. */
    BACKEND_API_BASE_URL: z.string().url(),
    CLERK_SECRET_KEY: z.string(),
    WIZARD_ENCRYPTION_KEY: z.string(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  },

  client: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string(),
  },
  runtimeEnv: {
    DATABASE_URL: process.env.DATABASE_URL,
    BACKEND_API_BASE_URL: process.env.BACKEND_API_BASE_URL,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    WIZARD_ENCRYPTION_KEY: process.env.WIZARD_ENCRYPTION_KEY,
    NODE_ENV: process.env.NODE_ENV,
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY:
      process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
  },
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
