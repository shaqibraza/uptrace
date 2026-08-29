"use client";

import type { ReactNode } from "react";

export type TableColumn<T> = {
    key: string;
    header: string;
    className?: string;
    render?: (item: T, index: number) => ReactNode;
};

type DataTableProps<T> = {
    data: T[];
    columns: TableColumn<T>[];
    rowKey: (item: T, index: number) => string;
    onRowClick?: (item: T) => void;
    empty?: ReactNode;
};

export function DataTable<T>({
    data,
    columns,
    rowKey,
    onRowClick,
    empty,
}: DataTableProps<T>) {
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
        <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
            <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] border-collapse">
                    <thead>
                        <tr className="border-b border-zinc-900 bg-black/40">
                            {columns.map((column) => (
                                <th
                                    key={column.key}
                                    className={`
                                        whitespace-nowrap
                                        px-4 py-3
                                        text-left
                                        text-[9px]
                                        font-medium
                                        uppercase
                                        tracking-wider
                                        text-zinc-700
                                        ${column.className ?? ""}
                                    `}
                                >
                                    {column.header}
                                </th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {data.map((item, index) => (
                            <tr
                                key={rowKey(item, index)}
                                onClick={() =>
                                    onRowClick?.(item)
                                }
                                className={`
                                    border-b border-zinc-900/70
                                    last:border-0
                                    transition-colors
                                    ${
                                        onRowClick
                                            ? "cursor-pointer hover:bg-zinc-900/40"
                                            : "hover:bg-zinc-900/20"
                                    }
                                `}
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.key}
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
                                                  ] ?? "",
                                              )}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}