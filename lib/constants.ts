export const APP_NAME = "Next.js Starter";
export const APP_DESCRIPTION =
  "A professional Next.js 16 starter template with TypeScript, Tailwind CSS v4, Auth.js v5, Zod, Zustand, Vitest, and Playwright.";
export const APP_VERSION = "0.1.0";

export const SITE_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const ROUTES = {
  home: "/",
  signIn: "/auth/sign-in",
  signUp: "/auth/sign-up",
  dashboard: "/dashboard",
  settings: "/settings",
  profile: "/profile",
} as const;

export const API_ROUTES = {
  auth: "/api/auth",
  health: "/api/health",
} as const;
