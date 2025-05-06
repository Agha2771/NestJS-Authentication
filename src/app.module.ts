import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { JwtMiddleware } from './auth/jwt.middleware';
import { BannerModule } from './banners/banner.module';
@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI ?? (() => {
      throw new Error('MONGO_URI environment variable is required');
    })()),
    AuthModule,
    UsersModule,
    BannerModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({
        path: 'api/auth/profile',
        method: RequestMethod.GET,
      });
  }
}
