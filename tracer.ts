// 'use strict'

// const {
//   BasicTracerProvider,
//   ConsoleSpanExporter,
//   SimpleSpanProcessor,
//   BatchSpanProcessor,
// } = require('@opentelemetry/tracing')
// const { CollectorTraceExporter } = require('@opentelemetry/exporter-collector')
// const { Resource } = require('@opentelemetry/resources')
// const { SemanticResourceAttributes } = require('@opentelemetry/semantic-conventions')
// const { ExpressInstrumentation } = require('@opentelemetry/instrumentation-express')
// const { HttpInstrumentation } = require('@opentelemetry/instrumentation-http')
// const { registerInstrumentations } = require('@opentelemetry/instrumentation')
// const opentelemetry = require('@opentelemetry/sdk-node')
// const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
// const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')
// const { NodeTracerProvider } = require('@opentelemetry/sdk-trace-node')
// const { OTTracePropagator } = require('@opentelemetry/propagator-ot-trace')

// const hostName = process.env.OTEL_TRACE_HOST || 'localhost'

// const options = {
//   tags: [],
//   endpoint: `http://${hostName}:14268/api/traces`,
// }

// export const init = (serviceName, environment) => {

//   // User Collector Or Jaeger Exporter
//   //const exporter = new CollectorTraceExporter(options)
  
//   const exporter = new JaegerExporter(options)

//   const provider = new NodeTracerProvider({
//     resource: new Resource({
//       [SemanticResourceAttributes.SERVICE_NAME]: serviceName, // Service name that showuld be listed in jaeger ui
//       [SemanticResourceAttributes.DEPLOYMENT_ENVIRONMENT]: environment,
//     }),
//   })

//   //provider.addSpanProcessor(new SimpleSpanProcessor(exporter))

//   // Use the BatchSpanProcessor to export spans in batches in order to more efficiently use resources.
//   provider.addSpanProcessor(new BatchSpanProcessor(exporter))

//   // Enable to see the spans printed in the console by the ConsoleSpanExporter
//   // provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter())) 

//   provider.register({ propagator: new OTTracePropagator() })

//   console.log('tracing initialized')

//   registerInstrumentations({
//     instrumentations: [new ExpressInstrumentation(), new HttpInstrumentation()],
//   })
  
//   const tracer = provider.getTracer(serviceName)
//   return { tracer }
// }

// module.exports = {
//   init: init,
// }

// import { Resource } from "@opentelemetry/resources";
// import { SemanticResourceAttributes } from "@opentelemetry/semantic-conventions";
// import { SimpleSpanProcessor, ConsoleSpanExporter } from "@opentelemetry/sdk-trace-base";
// import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
// import { trace, Tracer } from "@opentelemetry/api";
// import { JaegerExporter } from "@opentelemetry/exporter-jaeger";

// export default function initializeTracing(serviceName: string): Tracer {
//     const provider = new NodeTracerProvider({
//         resource: new Resource({
//             [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
//         }),
//     });

//     const consoleExporter = new ConsoleSpanExporter()
//     const jaegerExporter = new JaegerExporter({
//         endpoint: "http://localhost:14268/api/traces",
//     });

//     provider.addSpanProcessor(new SimpleSpanProcessor(consoleExporter));
//     provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));

//     provider.register();

//     return trace.getTracer(serviceName);
// };

// import { NodeSDK } from '@opentelemetry/sdk-node';
// import { ConsoleSpanExporter } from '@opentelemetry/sdk-trace-node';
// import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
// import { PeriodicExportingMetricReader, ConsoleMetricExporter } from '@opentelemetry/sdk-metrics';
// import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
// export const sdk = new NodeSDK({
//   metricReader: new PeriodicExportingMetricReader({
//     exporter: new ConsoleMetricExporter(),
//   }),
//   instrumentations: [getNodeAutoInstrumentations()],
// });

// sdk.start();


import { MeterProvider } from '@opentelemetry/sdk-metrics-base';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor, BatchSpanProcessor, ConsoleSpanExporter, } from '@opentelemetry/sdk-trace-base';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { PrometheusExporter } from '@opentelemetry/exporter-prometheus'
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ExpressInstrumentation, ExpressRequestHookInformation } from 'opentelemetry-instrumentation-express';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Span, Baggage } from '@opentelemetry/api';
import { AlwaysOnSampler, AlwaysOffSampler, ParentBasedSampler, TraceIdRatioBasedSampler } from '@opentelemetry/core';
import { IORedisInstrumentation } from '@opentelemetry/instrumentation-ioredis'
import { serviceSyncDetector } from 'opentelemetry-resource-detector-service';
import { CollectorTraceExporter, CollectorMetricExporter, } from '@opentelemetry/exporter-collector';
// import WsInstrumentation from './ws-instrumentation/ws';


export const init = function (serviceName: string, metricPort: number) {

    // Define metrics
    // const metricExporter = new PrometheusExporter({ port: metricPort }, () => {
    //     console.log(`scrape: http://localhost:${metricPort}${PrometheusExporter.DEFAULT_OPTIONS.endpoint}`);
    // });
    const metricExporter = new CollectorMetricExporter({
        url: 'http://localhost:4318/v1/metrics'
    })
    const meter = new MeterProvider({ exporter: metricExporter, interval: 100000 }).getMeter(serviceName);

    // Define traces
    const traceExporter = new JaegerExporter({ endpoint: 'http://localhost:14268/api/traces'});
    const provider = new NodeTracerProvider({
        resource: new Resource({
            [SemanticResourceAttributes.SERVICE_NAME]: serviceName
        }),
        sampler:new ParentBasedSampler({
            root: new TraceIdRatioBasedSampler(1)
        })
    });
    // const traceExporter = new CollectorTraceExporter({
    //     url: 'http://localhost:4318/v1/trace'
    // })
    provider.addSpanProcessor(new SimpleSpanProcessor(traceExporter));
    provider.register();
    registerInstrumentations({
        instrumentations: [
            new ExpressInstrumentation({
                requestHook: (span, reqInfo) => {
                    span.setAttribute('request-headers',JSON.stringify(reqInfo.req.headers))
                }
            }),
            new HttpInstrumentation(),
            new IORedisInstrumentation(),
            //  new WsInstrumentation()
        ]
    });
    const tracer = provider.getTracer(serviceName);
    return { meter, tracer };
}

// export default init;