import { FastifyReply, FastifyRequest, FastifySchema } from 'fastify';
import { Record } from '../models/record';

export type CreateRecordRequestBody = {
  title: string;
  description: string;
  comment: string;
  url: string;
  category: string;
  image?: string;
};
export const createRecordSchema: FastifySchema = {
  body: {
    type: 'object',
    required: ['title', 'description', 'comment', 'url', 'category'],
    properties: {
      title: { type: 'string' },
      description: { type: 'string' },
      comment: { type: 'string' },
      url: { type: 'string' },
      category: { type: 'string' },
      image: { type: 'string' },
    },
  },
};

export const createRecord = async (
  req: FastifyRequest<{
    Body: CreateRecordRequestBody;
  }>,
  reply: FastifyReply,
) => {
  const { title, description, comment, url, category, image } = req.body;
  try {
    const record = await Record.Create(title, description, comment, url, category, image);
    req.log.info(record);
    return reply.code(201).send({
      id: record.id,
    });
  } catch (error) {
    req.log.error(error);
    throw error;
  }
};

export type GetRecordByIdParams = {
  id: string;
};
export const getRecordByIdSchema: FastifySchema = {
  params: {
    type: 'object',
    required: ['id'],
    properties: {
      id: { type: 'string', format: 'uuid' },
    },
  },
};

export const getRecordById = async (
  req: FastifyRequest<{
    Params: GetRecordByIdParams;
  }>,
  reply: FastifyReply,
) => {
  const { id } = req.params;
  const record = await Record.FindById(id);
  if (!record) {
    return reply.code(404).send({
      message: 'Record not found',
    });
  }
  return reply.send(record);
};
