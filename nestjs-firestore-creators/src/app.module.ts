import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import * as Joi from 'joi';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FirebaseModule } from './database/firebase.module';

import { CreatorModule } from './models/creator/creator.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        PORT: Joi.number().required(),
        HASH_SALT: Joi.number().required(),
        ACCESS_TOKEN_SECRET: Joi.string().required(),
        ACCESS_TOKEN_EXPIRATION: Joi.number().required(),
        REFRESH_TOKEN_SECRET: Joi.string().required(),
        REFRESH_TOKEN_EXPIRATION: Joi.number().required(),
        FIREBASE_PRIVATE_KEY: Joi.string().required(),
      }),
      isGlobal: true,
    }),
    LoggerModule.forRoot(),
    FirebaseModule,
    CreatorModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
