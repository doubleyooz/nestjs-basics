import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { BaseSQLiteDatabase } from 'drizzle-orm/sqlite-core';
import type { AnySQLiteTable, SQLiteColumn, SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
import { and, eq, getTableColumns, sql, SQL, SQLWrapper, type InferInsertModel, type InferSelectModel } from "drizzle-orm";

import { PinoLogger } from 'nestjs-pino';

import * as schema from './schema.js';
import { DatabaseAsyncProvider } from './database.provider.js';


import { IDocument } from './interfaces/document.interface.js';
import { LibSQLDatabase } from 'drizzle-orm/libsql';

export type OrderByCondition = {
    field: string;
    direction?: 'asc' | 'desc';
};


type TableWithId = AnySQLiteTable & { id: SQLiteColumn };
type Projection<T extends AnySQLiteTable> = Partial<Record<keyof InferSelectModel<T>, boolean>>;


export abstract class DatabaseRepository<
    T extends TableWithId = TableWithId,
> {

    constructor(
        @Inject(DatabaseAsyncProvider)
        protected readonly db: LibSQLDatabase<typeof schema>,
        protected readonly configService: ConfigService,
        protected readonly table: T,
        protected readonly logger: PinoLogger,
    ) {
        this.logger.setContext(this.constructor.name);
    }


    private buildSelection(projection?: Projection<T>): Record<string, any> {
        const columns = getTableColumns(this.table);
        if (!projection) return columns;
        const selection: Record<string, any> = {};
        for (const [k, include] of Object.entries(projection)) {
            if (include && k in columns) selection[k] = columns[k as keyof typeof columns];
        }
        return Object.keys(selection).length ? selection : columns;
    }


    async create(document: InferInsertModel<T>): Promise<InferSelectModel<T>> {
        const [row] = await this.db
            .insert(this.table)
            .values(document as any)
            .returning();
        return row as InferSelectModel<T>;
    }


    async findAll
        (
            _filter: Partial<InferInsertModel<T>>,
            options?: {
                projection?: Projection<T>;
            },
        ) {
        const columns = getTableColumns(this.table);

        const conditions: SQLWrapper[] = Object.entries(_filter)
            .filter(
                ([key, value]) => value !== undefined && key in columns,
            )
            .map(([key, value]) =>
                eq(columns[key as keyof typeof columns], value as any),
            );

        const selection = this.buildSelection(options?.projection);

        const result = await this.db
            .select(selection)
            .from(this.table)
            .where(and(...conditions));
        return { result };
    }


    async findOneById(_id: number, options?: {
        projection?: Projection<T>;
    },) {
        const selection = this.buildSelection(options?.projection);

        const result = await this.db
            .select(selection)
            .from(this.table)
            .where(eq(this.table.id, _id));

        if (result.length === 0) throw new NotFoundException('Document not found');

        return { result };
    }


    async updateOneById(
        id: number,
        document: Partial<InferInsertModel<T>>,
        options?: {
            projection?: Projection<T>;
        }) {

        const selection = this.buildSelection(options?.projection);

        const { id: _ignoredId, ...safeDocument } = document as Record<string, unknown>;


        const result = await this.db
            .update(this.table)
            .set(safeDocument as any)
            .where(
                and(
                    eq(this.table.id, id),
                ),
            )
            .returning(selection);

        if (result.length === 0) throw new NotFoundException('Document Not Found');
        return { result };
    }

    async deleteOneById(id: number) {
        const rows = await this.db
            .delete(this.table as AnySQLiteTable)
            .where(eq(this.table.id, id))
            .returning({ id: this.table.id });

        if (rows.length === 0) throw new NotFoundException('Document not found');
        return { result: rows[0] };
    }

}
