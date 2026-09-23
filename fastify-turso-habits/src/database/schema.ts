import { sqliteTable, text, integer, index, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { sql, relations } from 'drizzle-orm';

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

export const habits = sqliteTable('habits',  {
    id: integer('id').primaryKey({ autoIncrement: true }),

    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),

    name: text('name').notNull(),
    icon: text('icon'),
    color: text('color'),
    position: integer('position').notNull().default(0),

    active: integer('active', { mode: 'boolean' }).notNull().default(true),

    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),

    archivedAt: integer('archived_at', { mode: 'timestamp' }),
  },
  (table) => ({
    userIdx: index('habits_user_id_idx').on(table.userId),
    userPositionIdx: index('habits_user_position_idx').on(table.userId, table.position),
  }),
);

export const habitCompletions = sqliteTable(
  'habit_completions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),

    habitId: integer('habit_id')
      .notNull()
      .references(() => habits.id, { onDelete: 'cascade' }),

    // Store as Unix seconds (or switch to text 'YYYY-MM-DD' if you prefer a plain date string).
    date: integer('date', { mode: 'timestamp' }).notNull(),

    completed: integer('completed', { mode: 'boolean' }).notNull().default(true),

    createdAt: integer('created_at', { mode: 'timestamp' })
      .notNull()
      .default(sql`(unixepoch())`),
  },
  (table) => ({
    habitIdx: index('habit_completions_habit_id_idx').on(table.habitId),
    // One row per habit per day
    habitDateUniq: uniqueIndex('habit_completions_habit_date_uniq').on(
      table.habitId,
      table.date,
    ),
  }),
);

/* -------------------------
 * Relations (for `db.query`)
 * ------------------------- */

export const usersRelations = relations(users, ({ many }) => ({
  habits: many(habits),
}));

export const habitsRelations = relations(habits, ({ one, many }) => ({
  user: one(users, {
    fields: [habits.userId],
    references: [users.id],
  }),
  completions: many(habitCompletions),
}));

export const habitCompletionsRelations = relations(habitCompletions, ({ one }) => ({
  habit: one(habits, {
    fields: [habitCompletions.habitId],
    references: [habits.id],
  }),
}));

/* -------------------------
 * Types
 * ------------------------- */



export type HabitCompletion = typeof habitCompletions.$inferSelect;
export type NewHabitCompletion = typeof habitCompletions.$inferInsert;