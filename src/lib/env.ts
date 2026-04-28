import { z } from "zod";

const isServer = typeof window === "undefined";

export const env = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  SUPABASE_SERVICE_ROLE_KEY: z.string(),
  NEXT_PUBLIC_MP_CLIENT_ID: z.string(),
  NEXT_PUBLIC_MP_CLIENT_SECRET: z.string(),
  MP_WEBHOOK_SECRET: z.string(),
  GMAIL_USER: z.string().email(),
  GMAIL_APP_PASSWORD: z.string(),
  GMAIL_FROM: z.string().email().optional(),
  UPSTASH_REDIS_REST_URL: z.string().url(),
  UPSTASH_REDIS_REST_TOKEN: z.string(),
  NEXT_PUBLIC_POSTHOG_KEY: z.string().optional(),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().url().optional(),
  SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_DOMAIN: z.string().optional(),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export const publicEnv = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string(),
  NEXT_PUBLIC_MP_CLIENT_ID: z.string(),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  NEXT_PUBLIC_APP_NAME: z.string(),
  NEXT_PUBLIC_APP_ENV: z.enum(["development", "production", "test"]).default("development"),
});

export type Env = z.infer<typeof env>;
export type PublicEnv = z.infer<typeof publicEnv>;

export const validateEnv = () => {
  if (!isServer) return;
  env.parse(process.env);
};

export const getPublicEnv = (): PublicEnv => ({
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL!,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  NEXT_PUBLIC_MP_CLIENT_ID: process.env.NEXT_PUBLIC_MP_CLIENT_ID!,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME || "CanchaPro",
  NEXT_PUBLIC_APP_ENV: (process.env.NEXT_PUBLIC_APP_ENV as any) || "development",
});