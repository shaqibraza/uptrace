import {
    and,
    desc,
    eq,
    gte,
    ilike,
    lte,
    or,
    sql,
} from "drizzle-orm";

import { logs } from "@uptrace/db";
import { db } from "../../../db.js";

export type LogRecord = {
    id: string;
    timestamp: Date;
    observedTimestamp: Date | null;
    severityNumber: number | null;
    severityText: string | null;
    body: string | null;
    traceId: string | null;
    spanId: string | null;
    serviceName: string | null;
    environment: string | null;
    attributes: Record<string, unknown> | null;
    resourceAttributes: Record<string, unknown> | null;
    scopeName: string | null;
    scopeVersion: string | null;
};

export type LogListOptions = {
    startTime?: Date;
    endTime?: Date;
    serviceName?: string;
    environment?: string;
    severity?: string;
    search?: string;
    traceId?: string;
    spanId?: string;
    limit?: number;
    offset?: number;
};

export type LogListResult = {
    logs: LogRecord[];
    total: number;
};

export type LogSummary = {
    totalLogs: number;
    errorLogs: number;
    warnLogs: number;
    infoLogs: number;
    debugLogs: number;
};

export type LogSource = {
    name: string;
    logCount: number;
};

export class LogRepository {
    /**
     * Insert a batch of log records.
     */
    async insertLogs(
        records: Array<{
            projectId: string;
            timestamp: Date;
            observedTimestamp?: Date;
            severityNumber?: number;
            severityText?: string;
            body?: string;
            traceId?: string;
            spanId?: string;
            serviceName?: string;
            environment?: string;
            attributes?: Record<string, unknown>;
            resourceAttributes?: Record<
                string,
                unknown
            >;
            scopeName?: string;
            scopeVersion?: string;
        }>,
    ): Promise<void> {
        if (records.length === 0) {
            return;
        }

        await db.insert(logs).values(
            records.map((record) => ({
                projectId:
                    record.projectId,

                timestamp:
                    record.timestamp,

                ...(record.observedTimestamp !==
                    undefined
                    ? {
                        observedTimestamp:
                            record.observedTimestamp,
                    }
                    : {}),

                ...(record.severityNumber !==
                    undefined
                    ? {
                        severityNumber:
                            String(
                                record.severityNumber,
                            ),
                    }
                    : {}),

                ...(record.severityText !==
                    undefined
                    ? {
                        severityText:
                            record.severityText,
                    }
                    : {}),

                ...(record.body !==
                    undefined
                    ? {
                        body: record.body,
                    }
                    : {}),

                ...(record.traceId !==
                    undefined
                    ? {
                        traceId:
                            record.traceId,
                    }
                    : {}),

                ...(record.spanId !==
                    undefined
                    ? {
                        spanId:
                            record.spanId,
                    }
                    : {}),

                ...(record.serviceName !==
                    undefined
                    ? {
                        serviceName:
                            record.serviceName,
                    }
                    : {}),

                ...(record.environment !==
                    undefined
                    ? {
                        environment:
                            record.environment,
                    }
                    : {}),

                ...(record.attributes !==
                    undefined
                    ? {
                        attributes:
                            record.attributes,
                    }
                    : {}),

                ...(record.resourceAttributes !==
                    undefined
                    ? {
                        resourceAttributes:
                            record.resourceAttributes,
                    }
                    : {}),

                ...(record.scopeName !==
                    undefined
                    ? {
                        scopeName:
                            record.scopeName,
                    }
                    : {}),

                ...(record.scopeVersion !==
                    undefined
                    ? {
                        scopeVersion:
                            record.scopeVersion,
                    }
                    : {}),
            })),
        );
    }

