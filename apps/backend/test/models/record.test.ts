import { faker } from '@faker-js/faker';
import { Record, RecordAlreadyExistsError } from '../../src/models/record';
import { cleanupTables, createRecordFakeData, fetchCategoryByName, fetchRecordById } from '../utils';

describe('record', () => {
  beforeAll(async () => {
    await cleanupTables();
  });

  describe('Create', () => {
    test('recordが作られる', async () => {
      const { title, description, comment, domain, path, categoryName, image } = createRecordFakeData();
      const record = await Record.Create(title, description, comment, `https://${domain}/${path}`, categoryName, image);
      expect(record).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        categoryId: expect.any(String),
        description,
        domain,
        id: expect.any(String),
        image,
        title,
        url: `https://${domain}/${path}`,
        comment,
      });

      await expect(fetchRecordById(record.id)).resolves.toMatchObject(record);
    });

    test('imageがないrecordが作られる', async () => {
      const { title, description, comment, domain, path, categoryName } = createRecordFakeData();
      const record = await Record.Create(title, description, comment, `https://${domain}/${path}`, categoryName);
      expect(record).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        categoryId: expect.any(String),
        description,
        domain,
        id: expect.any(String),
        title,
        url: `https://${domain}/${path}`,
        comment,
      });

      await expect(fetchRecordById(record.id)).resolves.toMatchObject({ ...record, image: null });
    });

    // TODO: categoryを作る際にrecordのaccountIdが入るようにする
    test.todo('対応するcategoryが無い場合に、enabled: falseでcategoryも作られる', async () => {
      const { title, description, comment, domain, path, categoryName, image } = createRecordFakeData();
      const record = await Record.Create(title, description, comment, `https://${domain}/${path}`, categoryName, image);
      expect(record).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        categoryId: expect.any(String),
        description,
        domain,
        id: expect.any(String),
        title,
        url: `https://${domain}/${path}`,
        image,
        comment,
      });

      await expect(fetchRecordById(record.id)).resolves.toMatchObject(record);
      await expect(fetchCategoryByName(categoryName)).resolves.toStrictEqual({
        id: expect.any(String),
        name: categoryName,
        addedAt: expect.any(Date),
        enabled: false,
        accountId: record.accountId,
      });
    });

    test('同じcategoryのrecordを複数作ることができる', async () => {
      const {
        title: title1,
        description: description1,
        comment: comment1,
        domain: domain1,
        path: path1,
        categoryName,
        image: image1,
      } = createRecordFakeData();
      const {
        title: title2,
        description: description2,
        comment: comment2,
        domain: domain2,
        path: path2,
        image: image2,
      } = createRecordFakeData();
      const record1 = await Record.Create(
        title1,
        description1,
        comment1,
        `https://${domain1}/${path1}`,
        categoryName,
        image1,
      );
      const record2 = await Record.Create(
        title2,
        description2,
        comment2,
        `https://${domain2}/${path2}`,
        categoryName,
        image2,
      );
      expect(record1).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        categoryId: expect.any(String),
        description: description1,
        domain: domain1,
        id: expect.any(String),
        title: title1,
        url: `https://${domain1}/${path1}`,
        image: image1,
        comment: comment1,
      });
      expect(record2).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        categoryId: expect.any(String),
        description: description2,
        domain: domain2,
        id: expect.any(String),
        title: title2,
        url: `https://${domain2}/${path2}`,
        image: image2,
        comment: comment2,
      });

      await expect(fetchRecordById(record1.id)).resolves.toMatchObject(record1);
      await expect(fetchRecordById(record2.id)).resolves.toMatchObject(record2);
      await expect(fetchCategoryByName(categoryName)).resolves.toMatchObject({ name: categoryName });
    });

    test('URLのドメイン部を保存できる', async () => {
      const { title, description, comment, path, categoryName } = createRecordFakeData();
      const record = await Record.Create(
        title,
        description,
        comment,
        `https://ドメイン名例.jp/${path}`,
        categoryName,
        'https://ドメイン名例.jp/image.jpg',
      );
      expect(record).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        categoryId: expect.any(String),
        description,
        domain: 'xn--eckwd4c7cu47r2wf.jp',
        id: expect.any(String),
        title,
        url: `https://ドメイン名例.jp/${path}`,
        image: 'https://ドメイン名例.jp/image.jpg',
        comment,
      });

      await expect(fetchRecordById(record.id)).resolves.toMatchObject(record);
    });

    test('同じURLのrecordを作ることはできない', async () => {
      const {
        title: title1,
        description: description1,
        comment: comment1,
        domain,
        path,
        categoryName: categoryName1,
      } = createRecordFakeData();
      const {
        title: title2,
        description: description2,
        comment: comment2,
        categoryName: categoryName2,
      } = createRecordFakeData();
      await expect(
        Record.Create(title1, description1, comment1, `https://${domain}/${path}`, categoryName1),
      ).resolves.toBeDefined();
      await expect(
        Record.Create(title2, description2, comment2, `https://${domain}/${path}`, categoryName2),
      ).rejects.toThrow(RecordAlreadyExistsError);
    });
  });

  describe('FindById', () => {
    let record: Record;
    let fakeData: ReturnType<typeof createRecordFakeData>;

    beforeEach(async () => {
      fakeData = createRecordFakeData();
      record = await Record.Create(
        fakeData.title,
        fakeData.description,
        fakeData.comment,
        `https://${fakeData.domain}/${fakeData.path}`,
        fakeData.categoryName,
        fakeData.image,
      );
    });

    afterEach(async () => {
      await record.delete();
    });

    test('recordが取得できる', async () => {
      const { title, description, domain, path, categoryName, image } = fakeData;
      const foundRecord = await Record.FindById(record.id);
      expect(foundRecord).toMatchObject({
        accountId: expect.any(String),
        addedAt: expect.any(Date),
        categoryId: expect.any(String),
        category: { name: categoryName },
        description,
        domain,
        id: record.id,
        image,
        title,
        url: `https://${domain}/${path}`,
      });
    });
  });

  describe('delete', () => {
    let record: Record;
    let fakeData: ReturnType<typeof createRecordFakeData>;

    beforeEach(async () => {
      fakeData = createRecordFakeData();
      record = await Record.Create(
        fakeData.title,
        fakeData.description,
        fakeData.comment,
        `https://${fakeData.domain}/${fakeData.path}`,
        fakeData.categoryName,
        fakeData.image,
      );
    });

    afterEach(async () => {
      await record.delete();
    });

    test('recordのみが削除され、categoryは削除されない', async () => {
      await expect(record.delete()).resolves.toBeUndefined();
      await expect(fetchRecordById(record.id)).resolves.toBeUndefined();
      await expect(fetchCategoryByName(fakeData.categoryName)).resolves.toMatchObject({ name: fakeData.categoryName });
    });

    test('deleteを2回実行してもエラーにならない', async () => {
      await expect(record.delete()).resolves.toBeUndefined();
      await expect(record.delete()).resolves.toBeUndefined();
      await expect(fetchRecordById(record.id)).resolves.toBeUndefined();
    });
  });
});
