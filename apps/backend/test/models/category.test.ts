import { randomUUID } from 'crypto';
import { Category } from '../../src/models/category';
import { cleanupTables, fetchCategoryByName } from '../utils';

describe('category', () => {
  beforeAll(async () => {
    await cleanupTables();
  });

  describe('FindOrCreate', () => {
    test('categoryが作られる', async () => {
      const category = await Category.FindOrCreate('test1', randomUUID());
      expect(category).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        enabled: false,
        id: expect.any(String),
        name: 'test1',
      });

      await expect(fetchCategoryByName('test1')).resolves.toMatchObject(category);
    });

    test('すでに存在するcategoryが取得される', async () => {
      const category = await Category.FindOrCreate('test2', randomUUID());
      const category2 = await Category.FindOrCreate('test2', randomUUID());
      expect(category).toMatchObject(category2);
    });
  });
});
