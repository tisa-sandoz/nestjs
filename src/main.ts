import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  app.use(cookieParser());
  const config = new DocumentBuilder()
    .setTitle('Product API')
    .setDescription('API documentation for products')
    .setVersion('1.0')
    .addBearerAuth() // 🔥 for Authorize button
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, document); // better naming
  console.log('ENV:', process.env.DATABASE_URL);
  await app.listen(process.env.PORT ?? 3000);
  console.log('Swagger running at http://localhost:3000/api-docs');
}
bootstrap();
