import { fail, ok, verifyCronSecret } from "@/lib/api";
import { db } from "@/lib/db";
import { AuthenticationError } from "@/lib/errors";
import type { NextRequest } from "next/server";

// POST /api/scrape — trigger a scrape run for all active products
// Protected by SCRAPE_CRON_SECRET (Vercel cron or manual trigger).
export async function POST(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) throw new AuthenticationError();

    // Count active products to scrape
    const [productCount, storeCount] = await Promise.all([
      db.product.count({ where: { isActive: true } }),
      db.store.count({ where: { isActive: true } }),
    ]);

    // Fase 3 will wire the scraper registry here to iterate products × stores
    // and save price entries via db.priceEntry.create() for each result.

    return ok({
      message: "Scrape job queued",
      products: productCount,
      stores: storeCount,
      startedAt: new Date().toISOString(),
    });
  } catch (error) {
    return fail(error);
  }
}
