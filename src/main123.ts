// // src/main.ts

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import { ValidationPipe } from '@nestjs/common';

// async function bootstrap() {
//   const app = await NestFactory.create(AppModule);

//   app.enableCors({
//     origin: ['http://localhost:3000'],
//     credentials: true,
//   });

//   app.useGlobalPipes(
//     new ValidationPipe({
//       transform: true,
//       whitelist: true,
//       forbidNonWhitelisted: true,
//     }),
//   );

//   await app.listen(3001);
//   console.log(`🚀 Server is running on http://localhost:3001`);
// }
// bootstrap();
