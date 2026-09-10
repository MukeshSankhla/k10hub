import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from '../db/schema';
import { env } from './env';
import path from 'path';
import fs from 'fs';

// Resolve the database file path reliably to backend directory
const backendRootDir = path.resolve(__dirname, '../../');
const dbPath = path.isAbsolute(env.DATABASE_URL)
  ? env.DATABASE_URL
  : path.resolve(backendRootDir, env.DATABASE_URL);
const dbDir = path.dirname(dbPath);

// Ensure the data directory exists
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

// Create libSQL client (local file-based SQLite)
const client = createClient({
  url: `file:${dbPath}`,
});

// Initialize Drizzle ORM with our schema
export const db = drizzle(client, { schema });

export { client };

export type Database = typeof db;
