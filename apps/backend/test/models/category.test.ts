import { randomUUID } from 'crypto';
import { faker } from '@faker-js/faker';
import { Category } from '../../src/models/category';
import { cleanupTables, fetchCategoryByName } from '../utils';

describe('category', () => {
  beforeAll(async () => {
    await cleanupTables();
  });

  describe('FindOrCreate', () => {
    test('categoryが作られる', async () => {
      const categoryName = faker.word.words();
      const category = await Category.FindOrCreate(categoryName, randomUUID());
      expect(category).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        enabled: false,
        id: expect.any(String),
        name: categoryName,
      });

      await expect(fetchCategoryByName(categoryName)).resolves.toMatchObject(category);
    });

    test('すでに存在するcategoryが取得される', async () => {
      const categoryName = faker.word.words();
      const category = await Category.FindOrCreate(categoryName, randomUUID());
      const category2 = await Category.FindOrCreate(categoryName, randomUUID());
      expect(category).toMatchObject(category2);
    });
  });
});
