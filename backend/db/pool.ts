import 'server-only';

import { Pool } from 'pg';

const globalForDatabase = globalThis as typeof globalThis & {
  rinjoPool?: Pool;
};

export function databasePool(): Pool {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) throw new Error('DATABASE_URL is not configured.');

  if (!globalForDatabase.rinjoPool) {
    globalForDatabase.rinjoPool = new Pool({
      connectionString,
      max: 5,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 30000,
    });
  }

  return globalForDatabase.rinjoPool;
}
