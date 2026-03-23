import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import * as jwt from 'jsonwebtoken';
import { GoogleTokenResponse } from 'src/types/googleTokenResponse';

type GoogleIdTokenPayload = {
  email: string;
  name: string;
  picture: string;
  sub: string;
  email_verified: boolean;
};

@Injectable()
export class GoogleAuthService {
  constructor(private readonly configService: ConfigService) {}

  // 🔹 1. Redirect to Google login
  getAuthUrl(): string {
    const rootUrl = this.configService.getOrThrow<string>('google.authUrl');

    const client_id = this.configService.getOrThrow<string>('google.clientId');

    const redirect_uri =
      this.configService.getOrThrow<string>('google.redirectUri');

    const options = {
      client_id,
      redirect_uri,
      response_type: 'code',
      scope: ['openid', 'email', 'profile'].join(' '),
    };

    const url = new URLSearchParams(options).toString();
    return `${rootUrl}?${url}`;
  }

  // 🔹 2. Exchange code → tokens
  async exchangeCodeForToken(code: string): Promise<GoogleTokenResponse> {
    const tokenUrl = this.configService.getOrThrow<string>('google.tokenUrl');

    const response = await axios.post<GoogleTokenResponse>(
      tokenUrl,
      {
        code,
        client_id: this.configService.getOrThrow<string>('google.clientId'),
        client_secret: this.configService.getOrThrow<string>(
          'google.clientSecret',
        ),
        redirect_uri:
          this.configService.getOrThrow<string>('google.redirectUri'),
        grant_type: 'authorization_code',
      },
      {
        headers: { 'Content-Type': 'application/json' },
      },
    );

    return response.data;
  }

  // 🔹 3. Extract user from id_token (SAFE)
  getUserFromIdToken(id_token: string) {
    const decoded = jwt.decode(id_token);

    // ✅ Type guard (VERY IMPORTANT)
    if (!decoded || typeof decoded !== 'object') {
      throw new BadRequestException('Invalid ID token');
    }

    const payload = decoded as GoogleIdTokenPayload;

    return {
      email: payload.email,
      name: payload.name,
      picture: payload.picture,
      googleId: payload.sub,
      emailVerified: payload.email_verified,
    };
  }

  // 🔹 4. Full flow
  async getUserFromCode(code: string) {
    const tokens = await this.exchangeCodeForToken(code);

    return this.getUserFromIdToken(tokens.id_token);
  }
}
