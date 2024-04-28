import { FastifyInstance } from 'fastify';
import { createRecord, createRecordSchema, getRecordById, getRecordByIdSchema } from './controllers/record';
import { authenticate } from './controllers/common';
import type { User } from '@supabase/supabase-js';

declare module 'fastify' {
  interface FastifyRequest {
    user: User;
  }
}

export function registerRoutes(app: FastifyInstance) {
  app.decorateRequest('user', null);

  app.get(
    '/',
    {
      preHandler: authenticate,
    },
    async (request, reply) => {
      request.log.info(request.user);
      return { hello: 'world' };
    },
  );
  app.post('/api/v1/records', { schema: createRecordSchema }, createRecord);
  app.get('/api/v1/records/:id', { schema: getRecordByIdSchema }, getRecordById);
}
