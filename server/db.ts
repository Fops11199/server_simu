import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// We check both the environment variable (if set) and the default settings
const connectionString = process.env.DATABASE_URL || 'postgresql://postgres:Fops11199@localhost:5432/hostlab_db';

export const pool = new Pool({
  connectionString,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
});

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  // Log queries in dev mode
  if (process.env.NODE_ENV !== 'production') {
    console.log('Executed query', { text, duration, rowsCount: res.rowCount });
  }
  return res;
}
