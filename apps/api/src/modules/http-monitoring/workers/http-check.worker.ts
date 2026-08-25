import { fetch } from "undici";

import { HttpCheckResultService } from "../services/http-check-result.service.js";
import { createSafeHttpAgent } from "../utils/http-request.client.js";
import { resolveMonitorRedirect } from "../utils/resolve-monitor-redirect.js";

type HttpCheckEndpoint = {
    id: string;
    url: string;
    method: string;
    expectedStatusCode: number;
    timeoutMs: number;
};

export class HttpCheckWorker {
    constructor(
        private readonly httpCheckResultService: HttpCheckResultService,
    ) { }

    async check(endpoint: HttpCheckEndpoint) {
        const checkedAt = new Date();
        const startTime = performance.now();

        let currentUrl = endpoint.url;
        let redirectCount = 0;

        try {
            while (true) {
                const {
                    url,
                    agent,
                } = await createSafeHttpAgent(
                    currentUrl,
                );

                const response = await fetch(url, {
                    method: endpoint.method,
                    signal: AbortSignal.timeout(
                        endpoint.timeoutMs,
                    ),
                    redirect: "manual",
                    dispatcher: agent,
                });

                if (
                    response.status >= 300 &&
                    response.status < 400
                ) {
                    const location =
                        response.headers.get(
                            "location",
                        );

                    if (!location) {
                        const responseTimeMs =
                            Math.round(
                                performance.now() -
                                startTime,
                            );

                        return await this.httpCheckResultService.create(
                            {
                                endpointId: endpoint.id,
                                status: "DOWN",
                                statusCode:
                                    response.status,
                                responseTimeMs,
                                errorMessage:
                                    "Redirect response did not contain a Location header",
                                checkedAt,
                            },
                        );
                    }

                    const redirect =
                        await resolveMonitorRedirect(
                            currentUrl,
                            location,
                            redirectCount,
                        );

                    currentUrl =
                        redirect.url.toString();

                    redirectCount =
                        redirect.redirectCount;

                    continue;
                }

                const responseTimeMs =
                    Math.round(
                        performance.now() -
                        startTime,
                    );

                const status =
                    response.status ===
                        endpoint.expectedStatusCode
                        ? "UP"
                        : "DOWN";

                return await this.httpCheckResultService.create(
                    {
                        endpointId: endpoint.id,
                        status,
                        statusCode:
                            response.status,
                        responseTimeMs,
                        ...(status === "DOWN"
                            ? {
                                errorMessage:
                                    `Expected status ${endpoint.expectedStatusCode}, received ${response.status}`,
                            }
                            : {}),
                        checkedAt,
                    },
                );
            }
        } catch (error) {
            console.error("HTTP CHECK ERROR:", error);
            const responseTimeMs =
                Math.round(
                    performance.now() -
                    startTime,
                );

            const errorMessage =
                error instanceof Error
                    ? error.message
                    : "HTTP request failed";

            return await this.httpCheckResultService.create(
                {
                    endpointId: endpoint.id,
                    status: "DOWN",
                    responseTimeMs,
                    errorMessage,
                    checkedAt,
                },
            );
        }
    }
}