import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;

  const isProtectedRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/profile") ||
    nextUrl.pathname.startsWith("/settings");

  const isAuthRoute =
    nextUrl.pathname.startsWith("/auth/sign-in") ||
    nextUrl.pathname.startsWith("/auth/sign-up");

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Redirect unauthenticated users to sign-in
  if (isProtectedRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/sign-in", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Match all routes except static files, images, and API routes
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
