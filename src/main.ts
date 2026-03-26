import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { getSessionConfig } from './config/session.config';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import csurf from 'csurf';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ✅ 1. Cookie parser first
  app.use(cookieParser());
  // ✅ 2. Await session middleware (IMPORTANT FIX)
  app.use(await getSessionConfig());
  // ✅ 3. CORS (must allow credentials for cookies)
  app.enableCors({
    origin: 'http://localhost:3001',
    credentials: true,
  });
  // ✅ 4. Global prefix
  app.setGlobalPrefix('api/v1');
  // ✅ 5. Swagger setup

  //csrf implementation for the cookie security
  // app.use(
  //   csurf({
  //     cookie: true,
  //   }),
  // );
  //for validation-pipes enable in dto
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true, // 🔥 important for numbers
    }),
  );

  //baseline security (must-have) we can add csp heders customizable
  app.use(helmet());

  const config = new DocumentBuilder()
    .setTitle('Product API')
    .setDescription('API documentation for products')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document, {
    useGlobalPrefix: true,
  });

  // ✅ 6. Start server
  const PORT = process.env.PORT ?? 3000;
  await app.listen(PORT);

  console.log(`Server running on http://localhost:${PORT}`);
}

bootstrap();
