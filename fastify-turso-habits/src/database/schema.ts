import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

export const users = sqliteTable('users', {
  id: integer('id').primaryKey({ autoIncrement: true }),

  username: text('username').notNull(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),

  tokenVersion: integer('token_version').notNull().default(0),

  // SQLite has no boolean — store as 0/1, Drizzle maps to boolean in TS.
  active: integer('active', { mode: 'boolean' }).notNull().default(false),

  timezone: text('timezone').notNull().default('UTC'),


  createdAt: integer('created_at', { mode: 'timestamp' })
    .notNull()
    .default(sql`(unixepoch())`),
});