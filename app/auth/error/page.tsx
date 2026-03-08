import { ROUTES } from "@/lib/constants";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Authentication Error",
};

const ERROR_MESSAGES: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification:
    "The sign-in link is no longer valid. It may have been used already or has expired.",
  Default: "An unexpected authentication error occurred. Please try again.",
};

interface PageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function AuthErrorPage({
  searchParams,
}: Readonly<PageProps>) {
  const { error } = await searchParams;
  const message = ERROR_MESSAGES[error ?? "Default"] ?? ERROR_MESSAGES.Default;

  return (
    <main
      id="maincontent"
      className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center"
      tabIndex={-1}
    >
      <div className="flex flex-col items-center gap-3">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Authentication Error
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">
          Sign in failed
        </h1>
        <p className="max-w-sm text-sm text-muted-foreground">{message}</p>
      </div>
      <Link
        href={ROUTES.signIn}
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        Back to sign in
      </Link>
    </main>
  );
}
