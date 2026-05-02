export interface IOtpService {
  sendOtp(to: string, otp: string): Promise<boolean>;
}
