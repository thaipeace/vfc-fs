/**
 * Zalo OA API wrapper
 * Docs: https://developers.zalo.me/docs/official-account
 */

const ZALO_OA_URL = "https://openapi.zalo.me/v2.0/oa";

interface ZaloSendOtpResult {
  error: number;
  message: string;
  data?: Record<string, unknown>;
}

export async function sendOtpViaZalo(
  phone: string,
  otp: string
): Promise<ZaloSendOtpResult> {
  // In dev/test: just log the OTP
  if (process.env.NODE_ENV !== "production") {
    console.log(`[DEV] OTP for ${phone}: ${otp}`);
    return { error: 0, message: "dev_mode_otp_logged" };
  }

  const res = await fetch(`${ZALO_OA_URL}/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      access_token: process.env.ZALO_OA_TOKEN!,
    },
    body: JSON.stringify({
      recipient: { user_id: phone },
      message: {
        text: `[VFC] Mã OTP của bạn là: ${otp}. Hết hạn sau 5 phút. Không chia sẻ mã này.`,
      },
    }),
  });

  return res.json();
}
