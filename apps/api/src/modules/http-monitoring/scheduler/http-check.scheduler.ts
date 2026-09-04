import { HttpEndpointRepository } from "../repositories/http-endpoint.repository.js";
import { HttpCheckWorker } from "../workers/http-check.worker.js";

type ScheduledEndpoint = {
    id: string;
    url: string;
    method: string;
    expectedStatusCode: number;
    intervalSeconds: number;
    timeoutMs: number;
    isActive: boolean;
};

export class HttpCheckScheduler {
    private readonly timers = new Map<
        string,
        ReturnType<typeof setTimeout>
    >();

    private readonly endpointConfigs = new Map<
        string,
        string
    >();

    private syncTimer:
        ReturnType<typeof setInterval> | null = null;

    constructor(
        private readonly endpointRepository: HttpEndpointRepository,
        private readonly httpCheckWorker: HttpCheckWorker,
    ) {}

    async start() {
        await this.sync();

        this.syncTimer = setInterval(
            () => {
                void this.sync();
            },
            10_000,
        );
    }

    stop() {
        if (this.syncTimer) {
            clearInterval(this.syncTimer);
            this.syncTimer = null;
        }

        for (const timer of this.timers.values()) {
            clearTimeout(timer);
        }

        this.timers.clear();
        this.endpointConfigs.clear();
    }

    private async sync() {
        try {
            const endpoints =
                await this.endpointRepository.findActive();

            const activeEndpointIds =
                new Set(
                    endpoints.map(
                        (endpoint) => endpoint.id,
                    ),
                );

            for (const endpoint of endpoints) {
                this.scheduleEndpoint(endpoint);
            }

            for (const endpointId of this.timers.keys()) {
                if (
                    !activeEndpointIds.has(
                        endpointId,
                    )
                ) {
                    this.unscheduleEndpoint(
                        endpointId,
                    );
                }
            }
        } catch (error) {
            console.error(
                "HTTP CHECK SCHEDULER SYNC ERROR:",
                error,
            );
        }
    }

    private scheduleEndpoint(
        endpoint: ScheduledEndpoint,
    ) {
        const configKey =
            this.createConfigKey(endpoint);

        const previousConfig =
            this.endpointConfigs.get(
                endpoint.id,
            );

        if (
            previousConfig === configKey &&
            this.timers.has(endpoint.id)
        ) {
            return;
        }

        if (
            previousConfig !== undefined &&
            previousConfig !== configKey
        ) {
            this.clearEndpointTimer(
                endpoint.id,
            );
        }

        this.endpointConfigs.set(
            endpoint.id,
            configKey,
        );

        void this.runCheck(endpoint);
    }

    private async runCheck(
        endpoint: ScheduledEndpoint,
    ) {
        try {
            await this.httpCheckWorker.check(
                endpoint,
            );
        } catch (error) {
            console.error(
                `HTTP CHECK FAILED: ${endpoint.method} ${endpoint.url}`,
                error,
            );
        } finally {
            const currentConfig =
                this.endpointConfigs.get(
                    endpoint.id,
                );

            if (
                currentConfig !==
                this.createConfigKey(endpoint)
            ) {
                return;
            }

            if (!endpoint.isActive) {
                return;
            }

            const delay =
                Math.max(
                    endpoint.intervalSeconds,
                    1,
                ) * 1000;

            const timer = setTimeout(
                () => {
                    this.timers.delete(
                        endpoint.id,
                    );

                    void this.runCheck(
                        endpoint,
                    );
                },
                delay,
            );

            this.timers.set(
                endpoint.id,
                timer,
            );
        }
    }

    private unscheduleEndpoint(
        endpointId: string,
    ) {
        this.clearEndpointTimer(
            endpointId,
        );

        this.endpointConfigs.delete(
            endpointId,
        );
    }

    private clearEndpointTimer(
        endpointId: string,
    ) {
        const timer =
            this.timers.get(endpointId);

        if (timer) {
            clearTimeout(timer);
            this.timers.delete(endpointId);
        }
    }

    private createConfigKey(
        endpoint: ScheduledEndpoint,
    ) {
        return JSON.stringify({
            url: endpoint.url,
            method: endpoint.method,
            expectedStatusCode:
                endpoint.expectedStatusCode,
            intervalSeconds:
                endpoint.intervalSeconds,
            timeoutMs: endpoint.timeoutMs,
            isActive: endpoint.isActive,
        });
    }
}