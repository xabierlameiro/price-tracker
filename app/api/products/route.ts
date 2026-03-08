import { created, fail, paginated } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  CreateProductSchema,
  ProductQuerySchema,
} from "@/lib/schemas/product.schema";
import type { NextRequest } from "next/server";

// GET /api/products — public catalog with pagination and filtering
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const query = ProductQuerySchema.parse({
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      brand: searchParams.get("brand") ?? undefined,
      q: searchParams.get("q") ?? undefined,
    });

    const { page, pageSize, category, brand, q } = query;
    const skip = (page - 1) * pageSize;
    const where = {
      isActive: true,
      ...(category && { category }),
      ...(brand && { brand }),
      ...(q && { name: { contains: q, mode: "insensitive" as const } }),
    };

    const [items, total] = await Promise.all([
      db.product.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { name: "asc" },
        include: {
          _count: { select: { priceEntries: true, trackedByUsers: true } },
        },
      }),
      db.product.count({ where }),
    ]);

    return paginated(items, page, pageSize, total);
  } catch (error) {
    return fail(error);
  }
}

// POST /api/products — create a product (requires auth)
export async function POST(request: NextRequest) {
  try {
    await requireAuth();
    const body = CreateProductSchema.parse(await request.json());
    const product = await db.product.create({ data: body });
    return created(product);
  } catch (error) {
    return fail(error);
  }
}
