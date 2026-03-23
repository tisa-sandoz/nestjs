import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { getSessionConfig } from './config/session.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // ✅ 1. Cookie parser first
  app.use(cookieParser());
  // ✅ 2. Await session middleware (IMPORTANT FIX)
  app.use(await getSessionConfig());
  // ✅ 3. CORS (must allow credentials for cookies)
  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });
  // ✅ 4. Global prefix
  app.setGlobalPrefix('api/v1');
  // ✅ 5. Swagger setup
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
