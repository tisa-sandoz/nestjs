import { BadRequestException, Injectable } from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { generateOtp } from 'src/common/utils/otp';
import { MailService } from 'src/mail/mail.service';
import type { Request, Response } from 'express'; // ✅ type-only import
import { JwtService } from '@nestjs/jwt';
import { VerifyOtpDto } from './dto/verifyotp.dto';

// ✅ JWT Payload Type
export type JwtPayload = {
  userId: string;
  email: string;
  purpose: string;
};

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
    private jwtService: JwtService,
  ) {}

  // ================= SIGNUP =================
  async signUp(data: SignUpDto, res: Response) {
    const normalizedEmail = data.email.toLowerCase().trim();

    //CHECK USER EXSIST
    const userExists = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (userExists) {
      throw new BadRequestException('User already exists with this email');
    }

    //HASH PASSWORD FOR SECURITY
    const hashedPassword = await bcrypt.hash(
      data.password,
      Number(process.env.SALT_ROUNDS) || 12,
    );

    //OTP GENERATION AND HASH THE OTP BEFORE SAVING TO DB
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    //SAVE THE USER DETAILS TO DB
    try {
      const user = await this.prisma.user.create({
        data: {
          name: data.name,
          email: normalizedEmail,
          password: hashedPassword,
          otp: hashedOtp,
          otpExpiry,
          isVerified: false,
        },
        select: {
          id: true,
          name: true,
          email: true,
          createdAt: true,
        },
      });

      //CREATE TEMPTOKEN THIS TOKEN IS BEING SENT VIA COOKIE
      const tempToken = this.jwtService.sign(
        {
          userId: user.id,
          email: user.email,
          purpose: 'otp_verification',
        },
        { expiresIn: '5m' },
      );

      // ✅ Set cookie
      res.cookie('tempToken', tempToken, {
        httpOnly: true,
        secure: false, // 👉 true in production
        sameSite: 'lax',
        maxAge: 5 * 60 * 1000,
      });

      //SEND THE OTP THROUGH EMAIL
      await this.mailService.sendOtpEmail(normalizedEmail, otp);

      return {
        success: true,
        message: 'User created successfully',
        data: user,
      };
    } catch (error) {
      throw new BadRequestException('Signup failed');
      throw error;
    }
  }

  // ================= VERIFY OTP =================
  async verifyOtp(data: VerifyOtpDto, req: Request, res: Response) {
    //EXTRACT OTP AND TEMP TOKEN
    const { otp } = data;

    const cookies = req.cookies as { tempToken?: string };
    const tempToken = cookies?.tempToken;

    if (!tempToken) {
      throw new BadRequestException('Token missing');
    }

    // ✅ Typed JWT payload
    //VERIFY THE TOKEN
    const payload = this.jwtService.verify<JwtPayload>(tempToken);

    if (payload.purpose !== 'otp_verification') {
      throw new BadRequestException('Invalid token purpose');
    }

    const user = await this.prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user || !user.otp || !user.otpExpiry) {
      throw new BadRequestException('Invalid user or OTP');
    }

    // ✅ Compare hashed OTP
    const isMatch = await bcrypt.compare(otp, user.otp);

    if (!isMatch) {
      throw new BadRequestException('OTP verification failed');
    }

    // ✅ Expiry check
    if (user.otpExpiry.getTime() < Date.now()) {
      throw new BadRequestException('OTP expired');
    }

    // ✅ Update user
    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otp: null,
        otpExpiry: null,
      },
    });

    // ✅ Clear cookie
    res.clearCookie('tempToken');

    return {
      message: 'OTP verified successfully',
    };
  }
}
