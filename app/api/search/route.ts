import { fail, ok } from "@/lib/api";
import { AppError } from "@/lib/errors";
import { STORE_COUNT, searchAllStores } from "@/lib/scrapers/search";
import type { NextRequest } from "next/server";

const MIN_QUERY_LENGTH = 2;

// GET /api/search?q= — public endpoint, no authentication required
export async function GET(request: NextRequest) {
  try {
    const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";

    if (q.length < MIN_QUERY_LENGTH) {
      throw new AppError(
        `Query must be at least ${MIN_QUERY_LENGTH} characters`,
        "VALIDATION_ERROR",
        400,
      );
    }

    const results = await searchAllStores(q);
    return ok({
      results,
      count: results.length,
      query: q,
      storeCount: STORE_COUNT,
    });
  } catch (error) {
    return fail(error);
  }
}
