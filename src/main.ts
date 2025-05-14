// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  HttpException,
  ValidationError,
  HttpStatus,
} from '@nestjs/common';
import * as dotenv from 'dotenv';

dotenv.config();

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:3000',
    'https://nest-js-authentication-git-b-921506-umar-devslooptechs-projects.vercel.app',
    'https://nest-js-authentication-git-b-921506-umar-devslooptechs-projects.vercel.app/api',
  ];

  // ✅ Enable CORS at Nest level
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://nest-js-authentication-git-b-921506-umar-devslooptechs-projects.vercel.app',
      'https://nest-js-authentication-git-b-921506-umar-devslooptechs-projects.vercel.app/api',
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  // ✅ Global validation pipe with custom error formatting
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.flatMap((err) =>
          Object.values(err.constraints || {}),
        );
        return new HttpException(
          {
            success: false,
            message: 'Validation failed',
            errors: messages,
          },
          HttpStatus.UNPROCESSABLE_ENTITY,
        );
      },
    }),
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Server running locally at http://localhost:${port}`);
}

bootstrap();
