import { NextRequest } from "next/server";
import { z } from "zod";
import { createOtpRecord } from "@/lib/otp";
import { sendOtpViaZalo } from "@/lib/zalo";

const schema = z.object({
  phone: z.string().regex(/^(0|\+84)[3-9]\d{8}$/, "Số điện thoại không hợp lệ"),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = schema.safeParse(body);

  if (!parsed.success) {
    return Response.json(
      { error: "INVALID_PHONE", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { phone } = parsed.data;

  try {
    const otp = await createOtpRecord(phone);
    await sendOtpViaZalo(phone, otp);
    return Response.json({ success: true, message: "OTP đã được gửi" });
  } catch (err) {
    console.error("[OTP Send Error]", err);
    return Response.json({ error: "INTERNAL_ERROR" }, { status: 500 });
  }
}
