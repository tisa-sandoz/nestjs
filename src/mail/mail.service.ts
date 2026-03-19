/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Inject, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from './interface/mailtype';

@Injectable()
export class MailService {
  constructor(
    @Inject('MAIL_TRANSPORTER')
    private transporter: nodemailer.Transporter,
    private configService: ConfigService<AppConfig>, // ✅ typed
  ) {}

  async sendOtpEmail(to: string, otp: string) {
    const from = this.configService.get('mail.from', { infer: true });
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    await this.transporter.sendMail({
      from,
      to,
      subject: 'Verify your account',
      html: `<h1>${otp}</h1>`,
    });
  }
}
