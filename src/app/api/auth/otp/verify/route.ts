import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { verifyOtp } from "@/lib/otp";
import { signToken, COOKIE_NAME, COOKIE_OPTIONS } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import crypto from "crypto";

const schema = z.object({
  phone: z.string().regex(/^(0|\+84)[3-9]\d{8}$/),
  otp: z.string().length(4),
});

export async function POST(request: NextRequest) {
  try {
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

    const sessionToken = crypto.randomUUID();

    // Upsert user
    const user = await prisma.user.upsert({
      where: { phone },
      create: { phone, sessionToken },
      update: { lastLoginAt: new Date(), sessionToken },
    });

    const token = await signToken({ sub: user.id, phone: user.phone, role: user.role, sessionId: sessionToken });

    const response = NextResponse.json({
      user: { id: user.id, phone: user.phone, role: user.role, name: user.name },
    });

    response.cookies.set(COOKIE_NAME, token, COOKIE_OPTIONS);
    return response;
  } catch (err: any) {
    console.error("[OTP Verify Error]", err);
    return Response.json({ error: "INTERNAL_SERVER_ERROR", message: err.message }, { status: 500 });
  }
}
