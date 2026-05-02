import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";

export async function GET() {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const userCrops = await prisma.userCrop.findMany({
      where: { userId },
      include: { crop: true },
      orderBy: { crop: { sortOrder: 'asc' } }
    });
    return NextResponse.json(userCrops.map(uc => uc.crop));
  } catch (error) {
    console.error("[Farmer Crops GET]", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const headerList = await headers();
  const userId = headerList.get("x-user-id");

  if (!userId) {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  }

  try {
    const { cropIds } = await request.json();

    if (!Array.isArray(cropIds)) {
      return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });
    }

    // Replace all crops for this user
    await prisma.$transaction([
      prisma.userCrop.deleteMany({ where: { userId } }),
      prisma.userCrop.createMany({
        data: cropIds.map(cropId => ({
          userId,
          cropId
        }))
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Farmer Crops POST]", error);
    return NextResponse.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
