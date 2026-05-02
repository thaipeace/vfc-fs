import { IOtpService } from '../services/otp/IOtpService';

export class OtpController {
  private service: IOtpService;

  constructor(service: IOtpService) {
    this.service = service;
  }

  setService(service: IOtpService) {
    this.service = service;
  }

  async send(to: string, otp: string) {
    return await this.service.sendOtp(to, otp);
  }
}
