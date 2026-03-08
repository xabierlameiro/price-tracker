import { fail, noContent, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { UpdateProductSchema } from "@/lib/schemas/product.schema";
import type { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

// GET /api/products/[id] — get by id or slug (public)
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const product = await db.product.findFirst({
      where: { OR: [{ id }, { slug: id }] },
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
    });
    if (!product) throw new NotFoundError("Product");
    return ok(product);
  } catch (error) {
    return fail(error);
  }
}

// PATCH /api/products/[id] — update product (requires auth)
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    await requireAuth();
    const { id } = await params;
    const body = UpdateProductSchema.parse(await request.json());
    const product = await db.product.update({ where: { id }, data: body });
    return ok(product);
  } catch (error) {
    return fail(error);
  }
}

// DELETE /api/products/[id] — delete product (requires auth)
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    await requireAuth();
    const { id } = await params;
    await db.product.delete({ where: { id } });
    return noContent();
  } catch (error) {
    return fail(error);
  }
}
