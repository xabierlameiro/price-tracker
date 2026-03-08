import type { ApiResponse, PaginatedResponse, PaginationMeta } from "@/types";
import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { SCRAPE_CRON_SECRET } from "@/lib/constants";
import { AppError } from "@/lib/errors";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function fail(error: unknown) {
  if (error instanceof ZodError) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Validation failed", code: "VALIDATION_ERROR" },
      { status: 422 },
    );
  }
  if (error instanceof AppError) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: error.message, code: error.code },
      { status: error.statusCode },
    );
  }
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2025"
  ) {
    return NextResponse.json<ApiResponse<never>>(
      { success: false, error: "Resource not found", code: "NOT_FOUND" },
      { status: 404 },
    );
  }
  console.error("[API Error]", error);
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error: "Internal server error" },
    { status: 500 },
  );
}

export function buildMeta(
  page: number,
  pageSize: number,
  total: number,
): PaginationMeta {
  const totalPages = Math.ceil(total / pageSize);
  return {
    page,
    pageSize,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export function paginated<T>(
  items: T[],
  page: number,
  pageSize: number,
  total: number,
) {
  return ok<PaginatedResponse<T>>({
    data: items,
    meta: buildMeta(page, pageSize, total),
  });
}

/**
 * Returns true only when the cron secret is configured AND the request
 * carries a matching `Authorization: Bearer <secret>` header.
 */
export function verifyCronSecret(request: NextRequest): boolean {
  const secret = SCRAPE_CRON_SECRET;
  if (!secret) return false;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}