    /**
     * List logs for a project.
     *
     * Defaults to the last 24 hours.
     */
    async listByProject(
        projectId: string,
        options?: LogListOptions,
    ): Promise<LogListResult> {
        const now = new Date();

        const startTime =
            options?.startTime ??
            new Date(
                now.getTime() -
                24 * 60 * 60 * 1000,
            );

        const endTime =
            options?.endTime ?? now;

        const conditions = [
            eq(logs.projectId, projectId),
            gte(logs.timestamp, startTime),
            lte(logs.timestamp, endTime),
        ];

        if (options?.serviceName) {
            conditions.push(
                eq(
                    logs.serviceName,
                    options.serviceName,
                ),
            );
        }

        if (options?.environment) {
            conditions.push(
                eq(
                    logs.environment,
                    options.environment,
                ),
            );
        }

        if (options?.severity) {
            conditions.push(
                eq(
                    logs.severityText,
                    options.severity,
                ),
            );
        }

        if (options?.traceId) {
            conditions.push(
                eq(
                    logs.traceId,
                    options.traceId,
                ),
            );
        }

        if (options?.spanId) {
            conditions.push(
                eq(
                    logs.spanId,
                    options.spanId,
                ),
            );
        }

        if (options?.search) {
            const search =
                `%${options.search}%`;

            conditions.push(
                or(
                    ilike(
                        logs.body,
                        search,
                    ),
                    ilike(
                        logs.severityText,
                        search,
                    ),
                    ilike(
                        logs.serviceName,
                        search,
                    ),
                    sql`${logs.attributes}::text ILIKE ${search}`,
                    sql`${logs.resourceAttributes}::text ILIKE ${search}`,
                )!,
            );
        }

        const limit = Math.min(
            Math.max(
                options?.limit ?? 100,
                1,
            ),
            500,
        );

        const offset = Math.max(
            options?.offset ?? 0,
            0,
        );

        const countResult = await db
            .select({
                count: sql<number>`
                    count(*)::int
                `.as("count"),
            })
            .from(logs)
            .where(and(...conditions));

        const result = await db
            .select({
                id: logs.id,
                timestamp:
                    logs.timestamp,
                observedTimestamp:
                    logs.observedTimestamp,
                severityNumber:
                    logs.severityNumber,
                severityText:
                    logs.severityText,
                body: logs.body,
                traceId: logs.traceId,
                spanId: logs.spanId,
                serviceName:
                    logs.serviceName,
                environment:
                    logs.environment,
                attributes:
                    logs.attributes,
                resourceAttributes:
                    logs.resourceAttributes,
                scopeName:
                    logs.scopeName,
                scopeVersion:
                    logs.scopeVersion,
            })
            .from(logs)
            .where(and(...conditions))
            .orderBy(
                desc(logs.timestamp),
            )
            .limit(limit)
            .offset(offset);

        return {
            logs: result.map((log) => ({
                id: log.id,
                timestamp: new Date(
                    log.timestamp,
                ),
                observedTimestamp:
                    log.observedTimestamp
                        ? new Date(
                            log.observedTimestamp,
                        )
                        : null,
                severityNumber:
                    log.severityNumber !==
                        null
                        ? Number(
                            log.severityNumber,
                        )
                        : null,
                severityText:
                    log.severityText ??
                    null,
                body: log.body ?? null,
                traceId:
                    log.traceId ?? null,
                spanId:
                    log.spanId ?? null,
                serviceName:
                    log.serviceName ??
                    null,
                environment:
                    log.environment ??
                    null,
                attributes:
                    (log.attributes as Record<
                        string,
                        unknown
                    > | null) ?? null,
                resourceAttributes:
                    (log.resourceAttributes as Record<
                        string,
                        unknown
                    > | null) ?? null,
                scopeName:
                    log.scopeName ?? null,
                scopeVersion:
                    log.scopeVersion ?? null,
            })),
            total: Number(
                countResult[0]?.count ?? 0,
            ),
        };
    }

    /**
     * Get aggregate log statistics.
     */
    async getSummary(
        projectId: string,
        options?: Pick<
            LogListOptions,
            "startTime" | "endTime" | "serviceName" | "environment"
        >,
    ): Promise<LogSummary> {
        const now = new Date();

        const startTime =
            options?.startTime ??
            new Date(
                now.getTime() -
                24 * 60 * 60 * 1000,
            );

        const endTime =
            options?.endTime ?? now;

        const conditions = [
            eq(logs.projectId, projectId),
            gte(logs.timestamp, startTime),
            lte(logs.timestamp, endTime),
        ];

        if (options?.serviceName) {
            conditions.push(
                eq(
                    logs.serviceName,
                    options.serviceName,
                ),
            );
        }

        if (options?.environment) {
            conditions.push(
                eq(
                    logs.environment,
                    options.environment,
                ),
            );
        }

        const [result] = await db
            .select({
                totalLogs: sql<number>`
                    count(*)::int
                `.as("total_logs"),

                errorLogs: sql<number>`
                    count(
                        case
                            when
                                ${logs.severityNumber} ~ '^[0-9]+$'
                                and cast(
                                    ${logs.severityNumber}
                                    as integer
                                ) >= 17
                            then 1
                        end
                    )::int
                `.as("error_logs"),

                warnLogs: sql<number>`
                    count(
                        case
                            when
                                upper(
                                    coalesce(
                                        ${logs.severityText},
                                        ''
                                    )
                                ) like 'WARN%'
                            then 1
                        end
                    )::int
                `.as("warn_logs"),

                infoLogs: sql<number>`
                    count(
                        case
                            when
                                upper(
                                    coalesce(
                                        ${logs.severityText},
                                        ''
                                    )
                                ) like 'INFO%'
                            then 1
                        end
                    )::int
                `.as("info_logs"),

                debugLogs: sql<number>`
                    count(
                        case
                            when
                                upper(
                                    coalesce(
                                        ${logs.severityText},
                                        ''
                                    )
                                ) like 'DEBUG%'
                            then 1
                        end
                    )::int
                `.as("debug_logs"),
            })
            .from(logs)
            .where(and(...conditions));

        return {
            totalLogs: Number(
                result?.totalLogs ?? 0,
            ),
            errorLogs: Number(
                result?.errorLogs ?? 0,
            ),
            warnLogs: Number(
                result?.warnLogs ?? 0,
            ),
            infoLogs: Number(
                result?.infoLogs ?? 0,
            ),
            debugLogs: Number(
                result?.debugLogs ?? 0,
            ),
        };
    }

