import { FastifyRequest, FastifyReply } from 'fastify';
import { authClient } from '../supabase';

export async function authenticate(req: FastifyRequest, reply: FastifyReply) {
  const { authorization } = req.headers;
  if (authorization === undefined) {
    return reply.code(401).send({ message: 'Unauthorized' });
  }
  const [bearer, token] = authorization.split(' ');
  if (bearer !== 'Bearer' || !token) {
    return reply.code(401).send({ message: 'Unauthorized' });
  }

  try {
    const user = await authClient.getUser(token).then((user) => user.data.user);
    if (!user || !user?.confirmed_at) {
      return reply.code(401).send({ message: 'Unauthorized' });
    }
    req.user = user;
  } catch (error) {
    return reply.code(401).send({ message: 'Unauthorized' });
  }
}
