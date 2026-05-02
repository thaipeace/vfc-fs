export interface IOtpService {
  sendOtp(to: string, otp: string, phone: string): Promise<boolean>;
}
