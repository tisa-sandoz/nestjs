import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { VerifyOtpDto } from './dto/verifyotp.dto';
import { LoginDto } from './dto/login.dto';
import { SessionAuthGuard } from '../common/guards/session-auth.guard';
import { Role } from 'src/common/enums/role.enum';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('me')
  @UseGuards(SessionAuthGuard)
  getMe(@Req() req: Request) {
    const userId = req.session.user!.id;
    return this.authService.getMe(userId);
  }
  @Post('signup')
  @ApiOperation({ summary: 'user signup' })
  @ApiBody({
    type: SignUpDto,
    description: 'signup payload',
  })
  @ApiResponse({
    status: 201,
    description: 'User created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'User already exists or validation failed',
  })
  signUp(@Body() data: SignUpDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signUp(data, res);
  }

  @Post('verify-otp')
  @ApiOperation({ summary: 'verify otp' })
  @ApiBody({
    type: VerifyOtpDto,
    description: 'verify otp',
  })
  verifyOtp(
    @Body() data: VerifyOtpDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.verifyOtp(data, req, res);
  }

  @Post('login')
  @ApiOperation({ summary: 'login' })
  @ApiBody({
    type: LoginDto,
    description: 'login',
  })
  async login(@Body() data: LoginDto, @Req() req: Request) {
    const user = await this.authService.login(data);
    req.session.user = {
      id: user.id,
      // email: user.email,
      // name: user.name,
      role: user?.role as Role, // 🔥 IMPORTANT (add this)
    };
    return {
      message: 'login successful',
      user: req.session.user,
    };
  }
  @Get('google')
  googleLogin(@Res() res: Response) {
    const url = this.authService.getGoogleAuthUrl();
    return res.redirect(url);
  }
  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    await this.authService.handleGoogleLogin(code, req);

    // ❌ REMOVE manual cookie
    // express-session already handles this

    return res.redirect('http://localhost:5173'); // frontend
  }
  @Post('logout')
  @UseGuards(SessionAuthGuard)
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }
}
