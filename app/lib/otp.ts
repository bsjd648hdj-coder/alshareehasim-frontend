import { createHmac, randomInt, timingSafeEqual } from "crypto";

export function generateOtp(): string {
  return String(randomInt(100000, 1000000));
}

export function hashOtp(otp: string): string {
  const secret = process.env.OTP_HASH_SECRET;
  if (!secret) throw new Error("OTP_HASH_SECRET is not set");
  return createHmac("sha256", secret).update(otp).digest("hex");
}

export function verifyOtpHash(otp: string, hash: string): boolean {
  const computed = hashOtp(otp);
  try {
    return timingSafeEqual(Buffer.from(computed, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}
