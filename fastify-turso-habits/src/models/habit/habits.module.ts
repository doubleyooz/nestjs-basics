import { Module } from '@nestjs/common';
import { HabitsService } from './habits.service.js';
import { HabitsController } from './habits.controller.js';
import { DatabaseProvider } from '../../database/database.provider.js';

@Module({
  controllers: [HabitsController],
  providers: [HabitsService, DatabaseProvider],
})
export class HabitsModule {}
