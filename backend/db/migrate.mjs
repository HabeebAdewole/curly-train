import { readFile, readdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import pg from 'pg';

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error('DATABASE_URL is required to run migrations.');
  process.exitCode = 1;
} else {
  const directory = path.join(path.dirname(fileURLToPath(import.meta.url)), 'migrations');
  const pool = new pg.Pool({ connectionString, max: 1 });

  try {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query('SELECT pg_advisory_xact_lock(74210923)');
      await client.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
        name text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )`);

      for (const name of (await readdir(directory)).filter((file) => file.endsWith('.sql')).sort()) {
        const applied = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [name]);
        if (applied.rowCount) continue;
        await client.query(await readFile(path.join(directory, name), 'utf8'));
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
        console.info(`Applied ${name}`);
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Migration failed:', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}
