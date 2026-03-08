import { fail, noContent } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ productId: string }> };

// DELETE /api/tracked/[productId] — untrack a product (requires auth)
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth();
    const { productId } = await params;

    await db.trackedProduct.delete({
      where: {
        userId_productId: { userId: session.user.id, productId },
      },
    });

    return noContent();
  } catch (error) {
    return fail(error);
  }
}
