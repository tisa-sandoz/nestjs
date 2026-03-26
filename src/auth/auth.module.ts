import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MailModule } from 'src/mail/mail.module';
import { JwtModule } from '@nestjs/jwt';
import { GoogleAuthService } from './google-auth.service';
import { RedisModule } from 'src/common/redis/redis.module';
@Module({
  imports: [
    MailModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'temp-secret', // ✅ for now
      signOptions: { expiresIn: '5m' },
    }),
    RedisModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleAuthService],
})
export class AuthModule {}
