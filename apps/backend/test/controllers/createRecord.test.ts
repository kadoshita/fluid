import fastify from 'fastify';
import { registerRoutes } from '../../src/routes';
import { cleanupTables, fetchRecordById } from '../utils';

const app = fastify({ logger: true });
registerRoutes(app);

describe('record', () => {
  beforeAll(async () => {
    await cleanupTables();
  });

  test('recordが作られる', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/records',
      payload: {
        title: 'test1',
        description: 'test1',
        comment: 'test1',
        url: 'https://example.com/1',
        category: 'test1',
        image: 'https://example.com/image.jpg',
      },
    });

    expect(res.statusCode).toEqual(201);
    const body = JSON.parse(res.body);
    expect(body).toEqual({ id: expect.any(String) });
    const record = await fetchRecordById(body.id);
    expect(record).toStrictEqual({
      accountId: expect.any(String),
      addedAt: expect.any(Date),
      categoryId: expect.any(String),
      description: 'test1',
      comment: 'test1',
      domain: 'example.com',
      id: body.id,
      image: 'https://example.com/image.jpg',
      title: 'test1',
      url: 'https://example.com/1',
    });
  });

  test('imageがない場合でもrecordが作られる', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/records',
      payload: {
        title: 'test no image',
        description: 'test1',
        comment: 'test1',
        url: 'https://example.com/2',
        category: 'test1',
      },
    });

    expect(res.statusCode).toEqual(201);
    const body = JSON.parse(res.body);
    expect(body).toEqual({ id: expect.any(String) });
    const record = await fetchRecordById(body.id);
    expect(record).toStrictEqual({
      accountId: expect.any(String),
      addedAt: expect.any(Date),
      categoryId: expect.any(String),
      description: 'test1',
      comment: 'test1',
      domain: 'example.com',
      id: body.id,
      image: null,
      title: 'test no image',
      url: 'https://example.com/2',
    });
  });

  test('パラメーターが不足している場合に400エラーが返る', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/records',
      payload: {
        description: 'test1',
        comment: 'test1',
        url: 'https://example.com',
        category: 'test1',
        image: 'https://example.com/image.jpg',
      },
    });

    expect(res.statusCode).toEqual(400);
    const body = JSON.parse(res.body);
    expect(body).toStrictEqual({
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: "body must have required property 'title'",
      statusCode: 400,
    });
  });

  test('同じURLのrecordが既に存在する場合に409エラーが返る', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/records',
      payload: {
        title: 'test1',
        description: 'test1',
        comment: 'test1',
        url: 'https://example.com/1',
        category: 'test1',
        image: 'https://example.com/image.jpg',
      },
    });

    expect(res.statusCode).toEqual(409);
    const body = JSON.parse(res.body);
    expect(body).toStrictEqual({
      error: 'Conflict',
      message: 'Conflict',
      statusCode: 409,
    });
  });
});
