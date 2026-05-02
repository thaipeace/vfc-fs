import { IOtpService } from "./IOtpService";

export class TelegramOtpService implements IOtpService {
  private botToken: string;

  constructor(botToken: string) {
    this.botToken = botToken;
  }

  async sendOtp(chatId: string, otp: string): Promise<boolean> {
    const url = `https://api.telegram.org/bot${this.botToken}/sendMessage`;
    const message = `Mã VFC OTP của bạn là: ${otp}. Vui lòng không chia sẻ mã này.`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text: message,
        }),
      });
      return response.ok;
    } catch (error) {
      console.error("Telegram OTP Error:", error);
      return false;
    }
  }
}
