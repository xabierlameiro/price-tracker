import { auth } from "@/auth";
import { AuthenticationError } from "@/lib/errors";

/**
 * Returns the current session server-side.
 * Use in Server Components, Server Actions, and Route Handlers.
 */
export { auth as getSession };

/**
 * Returns the current session or throws if the user is not authenticated.
 * Use in protected Server Actions and Route Handlers.
 */
export async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new AuthenticationError();
  }
  return session;
}
