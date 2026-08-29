"use client";

import type { ReactNode } from "react";

export type ResponsiveColumn<T> = {
    key: string;
    header: string;
    mobileLabel?: string;
    hideOnMobile?: boolean;
    render?: (item: T, index: number) => ReactNode;
};

type ResponsiveDataTableProps<T> = {
    data: T[];
    columns: ResponsiveColumn<T>[];
    rowKey: (item: T, index: number) => string;
    onRowClick?: (item: T) => void;
    empty?: ReactNode;
};

export function ResponsiveDataTable<T>({
    data,
    columns,
    rowKey,
    onRowClick,
    empty,
}: ResponsiveDataTableProps<T>) {
    if (data.length === 0) {
        return (
            <div className="rounded-xl border border-zinc-900 bg-zinc-950">
                {empty ?? (
                    <div className="flex min-h-40 items-center justify-center text-xs text-zinc-700">
                        No data found.
                    </div>
                )}
            </div>
        );
    }

    return (
        <>
            {/* ======================================================== */}
            {/* Desktop Table                                            */}
            {/* ======================================================== */}

            <div className="hidden overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950 md:block">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px] border-collapse">
                        <thead>
                            <tr className="border-b border-zinc-900 bg-black/40">
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className="
                                            whitespace-nowrap
                                            px-4 py-3
                                            text-left
                                            text-[9px]
                                            font-medium
                                            uppercase
                                            tracking-wider
                                            text-zinc-700
                                        "
                                    >
                                        {column.header}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {data.map((item, index) => (
                                <tr
                                    key={rowKey(
                                        item,
                                        index,
                                    )}
                                    onClick={() =>
                                        onRowClick?.(
                                            item,
                                        )
                                    }
                                    className={`
                                        border-b
                                        border-zinc-900/70
                                        last:border-0
                                        transition-colors
                                        ${
                                            onRowClick
                                                ? "cursor-pointer hover:bg-zinc-900/40"
                                                : "hover:bg-zinc-900/20"
                                        }
                                    `}
                                >
                                    {columns.map(
                                        (
                                            column,
                                        ) => (
                                            <td
                                                key={
                                                    column.key
                                                }
                                                className="
                                                    whitespace-nowrap
                                                    px-4 py-3.5
                                                    text-xs
                                                    text-zinc-500
                                                "
                                            >
                                                {column.render
                                                    ? column.render(
                                                          item,
                                                          index,
                                                      )
                                                    : String(
                                                          item[
                                                              column.key as keyof T
                                                          ] ??
                                                              "",
                                                      )}
                                            </td>
                                        ),
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* ======================================================== */}
            {/* Mobile Cards                                             */}
            {/* ======================================================== */}

            <div className="space-y-2 md:hidden">
                {data.map((item, index) => {
                    const visibleColumns =
                        columns.filter(
                            (column) =>
                                !column.hideOnMobile,
                        );

                    const primaryColumn =
                        visibleColumns[0];

                    const secondaryColumns =
                        visibleColumns.slice(1);

                    return (
                        <button
                            key={rowKey(
                                item,
                                index,
                            )}
                            type="button"
                            onClick={() =>
                                onRowClick?.(item)
                            }
                            disabled={!onRowClick}
                            className={`
                                w-full
                                rounded-xl
                                border border-zinc-900
                                bg-zinc-950
                                p-4
                                text-left
                                ${
                                    onRowClick
                                        ? "cursor-pointer transition-colors hover:border-zinc-800 hover:bg-zinc-900/40"
                                        : ""
                                }
                            `}
                        >
                            {/* Primary */}
                            {primaryColumn && (
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="mb-1 text-[8px] uppercase tracking-wider text-zinc-800">
                                            {
                                                primaryColumn.mobileLabel ??
                                                primaryColumn.header
                                            }
                                        </p>

                                        <div className="truncate text-xs text-zinc-300">
                                            {primaryColumn.render
                                                ? primaryColumn.render(
                                                      item,
                                                      index,
                                                  )
                                                : String(
                                                      item[
                                                          primaryColumn.key as keyof T
                                                      ] ??
                                                          "",
                                                  )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Secondary values */}
                            {secondaryColumns.length >
                                0 && (
                                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
                                    {secondaryColumns.map(
                                        (
                                            column,
                                        ) => (
                                            <div
                                                key={
                                                    column.key
                                                }
                                            >
                                                <p className="mb-1 text-[8px] uppercase tracking-wider text-zinc-800">
                                                    {
                                                        column.mobileLabel ??
                                                        column.header
                                                    }
                                                </p>

                                                <div className="truncate text-[10px] text-zinc-500">
                                                    {column.render
                                                        ? column.render(
                                                              item,
                                                              index,
                                                          )
                                                        : String(
                                                              item[
                                                                  column.key as keyof T
                                                              ] ??
                                                                  "",
                                                          )}
                                                </div>
                                            </div>
                                        ),
                                    )}
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>
        </>
    );
}