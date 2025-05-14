// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {
  ValidationPipe,
  HttpException,
  ValidationError,
  HttpStatus,
} from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';
import * as cors from 'cors';
import * as dotenv from 'dotenv';
import * as serverless from 'serverless-http';

dotenv.config();

let cachedServer: any;

async function bootstrap() {
  if (cachedServer) return cachedServer;

  const expressApp = express();

  // ✅ Set allowed origins dynamically via .env or fallback to hardcoded
  const allowedOrigins = [
    'https://next-js-crud-kcn5-48tfp4ib6-umar-devslooptechs-projects.vercel.app/',
    'http://localhost:3000',
  ];

  // ✅ Use CORS with Express
  expressApp.use(
    cors({
      origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    }),
  );

  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  // ✅ Also enable CORS at Nest level
  app.enableCors({
    origin: allowedOrigins,
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

  await app.init();

  // ✅ Wrap expressApp for serverless deployment
  cachedServer = serverless(expressApp);
  return cachedServer;
}

export const handler = async (event, context) => {
  const server = await bootstrap();
  return server(event, context);
};
