import { ConfigService } from '@nestjs/config';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema.js';

export const DatabaseAsyncProvider = 'DatabaseProvider';

export const DatabaseProvider = {
  provide: DatabaseAsyncProvider,
  // Pass tursoConfig.KEY to inject the typed configuration object
  inject: [ConfigService],
  useFactory: async (configService: ConfigService) => {
    const db_url = configService.get<string>('DB_URL');
    const db_ssl = configService.get<string>('AUTH_TOKEN');

    if (!db_url) {
      throw new Error('DB_URL is not defined in environment variables');
    }

    const client = createClient({
      url: db_url,
      authToken: db_ssl,
    });

    return drizzle(client, { schema });
  },
};