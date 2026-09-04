import { AppError } from "../../../core/errors/app-error.js";
import { validateMonitorUrl } from "./validate-monitor-url.js";

const MAX_REDIRECTS = 5;

export async function resolveMonitorRedirect(
    currentUrl: string,
    location: string,
    redirectCount: number,
) {
    if (redirectCount >= MAX_REDIRECTS) {
        throw new AppError(
            "Maximum monitoring redirects exceeded",
            400,
            "TOO_MANY_MONITOR_REDIRECTS",
        );
    }

    let redirectUrl: URL;

    try {
        redirectUrl = new URL(
            location,
            currentUrl,
        );
    } catch {
        throw new AppError(
            "Invalid redirect URL",
            400,
            "INVALID_MONITOR_REDIRECT",
        );
    }

    // Redirect target gets the exact same SSRF validation as the original monitoring URL.
    const validatedUrl =
        await validateMonitorUrl(
            redirectUrl.toString(),
        );

    return {
        url: validatedUrl,
        redirectCount: redirectCount + 1,
    };
}