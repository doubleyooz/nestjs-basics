// src/users/users.repository.ts
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { eq, and, sql, type SQLWrapper } from 'drizzle-orm';
import { LibSQLDatabase } from 'drizzle-orm/libsql';
import { PinoLogger } from 'nestjs-pino';

import { DatabaseRepository } from '../../database/database.repository.js';
import { DatabaseAsyncProvider } from '../../database/database.provider.js';
import * as schema from '../../database/schema.js';

export type User = typeof schema.users.$inferSelect;
export type NewUser = typeof schema.users.$inferInsert;

@Injectable()
export class UsersService extends DatabaseRepository<typeof schema.users> {
  constructor(
    @Inject(DatabaseAsyncProvider) db: LibSQLDatabase<typeof schema>,
    config: ConfigService,
    logger: PinoLogger,
  ) {
    super(db, config, schema.users, logger);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    const [row] = await this.db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email))
      .limit(1);
    return row;
  }

  async findByEmailWithTokenCheck(email: string, tokenVersion?: number) {
    const conditions: SQLWrapper[] = [eq(schema.users.email, email)];
    if (tokenVersion !== undefined) {
      conditions.push(eq(schema.users.tokenVersion, tokenVersion));
      conditions.push(eq(schema.users.active, true));
    }
    const [row] = await this.db
      .select({
        id: schema.users.id,
        email: schema.users.email,
        username: schema.users.username,
        active: schema.users.active,
      })
      .from(schema.users)
      .where(and(...conditions))
      .limit(1);
    return row;
  }


  async setEmail(email: string, newEmail: string) {
    const [row] = await this.db
      .update(schema.users)
      .set({ email: newEmail })
      .where(and(eq(schema.users.email, email), eq(schema.users.active, true)))
      .returning({ email: schema.users.email });
    return row;
  }

  async activate(email: string) {
    const [row] = await this.db
      .update(schema.users)
      .set({ active: true })
      .where(and(eq(schema.users.email, email), eq(schema.users.active, false)))
      .returning({ email: schema.users.email, active: schema.users.active });
    return row;
  }

  async revokeToken(id: number) {
    const [row] = await this.db
      .update(schema.users)
      .set({ tokenVersion: sql`${schema.users.tokenVersion} + 1` })
      .where(eq(schema.users.id, id))
      .returning({ email: schema.users.email });
    return row;
  }
}