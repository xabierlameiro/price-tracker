"use client";

import { useEffect } from "react";

type GlobalErrorProps = Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>;

export default function GlobalError({ error, reset }: GlobalErrorProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    // global-error must include html and body tags
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-6 bg-white p-8 text-center dark:bg-black">
        <h1 className="text-2xl font-semibold text-red-600 dark:text-red-400">
          Critical error
        </h1>
        <p className="max-w-md text-sm text-gray-600 dark:text-gray-400">
          A critical error occurred. Please refresh the page or contact support.
        </p>
        <button
          onClick={reset}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          Try again
        </button>
      </body>
    </html>
  );
}
