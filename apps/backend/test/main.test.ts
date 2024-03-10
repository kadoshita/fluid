import fastify from 'fastify';
import { registerRoutes } from '../src/routes';

const app = fastify();
registerRoutes(app);

describe('main', () => {
  test('should start the server', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/',
    });

    expect(res.statusCode).toEqual(200);
    expect(JSON.parse(res.body)).toStrictEqual({ hello: 'world' });
  });
});
