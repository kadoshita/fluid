import fastify from 'fastify';
import { registerRoutes } from '../../src/routes';
import { cleanupTables, createRecordFakeData } from '../utils';
import { Record } from '../../src/models/record';
import { randomUUID } from 'crypto';

const app = fastify({ logger: true });
registerRoutes(app);

describe('record', () => {
  let record: Record;
  let fakeData: ReturnType<typeof createRecordFakeData>;

  beforeAll(async () => {
    await cleanupTables();
  });

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
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/records/${record.id}`,
    });

    expect(res.statusCode).toEqual(200);
    const body = JSON.parse(res.body);
    const { title, description, domain, path, categoryName, image, comment } = fakeData;
    expect(body).toStrictEqual({
      accountId: expect.any(String),
      addedAt: expect.any(String),
      categoryId: expect.any(String),
      category: {
        name: categoryName,
      },
      description,
      comment,
      domain,
      id: record.id,
      image,
      title,
      url: `https://${domain}/${path}`,
    });
  });

  test('recordが存在しない場合に404エラーが返る', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/v1/records/${randomUUID()}`,
    });

    expect(res.statusCode).toEqual(404);
    const body = JSON.parse(res.body);
    expect(body).toStrictEqual({
      message: 'Record not found',
    });
  });

  test('idがuuid形式でない場合に400エラーが返る', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/records/invalid-uuid',
    });

    expect(res.statusCode).toEqual(400);
    const body = JSON.parse(res.body);
    expect(body).toStrictEqual({
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: 'params/id must match format "uuid"',
      statusCode: 400,
    });
  });
});
