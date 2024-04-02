import fastify from 'fastify';
import { registerRoutes } from '../../src/routes';
import { cleanupTables, fetchRecordById } from '../utils';
import { Record } from '../../src/models/record';
import { randomUUID } from 'crypto';

const app = fastify({ logger: true });
registerRoutes(app);

describe('record', () => {
  beforeAll(async () => {
    await cleanupTables();
  });

  describe('create records', () => {
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
      expect(body).toEqual({
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
      expect(body).toEqual({
        error: 'Conflict',
        message: 'Conflict',
        statusCode: 409,
      });
    });
  });

  describe('get records', () => {
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
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/records/${record.id}`,
      });

      expect(res.statusCode).toEqual(200);
      const body = JSON.parse(res.body);
      expect(body).toStrictEqual({
        accountId: expect.any(String),
        addedAt: expect.any(String),
        categoryId: expect.any(String),
        category: {
          name: 'test2',
        },
        description: 'test2',
        domain: 'example.com',
        id: record.id,
        image: 'https://example.com/image.jpg',
        title: 'test2',
        url: 'https://example.com/11',
      });
    });

    test('recordが存在しない場合に404エラーが返る', async () => {
      const res = await app.inject({
        method: 'GET',
        url: `/api/v1/records/${randomUUID()}`,
      });

      expect(res.statusCode).toEqual(404);
      const body = JSON.parse(res.body);
      expect(body).toEqual({
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
      expect(body).toEqual({
        code: 'FST_ERR_VALIDATION',
        error: 'Bad Request',
        message: 'params/id must match format "uuid"',
        statusCode: 400,
      });
    });
  });
});
