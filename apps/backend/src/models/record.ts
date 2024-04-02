import { randomUUID } from 'crypto';
import { Category } from './category';
import { db } from '../db/client';
import { records } from '../db/schema';
import { PostgresError } from 'postgres';

export class RecordAlreadyExistsError extends Error {
  public readonly statusCode = 409;
  public readonly message = 'Conflict';
  constructor() {
    super();
  }
}

export class Record {
  private constructor(
    public readonly id: ReturnType<typeof randomUUID>,
    public title: string,
    public description: string,
    public comment: string,
    public url: string,
    public domain: string,
    public categoryId: ReturnType<typeof randomUUID>,
    public addedAt: Date,
    public readonly accountId: ReturnType<typeof randomUUID>,
    public image?: string,
  ) {}

  public static async Create(
    title: string,
    description: string,
    comment: string,
    url: string,
    categoryName: string,
    image?: string,
  ) {
    try {
      const category = await Category.FindOrCreate(categoryName, randomUUID());
      const urlObj = new URL(url);
      const record = new Record(
        randomUUID(),
        title,
        description,
        comment,
        url,
        urlObj.host,
        category.id,
        new Date(),
        randomUUID(),
        image,
      );
      await db.insert(records).values(record);
      return record;
    } catch (error) {
      if (error instanceof PostgresError) {
        if (error.code === '23505') {
          throw new RecordAlreadyExistsError();
        }
      }

      throw error;
    }
  }
}
