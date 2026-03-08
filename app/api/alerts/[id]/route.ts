import { fail, noContent, ok } from "@/lib/api";
import { requireAuth } from "@/lib/auth";
import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { UpdateAlertSchema } from "@/lib/schemas/alert.schema";
import type { NextRequest } from "next/server";

type RouteContext = { params: Promise<{ id: string }> };

// PATCH /api/alerts/[id] — update alert targetPrice or isActive (requires auth)
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await params;
    const body = UpdateAlertSchema.parse(await request.json());

    // Verify ownership before mutating
    const existing = await db.priceAlert.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) throw new NotFoundError("Alert");

    const updated = await db.priceAlert.update({ where: { id }, data: body });
    return ok(updated);
  } catch (error) {
    return fail(error);
  }
}

// DELETE /api/alerts/[id] — delete alert (requires auth, own alerts only)
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const session = await requireAuth();
    const { id } = await params;

    // Verify ownership before deleting
    const existing = await db.priceAlert.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) throw new NotFoundError("Alert");

    await db.priceAlert.delete({ where: { id } });
    return noContent();
  } catch (error) {
    return fail(error);
  }
}
