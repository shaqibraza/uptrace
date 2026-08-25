import { lookup } from "node:dns/promises";
import { isIP } from "node:net";

import { AppError } from "../../../core/errors/app-error.js";

import { isPrivateIp } from "./ip-security.js";

const BLOCKED_HOSTNAMES = new Set([
    "localhost",
]);

export async function validateMonitorUrl(
    rawUrl: string,
) {
    let url: URL;

    try {
        url = new URL(rawUrl);
    } catch {
        throw new AppError(
            "Invalid monitoring URL",
            400,
            "INVALID_MONITOR_URL",
        );
    }

    if (
        url.protocol !== "http:" &&
        url.protocol !== "https:"
    ) {
        throw new AppError(
            "Only HTTP and HTTPS URLs are allowed",
            400,
            "INVALID_MONITOR_URL_PROTOCOL",
        );
    }

    const hostname = url.hostname.toLowerCase();

    if (!hostname) {
        throw new AppError(
            "Monitoring URL must contain a hostname",
            400,
            "INVALID_MONITOR_HOST",
        );
    }

    if (BLOCKED_HOSTNAMES.has(hostname)) {
        throw new AppError(
            "Monitoring internal hosts are not allowed",
            400,
            "BLOCKED_MONITOR_HOST",
        );
    }

    /*
     * If the hostname itself is an IP address,
     * validate it directly and skip DNS resolution.
     */
    if (isIP(hostname)) {
        if (isPrivateIp(hostname)) {
            throw new AppError(
                "Monitoring private or internal IP addresses is not allowed",
                400,
                "BLOCKED_MONITOR_IP",
            );
        }

        return url;
    }

    let addresses;

    try {
        addresses = await lookup(hostname, {
            all: true,
        });
    } catch {
        throw new AppError(
            "Unable to resolve monitoring hostname",
            400,
            "MONITOR_HOST_RESOLUTION_FAILED",
        );
    }

    if (addresses.length === 0) {
        throw new AppError(
            "Monitoring hostname did not resolve to an address",
            400,
            "MONITOR_HOST_NOT_RESOLVED",
        );
    }

    /*
     * Every resolved address must be public.
     *
     * We check ALL addresses instead of accepting the
     * first public address because DNS can return both
     * public and private addresses.
     */
    for (const address of addresses) {
        if (isPrivateIp(address.address)) {
            throw new AppError(
                "Monitoring private or internal addresses is not allowed",
                400,
                "BLOCKED_MONITOR_ADDRESS",
            );
        }
    }

    return url;
}