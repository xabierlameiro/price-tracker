import { fail, ok } from "@/lib/api";
import { db } from "@/lib/db";

// GET /api/stores — list all active stores (public)
export async function GET() {
  try {
    const stores = await db.store.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        type: true,
        websiteUrl: true,
        logoUrl: true,
      },
    });
    return ok(stores);
  } catch (error) {
    return fail(error);
  }
}
