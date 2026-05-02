import { IOtpService } from './IOtpService';

export class ZaloOtpService implements IOtpService {
  private accessToken: string;

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  async sendOtp(recipientId: string, otp: string, phone: string): Promise<boolean> {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[DEV] Zalo OTP for ${phone}: ${otp}`);
      return true;
    }

    try {
      const response = await fetch('https://openapi.zalo.me/v2.0/oa/message', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          access_token: this.accessToken,
        },
        body: JSON.stringify({
          recipient: { user_id: recipientId },
          message: {
            text: `[VFC] Mã OTP của bạn (${phone}) là: ${otp}. Hết hạn sau 5 phút. Không chia sẻ mã này.`,
          },
        }),
      });

      const result = await response.json();
      return result.error === 0;
    } catch (error) {
      console.error('Zalo OTP Error:', error);
      return false;
    }
  }
}
