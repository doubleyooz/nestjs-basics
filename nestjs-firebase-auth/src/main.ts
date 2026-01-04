import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from 'nestjs-pino';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const documentBuilder = new DocumentBuilder()
    .setTitle('Firebase Auth API')
    .setDescription('API for Firebase Authentication')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strips away fields that aren't in the DTO
      forbidNonWhitelisted: true, // Throws an error if extra fields are sent
      transform: true, // Automatically converts types (e.g., string "1" to number 1)
    }),
  );
  app.useLogger(app.get(Logger));

  await app.listen(app.get(ConfigService).getOrThrow('PORT'));
}
bootstrap();
