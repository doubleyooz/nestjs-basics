import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';
import { DatabaseModule } from './database/database.module.js';

import Joi from 'joi';
import { UsersModule } from './models/user/users.module.js';
import { LoggerModule } from 'nestjs-pino';

@Module({
  imports: [ConfigModule.forRoot({
    validationSchema: Joi.object({
      PORT: Joi.number().required(),
      HASH_SALT: Joi.number().required(),
      ACCESS_TOKEN_SECRET: Joi.string().required(),
      ACCESS_TOKEN_EXPIRATION: Joi.number().required(),
      REFRESH_TOKEN_SECRET: Joi.string().required(),
      REFRESH_TOKEN_EXPIRATION: Joi.number().required(),
      DB_URL: Joi.string().required(),
      AUTH_TOKEN: Joi.string().required(),
    }),
    isGlobal: true,
    }),
    LoggerModule.forRoot(),
    UsersModule,
    DatabaseModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
