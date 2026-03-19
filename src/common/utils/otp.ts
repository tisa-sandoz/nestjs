import { randomInt } from 'crypto';

export const generateOtp = (): string => {
  return randomInt(100000, 999999).toString(); // 6-digit secure OTP
};
