"use client";

import {
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
} from "lucide-react";

type PaginationProps = {
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    pageSize?: number;
    totalItems?: number;
};

export function Pagination({
    page,
    totalPages,
    onPageChange,
    pageSize = 20,
    totalItems,
}: PaginationProps) {
    if (totalPages <= 1) {
        return null;
    }

    const startItem =
        totalItems === undefined
            ? (page - 1) * pageSize + 1
            : Math.min(
                  (page - 1) * pageSize + 1,
                  totalItems,
              );

    const endItem =
        totalItems === undefined
            ? page * pageSize
            : Math.min(page * pageSize, totalItems);

    const pages = getPageNumbers(page, totalPages);

    return (
        <div
            className="
                flex flex-col gap-3
                border-t border-zinc-900
                px-4 py-3
                sm:flex-row sm:items-center
                sm:justify-between
            "
        >
            {/* Result count */}
            <p className="text-[10px] text-zinc-700">
                {totalItems !== undefined ? (
                    <>
                        Showing{" "}
                        <span className="text-zinc-500">
                            {startItem}
                        </span>{" "}
                        to{" "}
                        <span className="text-zinc-500">
                            {endItem}
                        </span>{" "}
                        of{" "}
                        <span className="text-zinc-500">
                            {totalItems}
                        </span>
                    </>
                ) : (
                    <>
                        Page{" "}
                        <span className="text-zinc-500">
                            {page}
                        </span>{" "}
                        of{" "}
                        <span className="text-zinc-500">
                            {totalPages}
                        </span>
                    </>
                )}
            </p>

            {/* Controls */}
            <div className="flex items-center gap-1">
                {/* Previous */}
                <button
                    type="button"
                    disabled={page === 1}
                    onClick={() =>
                        onPageChange(page - 1)
                    }
                    aria-label="Previous page"
                    className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        border border-zinc-900
                        bg-black
                        text-zinc-600
                        transition-colors
                        hover:border-zinc-800
                        hover:text-zinc-300
                        disabled:pointer-events-none
                        disabled:opacity-30
                    "
                >
                    <ChevronLeft className="h-3.5 w-3.5" />
                </button>

                {/* Pages */}
                <div className="flex items-center gap-1">
                    {pages.map((item, index) => {
                        if (item === "dots") {
                            return (
                                <span
                                    key={`dots-${index}`}
                                    className="
                                        flex h-8 w-8
                                        items-center justify-center
                                        text-zinc-800
                                    "
                                >
                                    <MoreHorizontal className="h-3.5 w-3.5" />
                                </span>
                            );
                        }

                        const active = item === page;

                        return (
                            <button
                                key={item}
                                type="button"
                                onClick={() =>
                                    onPageChange(item)
                                }
                                aria-current={
                                    active
                                        ? "page"
                                        : undefined
                                }
                                className={`
                                    flex h-8 min-w-8
                                    items-center
                                    justify-center
                                    rounded-lg
                                    border
                                    px-2
                                    text-[10px]
                                    transition-colors
                                    ${
                                        active
                                            ? "border-zinc-700 bg-zinc-800 text-zinc-200"
                                            : "border-zinc-900 bg-black text-zinc-600 hover:border-zinc-800 hover:text-zinc-300"
                                    }
                                `}
                            >
                                {item}
                            </button>
                        );
                    })}
                </div>

                {/* Next */}
                <button
                    type="button"
                    disabled={page === totalPages}
                    onClick={() =>
                        onPageChange(page + 1)
                    }
                    aria-label="Next page"
                    className="
                        flex h-8 w-8
                        items-center justify-center
                        rounded-lg
                        border border-zinc-900
                        bg-black
                        text-zinc-600
                        transition-colors
                        hover:border-zinc-800
                        hover:text-zinc-300
                        disabled:pointer-events-none
                        disabled:opacity-30
                    "
                >
                    <ChevronRight className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    );
}

/* ========================================================================== */
/* Page Number Generator                                                      */
/* ========================================================================== */

function getPageNumbers(
    currentPage: number,
    totalPages: number,
): (number | "dots")[] {
    if (totalPages <= 7) {
        return Array.from(
            { length: totalPages },
            (_, index) => index + 1,
        );
    }

    const pages: (number | "dots")[] = [];

    pages.push(1);

    if (currentPage > 4) {
        pages.push("dots");
    }

    const start = Math.max(2, currentPage - 1);
    const end = Math.min(
        totalPages - 1,
        currentPage + 1,
    );

    for (let page = start; page <= end; page++) {
        pages.push(page);
    }

    if (currentPage < totalPages - 3) {
        pages.push("dots");
    }

    pages.push(totalPages);

    return pages;
}