/*instrumentation.ts*/
import { NodeSDK } from '@opentelemetry/sdk-node';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ConsoleMetricExporter, PeriodicExportingMetricReader } from '@opentelemetry/sdk-metrics';
import { TraceExporter } from '@google-cloud/opentelemetry-cloud-trace-exporter';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-proto';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';

if (process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT && process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT) {
  const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
      url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? '',
      headers: {},
    }),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: process.env.OTEL_EXPORTER_OTLP_METRICS_ENDPOINT ?? '',
        headers: {},
      }),
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
      }),
    ],
  });
  sdk.start();
} else {
  const provider = new NodeTracerProvider();
  const exporter = new TraceExporter();
  provider.addSpanProcessor(new BatchSpanProcessor(exporter));

  const sdk = new NodeSDK({
    traceExporter: new TraceExporter(),
    metricReader: new PeriodicExportingMetricReader({
      exporter: new ConsoleMetricExporter(),
    }),
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
      }),
    ],
  });

  sdk.start();
}
