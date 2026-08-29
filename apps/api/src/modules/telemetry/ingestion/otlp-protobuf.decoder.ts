import protobuf from "protobufjs";

const root = protobuf.Root.fromJSON({
    nested: {
        opentelemetry: {
            nested: {
                proto: {
                    nested: {
                        trace: {
                            nested: {
                                ExportTraceServiceRequest: {
                                    fields: {
                                        resourceSpans: {
                                            rule: "repeated",
                                            type: "ResourceSpans",
                                            id: 1,
                                        },
                                    },
                                },

                                ResourceSpans: {
                                    fields: {
                                        resource: {
                                            type: "Resource",
                                            id: 1,
                                        },
                                        scopeSpans: {
                                            rule: "repeated",
                                            type: "ScopeSpans",
                                            id: 2,
                                        },
                                    },
                                },

                                ScopeSpans: {
                                    fields: {
                                        spans: {
                                            rule: "repeated",
                                            type: "Span",
                                            id: 2,
                                        },
                                    },
                                },

                                Span: {
                                    fields: {
                                        traceId: {
                                            type: "bytes",
                                            id: 1,
                                        },
                                        spanId: {
                                            type: "bytes",
                                            id: 2,
                                        },
                                        parentSpanId: {
                                            type: "bytes",
                                            id: 4,
                                        },
                                        name: {
                                            type: "string",
                                            id: 5,
                                        },
                                        kind: {
                                            type: "int32",
                                            id: 6,
                                        },
                                        startTimeUnixNano: {
                                            type: "fixed64",
                                            id: 7,
                                        },
                                        endTimeUnixNano: {
                                            type: "fixed64",
                                            id: 8,
                                        },
                                        attributes: {
                                            rule: "repeated",
                                            type: "KeyValue",
                                            id: 9,
                                        },
                                        events: {
                                            rule: "repeated",
                                            type: "Event",
                                            id: 11,
                                        },
                                        status: {
                                            type: "Status",
                                            id: 15,
                                        },
                                    },
                                },

                                Event: {
                                    fields: {
                                        timeUnixNano: {
                                            type: "fixed64",
                                            id: 1,
                                        },
                                        name: {
                                            type: "string",
                                            id: 2,
                                        },
                                        attributes: {
                                            rule: "repeated",
                                            type: "KeyValue",
                                            id: 3,
                                        },
                                    },
                                },

                                Status: {
                                    fields: {
                                        message: {
                                            type: "string",
                                            id: 2,
                                        },
                                        code: {
                                            type: "int32",
                                            id: 3,
                                        },
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

const ExportTraceServiceRequest = root.lookupType(
    "opentelemetry.proto.trace.ExportTraceServiceRequest",
);

export function decodeOtlpProtobuf(buffer: Buffer): unknown {
    const message = ExportTraceServiceRequest.decode(buffer);

    return ExportTraceServiceRequest.toObject(message, {
        longs: String,
        bytes: Uint8Array,
        defaults: false,
    });
}