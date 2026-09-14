import { Module } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { UsersController } from './users.controller.js';
import { DatabaseProvider } from '../../database/database.provider.js';

@Module({
  controllers: [UsersController],
  providers: [UsersService, DatabaseProvider],
})
export class UsersModule {}
