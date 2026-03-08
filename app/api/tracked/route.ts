import { created, fail, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import type { NextRequest } from "next/server";

const TrackProductSchema = z.object({ productId: z.cuid() });

// GET /api/tracked — list current user's tracked products (requires auth)
export async function GET() {
  try {
    const session = await requireAuth();
    const items = await db.trackedProduct.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          include: {
            priceEntries: {
              orderBy: { scrapedAt: "desc" },
              take: 5,
              include: {
                store: {
                  select: { id: true, name: true, slug: true, logoUrl: true },
                },
              },
            },
          },
        },
      },
    });
    return ok(items);
  } catch (error) {
    return fail(error);
  }
}

// POST /api/tracked — track a product (idempotent, requires auth)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const { productId } = TrackProductSchema.parse(await request.json());

    const tracked = await db.trackedProduct.upsert({
      where: { userId_productId: { userId: session.user.id, productId } },
      create: { userId: session.user.id, productId },
      update: {},
      include: { product: { select: { id: true, name: true, slug: true } } },
    });

    return created(tracked);
  } catch (error) {
    return fail(error);
  }
}
