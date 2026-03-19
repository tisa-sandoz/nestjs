import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
// import { getSessionConfig } from './config/session.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Correct order
  app.use(cookieParser());

  // const redisClient = app.get('REDIS_CLIENT');

  // app.use(getSessionConfig(redisClient));

  app.enableCors({
    origin: 'http://localhost:3000',
    credentials: true,
  });

  app.setGlobalPrefix('api/v1');

  const config = new DocumentBuilder()
    .setTitle('Product API')
    .setDescription('API documentation for products')
    .setVersion('1.0')
    // ❌ remove bearer auth for now
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  await app.listen(process.env.PORT ?? 3000);

  console.log(`Server running on http://localhost:${process.env.PORT ?? 3000}`);
}
bootstrap();
