import fastify from 'fastify';
import { registerRoutes } from './routes';
import { PinoLoggerOptions } from 'fastify/types/logger';

const CLOUD_LOGGING_TRACE_LOG_PREFIX = process.env.CLOUD_LOGGING_TRACE_LOG_PREFIX ?? '/';

const commonLoggingOptions: PinoLoggerOptions = {
  formatters: {
    log(object) {
      if ('trace_id' in object && typeof object.trace_id === 'string') {
        object['logging.googleapis.com/trace'] = `${CLOUD_LOGGING_TRACE_LOG_PREFIX}${object.trace_id}`;
      }
      if ('span_id' in object && typeof object.span_id === 'string') {
        object['logging.googleapis.com/spanId'] = object.span_id;
      }
      return object;
    },
  },
};

const app = fastify({
  logger:
    process.env.NODE_ENV === 'development'
      ? {
          ...commonLoggingOptions,
          file: '../../observability/log/stdout.log',
        }
      : commonLoggingOptions,
  trustProxy: '127.0.0.1',
});

registerRoutes(app);

app.listen({ port: 3000, host: '0.0.0.0' }, (err, address) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
  app.log.info(`Server start`);
});
