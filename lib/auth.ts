import { auth } from "@/auth";
import { AuthenticationError } from "@/lib/errors";
import type { Session } from "next-auth";

/**
 * Returns the current session server-side.
 * Use in Server Components, Server Actions, and Route Handlers.
 */
export { auth as getSession };

// Narrows the session user type so callers get typed access to user.id.
type AuthenticatedSession = Session & {
  user: NonNullable<Session["user"]> & { id: string };
};

/**
 * Returns the current session or throws AuthenticationError if unauthenticated.
 * Use in protected Server Actions and Route Handlers.
 */
export async function requireAuth(): Promise<AuthenticatedSession> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new AuthenticationError();
  }
  return session as AuthenticatedSession;
}
