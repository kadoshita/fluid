import { FastifyInstance } from 'fastify';

export function registerRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    return { hello: 'world' };
  });
}
