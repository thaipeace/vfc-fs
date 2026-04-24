import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getRequestUser, apiError, apiOk } from "@/lib/request";
import { Role } from "@prisma/client";

const createSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().min(1),
    })
  ).min(1),
  note: z.string().optional(),
  deliveryAddr: z.object({
    province: z.string(),
    district: z.string(),
    ward: z.string(),
    address: z.string(),
  }).optional(),
});

// GET /api/orders — farmer sees own, sale/admin sees all
export async function GET(request: NextRequest) {
  const user = getRequestUser(request);
  if (!user) return apiError("UNAUTHORIZED", 401);

  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page") ?? 1));
  const limit = Math.min(50, Math.max(1, Number(searchParams.get("limit") ?? 20)));

  const where =
    user.role === Role.FARMER ? { userId: user.id } : {};

  const [total, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      include: {
        items: { include: { product: { select: { name: true, sku: true, imageUrls: true } } } },
        user: { select: { phone: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return apiOk({ data: orders, total, page, limit });
}

// POST /api/orders — create order (farmer only)
export async function POST(request: NextRequest) {
  const user = getRequestUser(request);
  if (!user) return apiError("UNAUTHORIZED", 401);
  if (user.role !== Role.FARMER) return apiError("FORBIDDEN", 403);

  const body = await request.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success)
    return apiError("INVALID_INPUT", 400);

  const { items, note, deliveryAddr } = parsed.data;

  // Fetch products & validate stock
  const products = await prisma.product.findMany({
    where: { id: { in: items.map((i) => i.productId) }, isActive: true },
  });

  if (products.length !== items.length)
    return apiError("PRODUCT_NOT_FOUND_OR_INACTIVE", 400);

  const productMap = new Map<string, any>(products.map((p: any) => [p.id, p]));
  let totalAmount = 0;

  const orderItems = items.map((item: any) => {
    const product = productMap.get(item.productId)!;
    const unitPrice = Number(product.price);
    totalAmount += unitPrice * item.quantity;
    return {
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: product.price,
    };
  });

  const order = await prisma.order.create({
    data: {
      userId: user.id,
      totalAmount,
      note,
      deliveryAddr,
      items: { create: orderItems },
    },
    include: { items: true },
  });

  return apiOk(order, 201);
}
