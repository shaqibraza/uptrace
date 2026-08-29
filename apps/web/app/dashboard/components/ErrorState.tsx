import {
    AlertCircle,
    RefreshCw,
} from "lucide-react";

export function ErrorState({
    title = "Something went wrong",
    description = "We couldn't load this data. Please try again.",
    onRetry,
}: {
    title?: string;
    description?: string;
    onRetry?: () => void;
}) {
    return (
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-red-500/10 bg-red-500/[0.02] px-6">
            <div className="max-w-sm text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-red-500/10 bg-red-500/[0.03]">
                    <AlertCircle className="h-4 w-4 text-red-400" />
                </div>

                <h3 className="mt-4 text-sm font-medium text-zinc-400">
                    {title}
                </h3>

                <p className="mx-auto mt-2 text-xs leading-5 text-zinc-700">
                    {description}
                </p>

                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="
                            mt-5 inline-flex h-8
                            items-center gap-2
                            rounded-lg
                            border border-zinc-900
                            bg-zinc-950
                            px-3
                            text-[10px]
                            text-zinc-500
                            transition-colors
                            hover:border-zinc-800
                            hover:text-zinc-300
                        "
                    >
                        <RefreshCw className="h-3 w-3" />
                        Try again
                    </button>
                )}
            </div>
        </div>
    );
}