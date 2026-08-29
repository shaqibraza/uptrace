import { Loader2 } from "lucide-react";

export function LoadingState({
    message = "Loading data...",
}: {
    message?: string;
}) {
    return (
        <div className="flex min-h-[320px] items-center justify-center">
            <div className="flex flex-col items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-900 bg-zinc-950">
                    <Loader2 className="h-4 w-4 animate-spin text-zinc-600" />
                </div>

                <p className="mt-3 text-xs text-zinc-600">
                    {message}
                </p>
            </div>
        </div>
    );
}