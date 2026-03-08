import { created, fail, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateAlertSchema } from "@/lib/schemas/alert.schema";
import type { NextRequest } from "next/server";

// GET /api/alerts — list current user's price alerts (requires auth)
export async function GET() {
  try {
    const session = await requireAuth();
    const alerts = await db.priceAlert.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        product: {
          select: { id: true, name: true, slug: true, imageUrl: true },
        },
      },
    });
    return ok(alerts);
  } catch (error) {
    return fail(error);
  }
}

// POST /api/alerts — create a price alert (requires auth)
export async function POST(request: NextRequest) {
  try {
    const session = await requireAuth();
    const body = CreateAlertSchema.parse(await request.json());

    const alert = await db.priceAlert.create({
      data: {
        userId: session.user.id,
        productId: body.productId,
        targetPrice: body.targetPrice,
      },
      include: {
        product: { select: { id: true, name: true, slug: true } },
      },
    });

    return created(alert);
  } catch (error) {
    return fail(error);
  }
}
