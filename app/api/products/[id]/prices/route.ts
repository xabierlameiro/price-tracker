import { fail, ok } from "@/lib/api";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { PriceHistoryQuerySchema } from "@/lib/schemas/price.schema";
import type { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/products/[id]/prices — price history for a product (public)
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;

    const product = await db.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
      select: { id: true },
    });
    if (!product) throw new NotFoundError("Product");

    const { searchParams } = request.nextUrl;
    const query = PriceHistoryQuerySchema.parse({
      storeId: searchParams.get("storeId") ?? undefined,
      from: searchParams.get("from") ?? undefined,
      to: searchParams.get("to") ?? undefined,
      limit: searchParams.get("limit") ?? undefined,
    });

    const { storeId, from, to, limit } = query;

    const entries = await db.priceEntry.findMany({
      where: {
        productId: product.id,
        ...(storeId && { storeId }),
        ...((from ?? to) && {
          scrapedAt: {
            ...(from && { gte: from }),
            ...(to && { lte: to }),
          },
        }),
      },
      orderBy: { scrapedAt: "desc" },
      take: limit,
      include: {
        store: { select: { id: true, name: true, slug: true, logoUrl: true } },
      },
    });

    return ok(entries);
  } catch (error) {
    return fail(error);
  }
}
