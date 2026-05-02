import { NextRequest } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const schema = z.object({
  phone: z.string().regex(/^(0|\+84)[3-9]\d{8}$/),
  otp: z.string().length(4),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return Response.json({ error: "INVALID_INPUT" }, { status: 400 });
  }

  const { phone, otp } = parsed.data;
  const result = await verifyOtp(phone, otp);

  if (!result.valid) {
    return Response.json({ error: result.reason }, { status: 401 });
  }

  // Upsert user
  const user = await prisma.user.upsert({
    where: { phone },
    create: { phone },
    update: { lastLoginAt: new Date() },
  });

  const token = signToken({ sub: user.id, phone: user.phone, role: user.role });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, COOKIE_OPTIONS);

  return Response.json({
    user: { id: user.id, phone: user.phone, role: user.role, name: user.name },
  });
}
