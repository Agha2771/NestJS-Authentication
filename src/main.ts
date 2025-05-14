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
  expressApp.use(cors({
    origin: [
      'https://nest-js-authentication-git-b-921506-umar-devslooptechs-projects.vercel.app',
      'http://localhost:3000' // Add localhost for development
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));

  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = errors.flatMap(err =>
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

  cachedServer = serverless(expressApp);
  return cachedServer;
}

export const handler = async (event, context) => {
  const server = await bootstrap();
  return server(event, context);
};
