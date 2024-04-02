import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

const host = process.env.DB_HOST ?? 'localhost';
const user = process.env.DB_USER ?? 'postgres';
const password = process.env.DB_PASSWORD ?? 'postgres';
const database = process.env.DB_NAME ?? 'postgres';
const connectionString = `postgres://${user}:${password}@${host}/${database}`;
const client = postgres(connectionString);
export const db = drizzle(client, {
  schema,
});
