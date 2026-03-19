/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

export const MailProvider = {
  provide: 'MAIL_TRANSPORTER',
  useFactory: (configService: ConfigService) => {
    const mailConfig = configService.get('mail');

    return nodemailer.createTransport({
      host: mailConfig.host,
      port: mailConfig.port,
      secure: mailConfig.secure,
      auth: {
        user: mailConfig.user,
        pass: mailConfig.pass,
      },
    });
  },
  inject: [ConfigService],
};
