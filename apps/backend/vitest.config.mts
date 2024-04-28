import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    dir: 'test',
    globals: true,
    watch: false,
    env: {
      NODE_ENV: 'development',

      DB_HOST: 'localhost',
      DB_PORT: '5432',
      DB_USER: 'postgres',
      DB_PASSWORD: 'postgres',
      DB_NAME: 'postgres',

      SUPABASE_URL: 'https://example.com',
      SUPABASE_API_KEY: 'supabase-key',

      OTEL_SERVICE_NAME: 'fluid-backend',
      OTEL_TRACES_EXPORTER: 'otlp',
      OTEL_NODE_RESOURCE_DETECTORS: '"env,host"',
      Environment: 'OTEL_EXPORTER_OTLP_PROTOCOL=grpc',
      OTEL_EXPORTER_OTLP_TRACES_ENDPOINT: 'http://localhost:4317',
      OTEL_EXPORTER_OTLP_METRICS_ENDPOINT: 'http://localhost:4317',
      CLOUD_LOGGING_TRACE_LOG_PREFIX: 'projects/fluid-deploy/traces/',
    },
  },
});
