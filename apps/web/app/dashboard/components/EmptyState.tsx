import { Inbox } from "lucide-react";

export function EmptyState({
    title,
    description,
    action,
}: {
    title: string;
    description: string;
    action?: React.ReactNode;
}) {
    return (
        <div className="flex min-h-[320px] items-center justify-center rounded-xl border border-dashed border-zinc-900 bg-zinc-950/50 px-6">
            <div className="max-w-sm text-center">
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl border border-zinc-900 bg-black">
                    <Inbox className="h-4 w-4 text-zinc-700" />
                </div>

                <h3 className="mt-4 text-sm font-medium text-zinc-400">
                    {title}
                </h3>

                <p className="mx-auto mt-2 text-xs leading-5 text-zinc-700">
                    {description}
                </p>

                {action && (
                    <div className="mt-5">
                        {action}
                    </div>
                )}
            </div>
        </div>
    );
}