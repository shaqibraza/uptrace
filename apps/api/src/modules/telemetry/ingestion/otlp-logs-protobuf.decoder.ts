import protobuf from "protobufjs";

const root = protobuf.Root.fromJSON({
    nested: {
        opentelemetry: {
            nested: {
                proto: {
                    nested: {
                        logs: {
                            nested: {
                                ExportLogsServiceRequest: {
                                    fields: {
                                        resourceLogs: {
                                            rule: "repeated",
                                            type: "ResourceLogs",
                                            id: 1,
                                        },
                                    },
                                },

                                ExportLogsServiceResponse: {
                                    fields: {},
                                },

                                ResourceLogs: {
                                    fields: {
                                        resource: {
                                            type: "Resource",
                                            id: 1,
                                        },
                                        scopeLogs: {
                                            rule: "repeated",
                                            type: "ScopeLogs",
                                            id: 2,
                                        },
                                        schemaUrl: {
                                            type: "string",
                                            id: 3,
                                        },
                                    },
                                },

                                ScopeLogs: {
                                    fields: {
                                        scope: {
                                            type: "InstrumentationScope",
                                            id: 1,
                                        },
                                        logRecords: {
                                            rule: "repeated",
                                            type: "LogRecord",
                                            id: 2,
                                        },
                                        schemaUrl: {
                                            type: "string",
                                            id: 3,
                                        },
                                    },
                                },

                                LogRecord: {
                                    fields: {
                                        timeUnixNano: {
                                            type: "fixed64",
                                            id: 1,
                                        },
                                        observedTimeUnixNano: {
                                            type: "fixed64",
                                            id: 11,
                                        },
                                        severityNumber: {
                                            type: "SeverityNumber",
                                            id: 2,
                                        },
                                        severityText: {
                                            type: "string",
                                            id: 3,
                                        },
                                        body: {
                                            type: "AnyValue",
                                            id: 5,
                                        },
                                        attributes: {
                                            rule: "repeated",
                                            type: "KeyValue",
                                            id: 6,
                                        },
                                        droppedAttributesCount: {
                                            type: "uint32",
                                            id: 7,
                                        },
                                        flags: {
                                            type: "uint32",
                                            id: 8,
                                        },
                                        traceId: {
                                            type: "bytes",
                                            id: 9,
                                        },
                                        spanId: {
                                            type: "bytes",
                                            id: 10,
                                        },
                                    },
                                },

                                SeverityNumber: {
                                    values: {
                                        SEVERITY_NUMBER_UNSPECIFIED: 0,
                                        SEVERITY_NUMBER_TRACE: 1,
                                        SEVERITY_NUMBER_TRACE2: 2,
                                        SEVERITY_NUMBER_TRACE3: 3,
                                        SEVERITY_NUMBER_TRACE4: 4,
                                        SEVERITY_NUMBER_DEBUG: 5,
                                        SEVERITY_NUMBER_DEBUG2: 6,
                                        SEVERITY_NUMBER_DEBUG3: 7,
                                        SEVERITY_NUMBER_DEBUG4: 8,
                                        SEVERITY_NUMBER_INFO: 9,
                                        SEVERITY_NUMBER_INFO2: 10,
                                        SEVERITY_NUMBER_INFO3: 11,
                                        SEVERITY_NUMBER_INFO4: 12,
                                        SEVERITY_NUMBER_WARN: 13,
                                        SEVERITY_NUMBER_WARN2: 14,
                                        SEVERITY_NUMBER_WARN3: 15,
                                        SEVERITY_NUMBER_WARN4: 16,
                                        SEVERITY_NUMBER_ERROR: 17,
                                        SEVERITY_NUMBER_ERROR2: 18,
                                        SEVERITY_NUMBER_ERROR3: 19,
                                        SEVERITY_NUMBER_ERROR4: 20,
                                        SEVERITY_NUMBER_FATAL: 21,
                                        SEVERITY_NUMBER_FATAL2: 22,
                                        SEVERITY_NUMBER_FATAL3: 23,
                                        SEVERITY_NUMBER_FATAL4: 24,
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

                                Resource: {
                                    fields: {
                                        attributes: {
                                            rule: "repeated",
                                            type: "KeyValue",
                                            id: 1,
                                        },
                                        droppedAttributesCount: {
                                            type: "uint32",
                                            id: 2,
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

const ExportLogsServiceRequest = root.lookupType(
    "opentelemetry.proto.logs.ExportLogsServiceRequest",
);

export function decodeOtlpLogsProtobuf(
    buffer: Buffer,
): unknown {
    const message =
        ExportLogsServiceRequest.decode(buffer);

    return ExportLogsServiceRequest.toObject(
        message,
        {
            longs: String,
            bytes: Uint8Array,
            defaults: false,
        },
    );
}