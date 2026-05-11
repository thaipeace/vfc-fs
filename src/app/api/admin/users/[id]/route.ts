import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getRequestUser, requireRole, apiError, apiOk } from "@/lib/request";
import { Role } from "@prisma/client";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getRequestUser(request);
  if (!user || !requireRole(user, Role.ADMIN)) return apiError("Unauthorized", 401);

  const targetUser = await prisma.user.findUnique({
    where: { id },
    include: {
      farmerProfile: true,
      saleProfile: true,
    }
  });

  if (!targetUser) return apiError("User not found", 404);
  return apiOk(targetUser);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getRequestUser(request);
  if (!user || !requireRole(user, Role.ADMIN)) return apiError("Unauthorized", 401);

  const body = await request.json();
  const { name, role, isActive } = body;

  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: name !== undefined ? name : undefined,
      role: role !== undefined ? role : undefined,
      isActive: isActive !== undefined ? isActive : undefined,
    }
  });

  return apiOk(updatedUser);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await getRequestUser(request);
  if (!user || !requireRole(user, Role.ADMIN)) return apiError("Unauthorized", 401);

  // Check if trying to delete self
  if (user.id === id) return apiError("Cannot delete yourself", 400);

  await prisma.user.delete({
    where: { id }
  });

  return apiOk({ success: true });
}
