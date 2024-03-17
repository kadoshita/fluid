import fastify from 'fastify';
import { registerRoutes } from './routes';

const app = fastify({
  logger: true,
});

registerRoutes(app);

app.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server start`);
});
