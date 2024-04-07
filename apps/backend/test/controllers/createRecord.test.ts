import fastify from 'fastify';
import { registerRoutes } from '../../src/routes';
import { cleanupTables, createRecordFakeData, fetchRecordById } from '../utils';
import { Record } from '../../src/models/record';

const app = fastify({ logger: true });
registerRoutes(app);

describe('record', () => {
  beforeAll(async () => {
    await cleanupTables();
  });

  test('recordが作られる', async () => {
    const { title, description, comment, domain, path, categoryName, image } = createRecordFakeData();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/records',
      payload: {
        title,
        description,
        comment,
        url: `https://${domain}/${path}`,
        category: categoryName,
        image,
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
      description,
      comment,
      domain,
      id: body.id,
      image,
      title,
      url: `https://${domain}/${path}`,
    });
  });

  test('imageがない場合でもrecordが作られる', async () => {
    const { title, description, comment, domain, path, categoryName } = createRecordFakeData();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/records',
      payload: {
        title,
        description,
        comment,
        url: `https://${domain}/${path}`,
        category: categoryName,
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
      description,
      comment,
      domain,
      id: body.id,
      image: null,
      title,
      url: `https://${domain}/${path}`,
    });
  });

  test.each([
    [
      'title',
      () => {
        const { description, comment, domain, path, categoryName, image } = createRecordFakeData();
        return {
          description,
          comment,
          url: `https://${domain}/${path}`,
          category: categoryName,
          image,
        };
      },
    ],
    [
      'url',
      () => {
        const { title, description, comment, categoryName, image } = createRecordFakeData();
        return {
          title,
          description,
          comment,
          category: categoryName,
          image,
        };
      },
    ],
    [
      'category',
      () => {
        const { title, description, comment, domain, path, image } = createRecordFakeData();
        return {
          title,
          description,
          comment,
          url: `https://${domain}/${path}`,
          image,
        };
      },
    ],
    [
      'comment',
      () => {
        const { title, description, domain, path, categoryName, image } = createRecordFakeData();
        return {
          title,
          description,
          url: `https://${domain}/${path}`,
          category: categoryName,
          image,
        };
      },
    ],
    [
      'description',
      () => {
        const { title, comment, domain, path, categoryName, image } = createRecordFakeData();
        return {
          title,
          comment,
          url: `https://${domain}/${path}`,
          category: categoryName,
          image,
        };
      },
    ],
  ])(`%sがない場合に400エラーが返る`, async (key, payload) => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/records',
      payload: payload(),
    });

    expect(res.statusCode).toEqual(400);
    const body = JSON.parse(res.body);
    expect(body).toStrictEqual({
      code: 'FST_ERR_VALIDATION',
      error: 'Bad Request',
      message: `body must have required property '${key}'`,
      statusCode: 400,
    });
  });

  test('同じURLのrecordが既に存在する場合に409エラーが返る', async () => {
    const { title, description, comment, domain, path, categoryName, image } = createRecordFakeData();
    await Record.Create(title, description, comment, `https://${domain}/${path}`, categoryName, image);

    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/records',
      payload: {
        title,
        description,
        comment,
        url: `https://${domain}/${path}`,
        category: categoryName,
        image,
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
