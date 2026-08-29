"use client";

import type {
    CSSProperties,
    HTMLAttributes,
} from "react";

type SkeletonProps =
    HTMLAttributes<HTMLDivElement> & {
        className?: string;
        style?: CSSProperties;
    };

export function Skeleton({
    className = "",
    style,
    ...props
}: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            style={style}
            className={`
                animate-pulse
                rounded-md
                bg-zinc-900
                ${className}
            `}
            {...props}
        />
    );
}

/* ========================================================================== */
/* Stat Card Skeleton                                                         */
/* ========================================================================== */

export function StatCardSkeleton() {
    return (
        <div className="rounded-xl border border-zinc-900 bg-zinc-950 p-4">
            <Skeleton className="h-2.5 w-20" />

            <Skeleton className="mt-4 h-7 w-28" />

            <Skeleton className="mt-3 h-2.5 w-16" />
        </div>
    );
}

/* ========================================================================== */
/* Stats Grid Skeleton                                                        */
/* ========================================================================== */

export function StatsGridSkeleton({
    count = 4,
}: {
    count?: number;
}) {
    return (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {Array.from(
                { length: count },
                (_, index) => (
                    <StatCardSkeleton
                        key={index}
                    />
                ),
            )}
        </div>
    );
}

/* ========================================================================== */
/* Chart Skeleton                                                             */
/* ========================================================================== */

export function ChartSkeleton({
    height = "h-72",
}: {
    height?: string;
}) {
    const bars = [
        42, 65, 48, 72, 55, 82,
        60, 75, 50, 68, 45, 78,
    ];

    return (
        <div
            className={`
                rounded-xl
                border border-zinc-900
                bg-zinc-950
                p-4
                ${height}
            `}
        >
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-3 w-28" />

                    <Skeleton className="mt-2 h-2 w-40" />
                </div>

                <Skeleton className="h-8 w-20 rounded-lg" />
            </div>

            <div className="mt-8 flex h-[calc(100%-4.5rem)] items-end gap-2">
                {bars.map((barHeight, index) => (
                    <Skeleton
                        key={index}
                        className="flex-1 rounded-t-sm"
                        style={{
                            height: `${barHeight}%`,
                        }}
                    />
                ))}
            </div>
        </div>
    );
}

/* ========================================================================== */
/* Table Skeleton                                                             */
/* ========================================================================== */

export function TableSkeleton({
    rows = 7,
    columns = 5,
}: {
    rows?: number;
    columns?: number;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
            {/* Header */}
            <div
                className="
                    grid grid-cols-5
                    gap-4
                    border-b border-zinc-900
                    bg-black/40
                    px-4 py-3
                "
            >
                {Array.from(
                    { length: columns },
                    (_, index) => (
                        <Skeleton
                            key={index}
                            className="h-2 w-16"
                        />
                    ),
                )}
            </div>

            {/* Rows */}
            <div>
                {Array.from(
                    { length: rows },
                    (_, rowIndex) => (
                        <div
                            key={rowIndex}
                            className="
                                grid grid-cols-5
                                gap-4
                                border-b
                                border-zinc-900/70
                                px-4 py-4
                                last:border-0
                            "
                        >
                            {Array.from(
                                {
                                    length: columns,
                                },
                                (_, columnIndex) => (
                                    <Skeleton
                                        key={
                                            columnIndex
                                        }
                                        className={`
                                            h-2.5
                                            ${
                                                columnIndex ===
                                                0
                                                    ? "w-24"
                                                    : "w-16"
                                            }
                                        `}
                                    />
                                ),
                            )}
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}

/* ========================================================================== */
/* List Skeleton                                                              */
/* ========================================================================== */

export function ListSkeleton({
    count = 6,
}: {
    count?: number;
}) {
    return (
        <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
            {Array.from(
                { length: count },
                (_, index) => (
                    <div
                        key={index}
                        className="
                            flex items-center gap-3
                            border-b
                            border-zinc-900/70
                            px-4 py-3.5
                            last:border-0
                        "
                    >
                        <Skeleton className="h-7 w-7 shrink-0 rounded-lg" />

                        <div className="min-w-0 flex-1">
                            <Skeleton className="h-2.5 w-32" />

                            <Skeleton className="mt-2 h-2 w-20" />
                        </div>

                        <Skeleton className="h-2 w-12" />
                    </div>
                ),
            )}
        </div>
    );
}

/* ========================================================================== */
/* Dashboard Skeleton                                                         */
/* ========================================================================== */

export function DashboardSkeleton() {
    return (
        <div className="space-y-5">
            {/* Page header */}
            <div className="flex items-center justify-between">
                <div>
                    <Skeleton className="h-5 w-28" />

                    <Skeleton className="mt-2 h-2.5 w-52" />
                </div>

                <Skeleton className="h-9 w-28 rounded-lg" />
            </div>

            {/* Stats */}
            <StatsGridSkeleton />

            {/* Charts */}
            <div className="grid gap-4 xl:grid-cols-2">
                <ChartSkeleton />
                <ChartSkeleton />
            </div>

            {/* Table */}
            <TableSkeleton />
        </div>
    );
}