    /**
     * List services that are producing logs.
     */
    async listSources(
        projectId: string,
        options?: Pick<
            LogListOptions,
            "startTime" | "endTime" | "environment"
        >,
    ): Promise<LogSource[]> {
        const now = new Date();

        const startTime =
            options?.startTime ??
            new Date(
                now.getTime() -
                24 * 60 * 60 * 1000,
            );

        const endTime =
            options?.endTime ?? now;

        const conditions = [
            eq(logs.projectId, projectId),
            gte(logs.timestamp, startTime),
            lte(logs.timestamp, endTime),
        ];

        if (options?.environment) {
            conditions.push(
                eq(
                    logs.environment,
                    options.environment,
                ),
            );
        }

        const sourceName = sql<string>`
            coalesce(
                nullif(
                    ${logs.serviceName},
                    ''
                ),
                'unknown'
            )
        `;

        const result = await db
            .select({
                name: sourceName.as(
                    "source_name",
                ),
                logCount: sql<number>`
                    count(*)::int
                `.as("log_count"),
            })
            .from(logs)
            .where(and(...conditions))
            .groupBy(sourceName)
            .orderBy(
                desc(
                    sql`count(*)`,
                ),
            );

        return result.map((source) => ({
            name:
                source.name ?? "unknown",
            logCount: Number(
                source.logCount ?? 0,
            ),
        }));
    }

    /**
     * Get a single log by ID within a project.
     */
    async getById(
        projectId: string,
        logId: string,
    ): Promise<LogRecord | null> {
        const [result] = await db
            .select({
                id: logs.id,
                timestamp:
                    logs.timestamp,
                observedTimestamp:
                    logs.observedTimestamp,
                severityNumber:
                    logs.severityNumber,
                severityText:
                    logs.severityText,
                body: logs.body,
                traceId: logs.traceId,
                spanId: logs.spanId,
                serviceName:
                    logs.serviceName,
                environment:
                    logs.environment,
                attributes:
                    logs.attributes,
                resourceAttributes:
                    logs.resourceAttributes,
                scopeName:
                    logs.scopeName,
                scopeVersion:
                    logs.scopeVersion,
            })
            .from(logs)
            .where(
                and(
                    eq(
                        logs.projectId,
                        projectId,
                    ),
                    eq(
                        logs.id,
                        logId,
                    ),
                ),
            )
            .limit(1);

        if (!result) {
            return null;
        }

        return {
            id: result.id,
            timestamp: new Date(
                result.timestamp,
            ),
            observedTimestamp:
                result.observedTimestamp
                    ? new Date(
                        result.observedTimestamp,
                    )
                    : null,
            severityNumber:
                result.severityNumber !==
                    null
                    ? Number(
                        result.severityNumber,
                    )
                    : null,
            severityText:
                result.severityText ??
                null,
            body: result.body ?? null,
            traceId:
                result.traceId ?? null,
            spanId:
                result.spanId ?? null,
            serviceName:
                result.serviceName ??
                null,
            environment:
                result.environment ??
                null,
            attributes:
                (result.attributes as Record<
                    string,
                    unknown
                > | null) ?? null,
            resourceAttributes:
                (result.resourceAttributes as Record<
                    string,
                    unknown
                > | null) ?? null,
            scopeName:
                result.scopeName ?? null,
            scopeVersion:
                result.scopeVersion ?? null,
        };
    }
}