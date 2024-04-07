import { Record } from '../../src/models/record';
import { cleanupTables, fetchCategoryByName, fetchRecordById } from '../utils';

describe('record', () => {
  beforeAll(async () => {
    await cleanupTables();
  });

  describe('Create', () => {
    test('recordが作られる', async () => {
      const record = await Record.Create(
        'test1',
        'test1',
        'test1',
        'https://example.com/1',
        'test1',
        'https://example.com/image.jpg',
      );
      expect(record).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        categoryId: expect.any(String),
        description: 'test1',
        domain: 'example.com',
        id: expect.any(String),
        image: 'https://example.com/image.jpg',
        title: 'test1',
        url: 'https://example.com/1',
        comment: 'test1',
      });

      await expect(fetchRecordById(record.id)).resolves.toMatchObject(record);
    });

    test('imageがないrecordが作られる', async () => {
      const record = await Record.Create('test2', 'test2', 'test2', 'https://example.com/2', 'test2');
      expect(record).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        categoryId: expect.any(String),
        description: 'test2',
        domain: 'example.com',
        id: expect.any(String),
        title: 'test2',
        url: 'https://example.com/2',
        comment: 'test2',
      });

      await expect(fetchRecordById(record.id)).resolves.toMatchObject({ ...record, image: null });
    });

    // TODO: categoryを作る際にrecordのaccountIdが入るようにする
    test.todo('対応するcategoryが無い場合に、enabled: falseでcategoryも作られる', async () => {
      const record = await Record.Create('test3', 'test3', 'test3', 'https://example.com/3', 'test3');
      expect(record).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        categoryId: expect.any(String),
        description: 'test3',
        domain: 'example.com',
        id: expect.any(String),
        title: 'test3',
        url: 'https://example.com/3',
        comment: 'test3',
      });

      await expect(fetchRecordById(record.id)).resolves.toMatchObject({ ...record, image: null });
      await expect(fetchCategoryByName('test3')).resolves.toStrictEqual({
        id: expect.any(String),
        name: 'test3',
        addedAt: expect.any(Date),
        enabled: false,
        accountId: record.accountId,
      });
    });

    test('同じcategoryのrecordを複数作ることができる', async () => {
      const record1 = await Record.Create(
        'test4',
        'test4',
        'test4',
        'https://example.com/4',
        'test4',
        'https://example.com/image.jpg',
      );
      const record2 = await Record.Create(
        'test4',
        'test4',
        'test4',
        'https://example.com/5',
        'test4',
        'https://example.com/image.jpg',
      );
      expect(record1).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        categoryId: expect.any(String),
        description: 'test4',
        domain: 'example.com',
        id: expect.any(String),
        title: 'test4',
        url: 'https://example.com/4',
        image: 'https://example.com/image.jpg',
        comment: 'test4',
      });
      expect(record2).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        categoryId: expect.any(String),
        description: 'test4',
        domain: 'example.com',
        id: expect.any(String),
        title: 'test4',
        url: 'https://example.com/5',
        image: 'https://example.com/image.jpg',
        comment: 'test4',
      });

      await expect(fetchRecordById(record1.id)).resolves.toMatchObject(record1);
      await expect(fetchRecordById(record2.id)).resolves.toMatchObject(record2);
      await expect(fetchCategoryByName('test4')).resolves.toMatchObject({ name: 'test4' });
    });

    test('URLのドメイン部を保存できる', async () => {
      const record = await Record.Create(
        'test5',
        'test5',
        'test5',
        'https://ドメイン名例.jp/6',
        'test5',
        'https://ドメイン名例.jp/image.jpg',
      );
      expect(record).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        categoryId: expect.any(String),
        description: 'test5',
        domain: 'xn--eckwd4c7cu47r2wf.jp',
        id: expect.any(String),
        title: 'test5',
        url: 'https://ドメイン名例.jp/6',
        image: 'https://ドメイン名例.jp/image.jpg',
        comment: 'test5',
      });

      await expect(fetchRecordById(record.id)).resolves.toMatchObject(record);
    });

    test('同じURLのrecordを作ることはできない', async () => {
      await expect(Record.Create('test5', 'test5', 'test5', 'https://example.com/6', 'test5')).resolves.toBeDefined();
      await expect(Record.Create('test6', 'test6', 'test6', 'https://example.com/6', 'test6')).rejects.toThrow();
    });
  });

  describe('FindById', () => {
    let record: Record;

    beforeEach(async () => {
      record = await Record.Create(
        'test2',
        'test2',
        'test2',
        'https://example.com/11',
        'test2',
        'https://example.com/image.jpg',
      );
    });

    afterEach(async () => {
      await record.delete();
    });

    test('recordが取得できる', async () => {
      const foundRecord = await Record.FindById(record.id);
      expect(foundRecord).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        categoryId: expect.any(String),
        category: { name: 'test2' },
        description: 'test2',
        domain: 'example.com',
        id: record.id,
        image: 'https://example.com/image.jpg',
        title: 'test2',
        url: 'https://example.com/11',
      });
    });
  });

  describe('delete', () => {
    let record: Record;

    beforeEach(async () => {
      record = await Record.Create(
        'test2',
        'test2',
        'test2',
        'https://example.com/11',
        'test2-1',
        'https://example.com/image.jpg',
      );
    });

    afterEach(async () => {
      await record.delete();
    });

    test('recordのみが削除され、categoryは削除されない', async () => {
      await record.delete();
      await expect(fetchRecordById(record.id)).resolves.toBeUndefined();
      await expect(fetchCategoryByName('test2-1')).resolves.toMatchObject({ name: 'test2-1' });
    });
  });
});
