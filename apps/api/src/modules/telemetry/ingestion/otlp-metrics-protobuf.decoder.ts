import protobuf from "protobufjs";

const root = protobuf.Root.fromJSON({
    nested: {
        opentelemetry: {
            nested: {
                proto: {
                    nested: {
                        metrics: {
                            nested: {
                                ExportMetricsServiceRequest: {
                                    fields: {
                                        resourceMetrics: {
                                            rule: "repeated",
                                            type: "ResourceMetrics",
                                            id: 1,
                                        },
                                    },
                                },

                                ResourceMetrics: {
                                    fields: {
                                        resource: {
                                            type: "Resource",
                                            id: 1,
                                        },
                                        scopeMetrics: {
                                            rule: "repeated",
                                            type: "ScopeMetrics",
                                            id: 2,
                                        },
                                        schemaUrl: {
                                            type: "string",
                                            id: 3,
                                        },
                                    },
                                },

                                ScopeMetrics: {
                                    fields: {
                                        scope: {
                                            type: "InstrumentationScope",
                                            id: 1,
                                        },
                                        metrics: {
                                            rule: "repeated",
                                            type: "Metric",
                                            id: 2,
                                        },
                                        schemaUrl: {
                                            type: "string",
                                            id: 3,
                                        },
                                    },
                                },

                                InstrumentationScope: {
                                    fields: {
                                        name: {
                                            type: "string",
                                            id: 1,
                                        },
                                        version: {
                                            type: "string",
                                            id: 2,
                                        },
                                        attributes: {
                                            rule: "repeated",
                                            type: "KeyValue",
                                            id: 3,
                                        },
                                        droppedAttributesCount: {
                                            type: "uint32",
                                            id: 4,
                                        },
                                    },
                                },

                                Metric: {
                                    oneofs: {
                                        data: {
                                            oneof: [
                                                "gauge",
                                                "sum",
                                                "histogram",
                                                "exponentialHistogram",
                                                "summary",
                                            ],
                                        },
                                    },
                                    fields: {
                                        name: {
                                            type: "string",
                                            id: 1,
                                        },
                                        description: {
                                            type: "string",
                                            id: 2,
                                        },
                                        unit: {
                                            type: "string",
                                            id: 3,
                                        },
                                        gauge: {
                                            type: "Gauge",
                                            id: 5,
                                        },
                                        sum: {
                                            type: "Sum",
                                            id: 7,
                                        },
                                        histogram: {
                                            type: "Histogram",
                                            id: 9,
                                        },
                                        exponentialHistogram: {
                                            type: "ExponentialHistogram",
                                            id: 10,
                                        },
                                        summary: {
                                            type: "Summary",
                                            id: 11,
                                        },
                                    },
                                },

                                Gauge: {
                                    fields: {
                                        dataPoints: {
                                            rule: "repeated",
                                            type: "NumberDataPoint",
                                            id: 1,
                                        },
                                    },
                                },

                                Sum: {
                                    fields: {
                                        dataPoints: {
                                            rule: "repeated",
                                            type: "NumberDataPoint",
                                            id: 1,
                                        },
                                        aggregationTemporality: {
                                            type: "AggregationTemporality",
                                            id: 2,
                                        },
                                        isMonotonic: {
                                            type: "bool",
                                            id: 3,
                                        },
                                    },
                                },

                                Histogram: {
                                    fields: {
                                        dataPoints: {
                                            rule: "repeated",
                                            type: "HistogramDataPoint",
                                            id: 1,
                                        },
                                        aggregationTemporality: {
                                            type: "AggregationTemporality",
                                            id: 2,
                                        },
                                    },
                                },

                                ExponentialHistogram: {
                                    fields: {
                                        dataPoints: {
                                            rule: "repeated",
                                            type: "ExponentialHistogramDataPoint",
                                            id: 1,
                                        },
                                        aggregationTemporality: {
                                            type: "AggregationTemporality",
                                            id: 2,
                                        },
                                    },
                                },

                                Summary: {
                                    fields: {
                                        dataPoints: {
                                            rule: "repeated",
                                            type: "SummaryDataPoint",
                                            id: 1,
                                        },
                                    },
                                },

                                NumberDataPoint: {
                                    fields: {
                                        attributes: {
                                            rule: "repeated",
                                            type: "KeyValue",
                                            id: 7,
                                        },
                                        startTimeUnixNano: {
                                            type: "fixed64",
                                            id: 2,
                                        },
                                        timeUnixNano: {
                                            type: "fixed64",
                                            id: 3,
                                        },
                                        asDouble: {
                                            type: "double",
                                            id: 4,
                                        },
                                        asInt: {
                                            type: "sfixed64",
                                            id: 6,
                                        },
                                        exemplars: {
                                            rule: "repeated",
                                            type: "Exemplar",
                                            id: 5,
                                        },
                                        flags: {
                                            type: "uint32",
                                            id: 8,
                                        },
                                    },
                                },

                                HistogramDataPoint: {
                                    fields: {
                                        attributes: {
                                            rule: "repeated",
                                            type: "KeyValue",
                                            id: 9,
                                        },
                                        startTimeUnixNano: {
                                            type: "fixed64",
                                            id: 2,
                                        },
                                        timeUnixNano: {
                                            type: "fixed64",
                                            id: 3,
                                        },
                                        count: {
                                            type: "fixed64",
                                            id: 4,
                                        },
                                        sum: {
                                            type: "double",
                                            id: 5,
                                        },
                                        bucketCounts: {
                                            rule: "repeated",
                                            type: "fixed64",
                                            id: 6,
                                        },
                                        explicitBounds: {
                                            rule: "repeated",
                                            type: "double",
                                            id: 7,
                                        },
                                        exemplars: {
                                            rule: "repeated",
                                            type: "Exemplar",
                                            id: 8,
                                        },
                                        flags: {
                                            type: "uint32",
                                            id: 10,
                                        },
                                        min: {
                                            type: "double",
                                            id: 11,
                                        },
                                        max: {
                                            type: "double",
                                            id: 12,
                                        },
                                    },
                                },

                                ExponentialHistogramDataPoint: {
                                    fields: {
                                        attributes: {
                                            rule: "repeated",
                                            type: "KeyValue",
                                            id: 1,
                                        },
                                        startTimeUnixNano: {
                                            type: "fixed64",
                                            id: 2,
                                        },
                                        timeUnixNano: {
                                            type: "fixed64",
                                            id: 3,
                                        },
                                        count: {
                                            type: "fixed64",
                                            id: 4,
                                        },
                                        sum: {
                                            type: "double",
                                            id: 5,
                                        },
                                        scale: {
                                            type: "sint32",
                                            id: 6,
                                        },
                                        zeroCount: {
                                            type: "fixed64",
                                            id: 7,
                                        },
                                        positive: {
                                            type: "Buckets",
                                            id: 8,
                                        },
                                        negative: {
                                            type: "Buckets",
                                            id: 9,
                                        },
                                        flags: {
                                            type: "uint32",
                                            id: 10,
                                        },
                                        zeroThreshold: {
                                            type: "double",
                                            id: 11,
                                        },
                                        exemplars: {
                                            rule: "repeated",
                                            type: "Exemplar",
                                            id: 12,
                                        },
                                        min: {
                                            type: "double",
                                            id: 13,
                                        },
                                        max: {
                                            type: "double",
                                            id: 14,
                                        },
                                    },
                                },

                                Buckets: {
                                    fields: {
                                        offset: {
                                            type: "sint32",
                                            id: 1,
                                        },
                                        bucketCounts: {
                                            rule: "repeated",
                                            type: "fixed64",
                                            id: 2,
                                        },
                                    },
                                },

                                SummaryDataPoint: {
                                    fields: {
                                        attributes: {
                                            rule: "repeated",
                                            type: "KeyValue",
                                            id: 7,
                                        },
                                        startTimeUnixNano: {
                                            type: "fixed64",
                                            id: 2,
                                        },
                                        timeUnixNano: {
                                            type: "fixed64",
                                            id: 3,
                                        },
                                        count: {
                                            type: "fixed64",
                                            id: 4,
                                        },
                                        sum: {
                                            type: "double",
                                            id: 5,
                                        },
                                        quantileValues: {
                                            rule: "repeated",
                                            type: "ValueAtQuantile",
                                            id: 6,
                                        },
                                        flags: {
                                            type: "uint32",
                                            id: 8,
                                        },
                                    },
                                },

                                ValueAtQuantile: {
                                    fields: {
                                        quantile: {
                                            type: "double",
                                            id: 1,
                                        },
                                        value: {
                                            type: "double",
                                            id: 2,
                                        },
                                    },
                                },

                                Exemplar: {
                                    oneofs: {
                                        value: {
                                            oneof: [
                                                "asDouble",
                                                "asInt",
                                            ],
                                        },
                                    },
                                    fields: {
                                        filteredAttributes: {
                                            rule: "repeated",
                                            type: "KeyValue",
                                            id: 7,
                                        },
                                        timeUnixNano: {
                                            type: "fixed64",
                                            id: 2,
                                        },
                                        asDouble: {
                                            type: "double",
                                            id: 3,
                                        },
                                        spanId: {
                                            type: "bytes",
                                            id: 4,
                                        },
                                        traceId: {
                                            type: "bytes",
                                            id: 5,
                                        },
                                        asInt: {
                                            type: "sfixed64",
                                            id: 6,
                                        },
                                    },
                                },

                                AggregationTemporality: {
                                    values: {
                                        AGGREGATION_TEMPORALITY_UNSPECIFIED: 0,
                                        AGGREGATION_TEMPORALITY_DELTA: 1,
                                        AGGREGATION_TEMPORALITY_CUMULATIVE: 2,
                                    },
                                },

                                KeyValue: {
                                    fields: {
                                        key: {
                                            type: "string",
                                            id: 1,
                                        },
                                        value: {
                                            type: "AnyValue",
                                            id: 2,
                                        },
                                    },
                                },

                                AnyValue: {
                                    oneofs: {
                                        value: {
                                            oneof: [
                                                "stringValue",
                                                "boolValue",
                                                "intValue",
                                                "doubleValue",
                                                "bytesValue",
                                                "arrayValue",
                                                "kvlistValue",
                                            ],
                                        },
                                    },
                                    fields: {
                                        stringValue: {
                                            type: "string",
                                            id: 1,
                                        },
                                        boolValue: {
                                            type: "bool",
                                            id: 2,
                                        },
                                        intValue: {
                                            type: "int64",
                                            id: 3,
                                        },
                                        doubleValue: {
                                            type: "double",
                                            id: 4,
                                        },
                                        bytesValue: {
                                            type: "bytes",
                                            id: 5,
                                        },
                                        arrayValue: {
                                            type: "ArrayValue",
                                            id: 6,
                                        },
                                        kvlistValue: {
                                            type: "KeyValueList",
                                            id: 7,
                                        },
                                    },
                                },

                                ArrayValue: {
                                    fields: {
                                        values: {
                                            rule: "repeated",
                                            type: "AnyValue",
                                            id: 1,
                                        },
                                    },
                                },

                                KeyValueList: {
                                    fields: {
                                        values: {
                                            rule: "repeated",
                                            type: "KeyValue",
                                            id: 1,
                                        },
                                    },
                                },

                                Resource: {
                                    fields: {
                                        attributes: {
                                            rule: "repeated",
                                            type: "KeyValue",
                                            id: 1,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    },
});

const ExportMetricsServiceRequest = root.lookupType(
    "opentelemetry.proto.metrics.ExportMetricsServiceRequest",
);

export function decodeOtlpMetricsProtobuf(buffer: Buffer): unknown {
    const message = ExportMetricsServiceRequest.decode(buffer);

    return ExportMetricsServiceRequest.toObject(message, {
        longs: String,
        bytes: Uint8Array,
        defaults: false,
    });
}