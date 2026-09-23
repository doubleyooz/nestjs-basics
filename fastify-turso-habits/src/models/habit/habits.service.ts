import { ConflictException, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { PinoLogger } from 'nestjs-pino';


import { DatabaseRepository } from '../../database/database.repository.js';
import { DatabaseAsyncProvider } from '../../database/database.provider.js';
import * as schema from '../../database/schema.js';

export type Habit = typeof schema.habits.$inferSelect;
export type NewHabit = typeof schema.habits.$inferInsert;

@Injectable()
export class HabitsService extends DatabaseRepository<typeof schema.habits> {
  constructor(
    @Inject(DatabaseAsyncProvider) db: LibSQLDatabase<typeof schema>,
    config: ConfigService,
    logger: PinoLogger,
  ) {
    super(db, config, schema.habits, logger);
  }
}