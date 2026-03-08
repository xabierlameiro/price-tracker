import { created, fail, verifyCronSecret } from "@/lib/api";
import { db } from "@/lib/db";
import { AuthenticationError } from "@/lib/errors";
import { CreatePriceEntrySchema } from "@/lib/schemas/price.schema";
import type { NextRequest } from "next/server";

// POST /api/prices — record a new price entry (protected by cron secret)
export async function POST(request: NextRequest) {
  try {
    if (!verifyCronSecret(request)) throw new AuthenticationError();

    const body = CreatePriceEntrySchema.parse(await request.json());
    const entry = await db.priceEntry.create({
      data: {
        productId: body.productId,
        storeId: body.storeId,
        price: body.price,
        currency: body.currency,
        url: body.url,
        source: body.source,
        isAvailable: body.isAvailable,
      },
    });

    return created(entry);
  } catch (error) {
    return fail(error);
  }
}
