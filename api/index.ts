import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from '../src/app.module';
import express from 'express';
import { ValidationPipe, HttpException, HttpStatus, ValidationError } from '@nestjs/common';
// import { join } from 'path';

const expressApp = express();

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

    app.enableCors({
      origin: ['https://next-js-crud-gules.vercel.app', 'http://localhost:3000'],
      methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
      credentials: true,
      allowedHeaders: 'Content-Type, Accept, Authorization',
    });

    // app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

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
  } catch (error) {
    console.error('Error during bootstrap:', error);
    throw error;
  }
}

// Initialize the app
let cachedApp: any;

async function getApp() {
  if (!cachedApp) {
    cachedApp = await bootstrap();
  }
  return cachedApp;
}

// Export the express app
export default expressApp;

// Add handler for serverless environment
export const handler = async (req: any, res: any) => {
  const app = await getApp();
  return app.getHttpAdapter().getInstance().handle(req, res);
};