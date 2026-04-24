import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const OTP_TTL_MINUTES = 5;
const MAX_ATTEMPTS = 5;

export function generateOtp(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function createOtpRecord(phone: string): Promise<string> {
  const otp = generateOtp();
  const hashed = await bcrypt.hash(otp, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);

  // Invalidate old OTPs for this phone
  await prisma.otpRequest.updateMany({
    where: { phone, verified: false },
    data: { expiresAt: new Date(0) }, // expire immediately
  });

  await prisma.otpRequest.create({
    data: { phone, otp: hashed, expiresAt },
  });

  return otp; // return plaintext to send via Zalo
}

export async function verifyOtp(
  phone: string,
  plainOtp: string
): Promise<{ valid: boolean; reason?: string }> {
  const record = await prisma.otpRequest.findFirst({
    where: {
      phone,
      verified: false,
      expiresAt: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return { valid: false, reason: "OTP_NOT_FOUND_OR_EXPIRED" };
  if (record.attempts >= MAX_ATTEMPTS)
    return { valid: false, reason: "MAX_ATTEMPTS_EXCEEDED" };

  const match = await bcrypt.compare(plainOtp, record.otp);

  await prisma.otpRequest.update({
    where: { id: record.id },
    data: {
      attempts: { increment: 1 },
      verified: match,
    },
  });

  return match ? { valid: true } : { valid: false, reason: "INVALID_OTP" };
}
