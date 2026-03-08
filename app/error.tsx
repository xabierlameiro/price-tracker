"use client";

import { useEffect } from "react";

type ErrorProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function ErrorPage({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <main
      id="maincontent"
      className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center"
      tabIndex={-1}
    >
      <div className="flex flex-col items-center gap-4">
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Something went wrong
        </h1>
        <p className="max-w-md text-sm text-muted-foreground">
          An unexpected error occurred. Please try again, or contact support if
          the issue persists.
        </p>
        {process.env.NODE_ENV === "development" && error.message && (
          <pre className="mt-2 max-w-md overflow-auto rounded-md bg-destructive/10 p-4 text-left text-xs text-destructive">
            {error.message}
          </pre>
        )}
      </div>
      <button
        onClick={reset}
        className="rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background transition-colors hover:bg-foreground/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-foreground"
      >
        Try again
      </button>
    </main>
  );
}
