import { randomUUID } from 'crypto';
import { db } from '../db/client';
import { categories } from '../db/schema';

export class Category {
  constructor(
    public readonly id: ReturnType<typeof randomUUID>,
    public name: string,
    public addedAt: Date,
    public enabled: boolean,
    public readonly accountId: ReturnType<typeof randomUUID>,
  ) {}

  public static async FindOrCreate(name: string, accountId: ReturnType<typeof randomUUID>) {
    const categoryRecord = await db.query.categories.findFirst({
      where: (categories, { eq }) => eq(categories.name, name),
    });
    if (categoryRecord) {
      return new Category(
        categoryRecord.id as ReturnType<typeof randomUUID>,
        categoryRecord.name,
        categoryRecord.addedAt,
        categoryRecord.enabled,
        categoryRecord.accountId as ReturnType<typeof randomUUID>,
      );
    }

    const category = new Category(randomUUID(), name, new Date(), false, accountId);
    await db.insert(categories).values(category);
    return category;
  }
}
