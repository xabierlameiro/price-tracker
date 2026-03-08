"use client";

import { useCallback } from "react";

/**
 * Skip link that programmatically focuses the main content landmark.
 * Using explicit JS focus ensures cross-browser compatibility, including
 * WebKit/Safari which does not move focus to hash-link targets by default.
 */
export function SkipLink() {
  const handleClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const main = document.querySelector<HTMLElement>("#maincontent");
    main?.focus();
  }, []);

  return (
    <a
      href="#maincontent"
      onClick={handleClick}
      className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:rounded focus:bg-white focus:px-4 focus:py-2 focus:text-black focus:outline-2 focus:outline-offset-2 focus:outline-blue-600"
    >
      Skip to main content
    </a>
  );
}
