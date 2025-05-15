import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { HttpException, HttpStatus, ValidationError, ValidationPipe } from '@nestjs/common';
import * as express from 'express';
import { join } from 'path';

const server = express();

async function createNestServer(expressInstance) {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressInstance));

  app.enableCors({
    origin: ['https://next-js-crud-gules.vercel.app', 'http://localhost:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

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
  return app;
}

const app = createNestServer(server);
export default server; 
