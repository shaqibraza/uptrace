import { isIP } from "node:net";

export function isPrivateIPv4(ip: string) {
    const parts = ip.split(".").map(Number);

    if (
        parts.length !== 4 ||
        parts.some((part) => Number.isNaN(part))
    ) {
        return false;
    }

    const a = parts[0];
    const b = parts[1];

    if (a === undefined || b === undefined) {
        return false;
    }

    return (
        a === 0 ||
        a === 10 ||
        a === 127 ||
        (a === 100 && b >= 64 && b <= 127) ||
        (a === 169 && b === 254) ||
        (a === 172 && b >= 16 && b <= 31) ||
        (a === 192 && b === 168) ||
        (a === 192 && b === 0) ||
        (a === 198 && b >= 18 && b <= 19) ||
        a >= 224
    );
}

export function isPrivateIPv6(ip: string) {
    const normalized = ip.toLowerCase();

    return (
        normalized === "::" ||
        normalized === "::1" ||
        normalized.startsWith("fc") ||
        normalized.startsWith("fd") ||
        normalized.startsWith("fe80:")
    );
}

export function isPrivateIp(ip: string) {
    const version = isIP(ip);

    if (version === 4) {
        return isPrivateIPv4(ip);
    }

    if (version === 6) {
        return isPrivateIPv6(ip);
    }

    return false;
}