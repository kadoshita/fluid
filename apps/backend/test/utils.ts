import { db } from '../src/db/client';
import { sql } from 'drizzle-orm';

export const cleanupTables = async () => {
  await db.execute(sql`TRUNCATE TABLE records, categories`);
};

export const fetchRecordById = async (id: string) => {
  return await db.query.records.findFirst({
    where: (records, { eq }) => eq(records.id, id),
  });
};

export const fetchCategoryByName = async (name: string) => {
  return await db.query.categories.findFirst({
    where: (categories, { eq }) => eq(categories.name, name),
  });
};
