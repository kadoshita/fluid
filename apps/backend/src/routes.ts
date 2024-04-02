import { FastifyInstance } from 'fastify';
import { createRecord, createRecordSchema, getRecordById, getRecordByIdSchema } from './controllers/record';

export function registerRoutes(app: FastifyInstance) {
  app.get('/', async (request, reply) => {
    return { hello: 'world' };
  });
  app.post('/api/v1/records', { schema: createRecordSchema }, createRecord);
  app.get('/api/v1/records/:id', { schema: getRecordByIdSchema }, getRecordById);
}
