import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpException, HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import express, { RequestHandler } from 'express';

let cachedServer: RequestHandler;

async function createServer(): Promise<RequestHandler> {
  const expressApp = express();
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  app.enableCors({
    origin: ['https://next-js-crud-qr8y.vercel.app', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
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
  return expressApp;
}

export default async function handler(req, res, context) {
  if (!cachedServer) {
    const server = await createServer();
    cachedServer = server;
  }
  return cachedServer(req, res, context);
}
