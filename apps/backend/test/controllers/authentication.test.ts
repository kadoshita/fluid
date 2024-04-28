import { vi, MockInstance } from 'vitest';

import fastify from 'fastify';
import { registerRoutes } from '../../src/routes';
import { authClient } from '../../src/supabase';
import { fa, faker } from '@faker-js/faker';

const app = fastify({ logger: true });
registerRoutes(app);

describe('authentication', () => {
  let authClientGetUserMock: MockInstance;

  beforeEach(() => {
    authClientGetUserMock = vi.spyOn(authClient, 'getUser');
  });

  afterEach(() => {
    authClientGetUserMock.mockRestore();
  });

  test('正しい認証情報が付与されている場合に200が返される', async () => {
    const fakeToken = faker.string.sample(10);
    authClientGetUserMock.mockImplementation(async (token) => {
      if (token === fakeToken) {
        return {
          data: { user: { id: '1', email: faker.internet.email(), confirmed_at: new Date().toISOString() } },
        };
      }
    });

    const res = await app.inject({
      method: 'GET',
      url: '/',
      headers: {
        Authorization: `Bearer ${fakeToken}`,
      },
    });

    expect(res.statusCode).toEqual(200);
    expect(JSON.parse(res.body)).toStrictEqual({ hello: 'world' });
  });

  test('authorizationヘッダがない場合に401が返される', async () => {
    const fakeToken = faker.string.sample(10);
    authClientGetUserMock.mockImplementation(async (token) => {
      if (token === fakeToken) {
        return {
          data: { user: { id: '1', email: faker.internet.email(), confirmed_at: new Date().toISOString() } },
        };
      }
    });

    const res = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(res.statusCode).toEqual(401);
    expect(JSON.parse(res.body)).toStrictEqual({ message: 'Unauthorized' });
  });

  test('Bearerトークンがない場合に401が返される', async () => {
    const fakeToken = faker.string.sample(10);
    authClientGetUserMock.mockImplementation(async (token) => {
      if (token === fakeToken) {
        return {
          data: { user: { id: '1', email: faker.internet.email(), confirmed_at: new Date().toISOString() } },
        };
      }
    });

    const res = await app.inject({
      method: 'GET',
      url: '/',
      headers: {
        authorization: fakeToken,
      },
    });

    expect(res.statusCode).toEqual(401);
    expect(JSON.parse(res.body)).toStrictEqual({ message: 'Unauthorized' });
  });

  test('Bearerトークンが不正な場合に401が返される', async () => {
    const fakeToken = faker.string.sample(10);
    authClientGetUserMock.mockImplementation(async (token) => {
      if (token === fakeToken) {
        return {
          data: { user: { id: '1', email: faker.internet.email(), confirmed_at: new Date().toISOString() } },
        };
      }
    });

    const res = await app.inject({
      method: 'GET',
      url: '/',
      headers: {
        authorization: `Bearer ${faker.string.sample(10)}`,
      },
    });

    expect(res.statusCode).toEqual(401);
    expect(JSON.parse(res.body)).toStrictEqual({ message: 'Unauthorized' });
  });

  test('ユーザーが存在しない場合に401が返される', async () => {
    const fakeToken = faker.string.sample(10);
    authClientGetUserMock.mockImplementation(async () => {
      return;
    });

    const res = await app.inject({
      method: 'GET',
      url: '/',
      headers: {
        Authorization: `Bearer ${fakeToken}`,
      },
    });

    expect(res.statusCode).toEqual(401);
    expect(JSON.parse(res.body)).toStrictEqual({ message: 'Unauthorized' });
  });

  test('ユーザーが未確認の場合に401が返される', async () => {
    const fakeToken = faker.string.sample(10);
    authClientGetUserMock.mockImplementation(async (token) => {
      if (token === fakeToken) {
        return {
          data: { user: { id: '1', email: faker.internet.email() } },
        };
      }
    });

    const res = await app.inject({
      method: 'GET',
      url: '/',
      headers: {
        Authorization: `Bearer ${fakeToken}`,
      },
    });

    expect(res.statusCode).toEqual(401);
    expect(JSON.parse(res.body)).toStrictEqual({ message: 'Unauthorized' });
  });
});
