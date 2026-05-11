import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUser, apiError, apiOk } from "@/lib/request";
import { Role, OrderStatus } from "@prisma/client";
import { z } from "zod";

// GET /api/orders/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getRequestUser(request);
  if (!user) return apiError("UNAUTHORIZED", 401);

  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      user: { select: { phone: true, name: true } },
      sale: { include: { user: { select: { name: true, phone: true } } } },
    },
  });

  if (!order) return apiError("NOT_FOUND", 404);

  // Farmer can only see own orders
  if (user.role === Role.FARMER && order.userId !== user.id)
    return apiError("FORBIDDEN", 403);

  return apiOk(order);
}

const patchSchema = z.object({
  status: z.nativeEnum(OrderStatus).optional(),
  saleId: z.string().optional(),
  note: z.string().optional(),
});

// PATCH /api/orders/[id] — sale/admin updates status
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getRequestUser(request);
  if (!user) return apiError("UNAUTHORIZED", 401);
  if (user.role === Role.FARMER) return apiError("FORBIDDEN", 403);

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) return apiError("INVALID_INPUT", 400);

  const updated = await prisma.order.update({
    where: { id },
    data: parsed.data,
  });

  return apiOk(updated);
}
