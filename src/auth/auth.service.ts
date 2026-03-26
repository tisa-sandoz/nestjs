import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { SignUpDto } from './dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { generateOtp } from 'src/common/utils/otp';
import { MailService } from 'src/mail/mail.service';
import type { Request, Response } from 'express'; // ✅ type-only import
import { JwtService } from '@nestjs/jwt';
import { VerifyOtpDto } from './dto/verifyotp.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import { GoogleAuthService } from './google-auth.service';
import { Role } from 'src/common/enums/role.enum';
import type { RedisClientType } from 'redis';

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
    private configService: ConfigService,
    private googleService: GoogleAuthService,

    @Inject('REDIS_CLIENT')
    private redisClient: RedisClientType,
  ) {}

  //==================GetMe ===================
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return {
      user,
    };
  }

  // ================= SIGNUP =================
  async signUp(data: SignUpDto, res: Response) {
    const normalizedEmail = data.email.toLowerCase().trim();

    // 🔴 1. Check user exists
    const userExists = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (userExists) {
      throw new BadRequestException('User already exists with this email');
    }

    // 🔴 2. Hash password
    const hashedPassword = await bcrypt.hash(
      data.password,
      Number(process.env.SALT_ROUNDS) || 12,
    );

    // 🔴 3. Create user
    const user = await this.prisma.user.create({
      data: {
        name: data.name,
        email: normalizedEmail,
        password: hashedPassword,
        isVerified: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });

    // 🔴 4. Generate OTP
    const otp = generateOtp();
    const hashedOtp = await bcrypt.hash(otp, 10);

    // 🔴 5. Create temp token
    const tempToken = this.jwtService.sign(
      {
        userId: user.id,
        purpose: 'otp_verification', // removed unnecessary email
      },
      { expiresIn: '5m' },
    );

    // 🔴 6. Set cookie
    res.cookie('tempToken', tempToken, {
      httpOnly: true,
      secure: false, // ✅ safer
      sameSite: 'lax',
      maxAge: 5 * 60 * 1000,
    });

    // 🔴 7. Parallel operations (OPTIMIZED)
    await Promise.all([
      this.redisClient.set(`otp:${user.id}`, hashedOtp, { EX: 300 }),
      this.redisClient.del(`otp_attempts:${user.id}`),
      this.mailService.sendOtpEmail(normalizedEmail, otp),
    ]);

    return {
      success: true,
      message: 'User created successfully',
      data: user,
    };
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
    const userId = payload.userId;

    if (payload.purpose !== 'otp_verification') {
      throw new BadRequestException('Invalid token purpose');
    }

    //rate limiting hte user should be ablt to type the otp only for 5 times
    const attempts = await this.redisClient.incr(`otp_attempts:${userId}`);
    if (attempts === 1) {
      await this.redisClient.expire(`otp_attempts:${userId}`, 300);
    }
    if (attempts > 5) {
      throw new BadRequestException('Too many attempts');
    }
    const storedOtp = await this.redisClient.get(`otp:${userId}`);
    if (!storedOtp) {
      throw new BadRequestException('OTP expired');
    }
    const isMatch = await bcrypt.compare(otp, storedOtp);

    if (!isMatch) {
      throw new BadRequestException('Invalid OTP');
    }
    // 🔴 cleanup
    await this.redisClient.del(`otp:${userId}`);
    await this.redisClient.del(`otp_attempts:${userId}`);

    // 🔴 Mark user verified
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });

    // 🔐 Prevent Session Fixation Attack
    // We regenerate the session after authentication (OTP/login)
    // to invalidate any existing session ID and create a new one.
    // This ensures that even if an attacker somehow knew the old session ID,
    // they cannot reuse it after the user logs in.
    await new Promise<void>((resolve, reject) => {
      req.session.regenerate((err) => {
        if (err) {
          return reject(
            err instanceof Error
              ? err
              : new Error('Session regeneration failed'),
          );
        }
        req.session.user = {
          id: user.id,
          role: user.role as Role,
        };
        resolve();
      });
    });
    res.clearCookie('tempToken');
    return {
      message: 'OTP verified successfully',
      user: req.session.user,
    };
  }

  async login(data: LoginDto) {
    const { email, password } = data;
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new BadRequestException('user doesnot exsist');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new BadRequestException('incorrect password');
    }
    if (!user.isVerified) {
      throw new BadRequestException('please verify your email first');
    }
    // return {
    //   message: 'login successfull',
    //   user: req.session.user,
    // };

    return user;
  }

  getGoogleAuthUrl(): string {
    return this.googleService.getAuthUrl();
  }
  async handleGoogleLogin(code: string, req: Request) {
    if (!code) {
      throw new UnauthorizedException('Authorization code missing');
    }
    const googleUser = await this.googleService.getUserFromCode(code);
    if (!googleUser?.email) {
      throw new UnauthorizedException('Invalid Google user');
    }

    const normalizedEmail = googleUser.email.toLowerCase().trim();

    let user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          name: googleUser.name,
          email: normalizedEmail,
          password: '',
          isVerified: true,
        },
      });
    }
    req.session.user = {
      id: user.id,
      role: user.role as Role,
    };

    return {
      message: 'Google login successful',
      user: req.session.user,
    };
  }
  async logout(req: Request, res: Response) {
    return new Promise((resolve, reject) => {
      req.session.destroy((err) => {
        if (err) {
          return reject(
            err instanceof Error ? err : new Error('Logout failed'),
          );
        }

        // 🔴 Clear cookie from browser
        res.clearCookie('connect.sid');

        resolve({
          message: 'Logged out successfully',
        });
      });
    });
  }
}
