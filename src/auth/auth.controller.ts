import { Body, Controller, Post, Req, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/signup.dto';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import type { Response, Request } from 'express';
import { VerifyOtpDto } from './dto/verifyotp.dto';
import { LoginDto } from './dto/login.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post()
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
  @Post('login')
  login(@Body() data: LoginDto, @Req() req: Request) {
    return this.authService.login(data, req);
  }
}
