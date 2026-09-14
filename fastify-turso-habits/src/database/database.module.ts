import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseProvider, DatabaseAsyncProvider } from './database.provider.js';

@Module({
  imports: [ConfigModule],
  providers: [DatabaseProvider],
  exports: [DatabaseAsyncProvider],
})
export class DatabaseModule {}