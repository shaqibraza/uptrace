import { Agent } from "undici";

import { validateMonitorUrl } from "./validate-monitor-url.js";

export async function createSafeHttpAgent(
    rawUrl: string,
) {
    const url = await validateMonitorUrl(
        rawUrl,
    );

    const agent = new Agent({
        keepAliveTimeout: 5_000,
        keepAliveMaxTimeout: 10_000,
    });

    return {
        url,
        agent,
    };
}