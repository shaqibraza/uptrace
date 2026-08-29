"use client";

import { useEffect, useRef, useState } from "react";
import {
    CalendarDays,
    Check,
    ChevronDown,
} from "lucide-react";

export type TimeRange =
    | "15m"
    | "1h"
    | "6h"
    | "24h"
    | "7d"
    | "30d"
    | "custom";

type DateRangePickerProps = {
    value?: TimeRange;
    onChange?: (range: TimeRange) => void;
};

const presets: {
    label: string;
    value: TimeRange;
}[] = [
    {
        label: "Last 15 minutes",
        value: "15m",
    },
    {
        label: "Last 1 hour",
        value: "1h",
    },
    {
        label: "Last 6 hours",
        value: "6h",
    },
    {
        label: "Last 24 hours",
        value: "24h",
    },
    {
        label: "Last 7 days",
        value: "7d",
    },
    {
        label: "Last 30 days",
        value: "30d",
    },
];

export function DateRangePicker({
    value = "24h",
    onChange,
}: DateRangePickerProps) {
    const [open, setOpen] = useState(false);
    const [selected, setSelected] =
        useState<TimeRange>(value);

    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (
            event: MouseEvent,
        ) => {
            if (
                containerRef.current &&
                !containerRef.current.contains(
                    event.target as Node,
                )
            ) {
                setOpen(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside,
        );

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside,
            );
        };
    }, []);

    const currentLabel =
        presets.find(
            (preset) => preset.value === selected,
        )?.label ?? "Custom range";

    const selectRange = (range: TimeRange) => {
        setSelected(range);
        onChange?.(range);

        if (range !== "custom") {
            setOpen(false);
        }
    };

    return (
        <div
            ref={containerRef}
            className="relative"
        >
            {/* Trigger */}
            <button
                type="button"
                onClick={() => setOpen(!open)}
                aria-expanded={open}
                className="
                    flex h-9 items-center gap-2
                    rounded-lg
                    border border-zinc-900
                    bg-zinc-950
                    px-3
                    text-xs text-zinc-400
                    transition-colors
                    hover:border-zinc-800
                    hover:text-zinc-300
                "
            >
                <CalendarDays className="h-3.5 w-3.5 text-zinc-600" />

                <span className="hidden sm:inline">
                    {currentLabel}
                </span>

                <span className="sm:hidden">
                    {selected === "15m"
                        ? "15m"
                        : selected === "1h"
                          ? "1h"
                          : selected === "6h"
                            ? "6h"
                            : selected === "24h"
                              ? "24h"
                              : selected === "7d"
                                ? "7d"
                                : selected === "30d"
                                  ? "30d"
                                  : "Custom"}
                </span>

                <ChevronDown
                    className={`
                        h-3 w-3 text-zinc-700
                        transition-transform
                        ${open ? "rotate-180" : ""}
                    `}
                />
            </button>

            {/* Dropdown */}
            {open && (
                <div
                    className="
                        absolute right-0 top-11 z-[100]
                        w-[280px]
                        overflow-hidden
                        rounded-xl
                        border border-zinc-800
                        bg-zinc-950
                        shadow-2xl shadow-black/50
                    "
                >
                    {/* Header */}
                    <div className="border-b border-zinc-900 px-4 py-3">
                        <p className="text-xs font-medium text-zinc-300">
                            Time range
                        </p>

                        <p className="mt-1 text-[9px] text-zinc-700">
                            Select the period you want to inspect.
                        </p>
                    </div>

                    {/* Presets */}
                    <div className="p-2">
                        {presets.map((preset) => {
                            const active =
                                selected ===
                                preset.value;

                            return (
                                <button
                                    key={preset.value}
                                    type="button"
                                    onClick={() =>
                                        selectRange(
                                            preset.value,
                                        )
                                    }
                                    className={`
                                        flex w-full
                                        items-center
                                        justify-between
                                        rounded-lg
                                        px-3 py-2.5
                                        text-left
                                        text-xs
                                        transition-colors
                                        ${
                                            active
                                                ? "bg-zinc-900 text-zinc-200"
                                                : "text-zinc-600 hover:bg-zinc-900/60 hover:text-zinc-300"
                                        }
                                    `}
                                >
                                    <span>
                                        {preset.label}
                                    </span>

                                    {active && (
                                        <Check className="h-3.5 w-3.5 text-zinc-400" />
                                    )}
                                </button>
                            );
                        })}
                    </div>

                    {/* Custom */}
                    <div className="border-t border-zinc-900 p-2">
                        <button
                            type="button"
                            onClick={() =>
                                selectRange("custom")
                            }
                            className={`
                                flex w-full
                                items-center
                                justify-between
                                rounded-lg
                                px-3 py-2.5
                                text-left text-xs
                                transition-colors
                                ${
                                    selected === "custom"
                                        ? "bg-zinc-900 text-zinc-200"
                                        : "text-zinc-600 hover:bg-zinc-900/60 hover:text-zinc-300"
                                }
                            `}
                        >
                            <span>
                                Custom range
                            </span>

                            {selected === "custom" && (
                                <Check className="h-3.5 w-3.5 text-zinc-400" />
                            )}
                        </button>
                    </div>

                    {/* Custom range UI */}
                    {selected === "custom" && (
                        <CustomRange
                            onApply={() =>
                                setOpen(false)
                            }
                        />
                    )}
                </div>
            )}
        </div>
    );
}

/* ========================================================================== */
/* Custom Range                                                               */
/* ========================================================================== */

function CustomRange({
    onApply,
}: {
    onApply: () => void;
}) {
    return (
        <div className="border-t border-zinc-900 p-4">
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label
                        htmlFor="date-from"
                        className="mb-1.5 block text-[9px] uppercase tracking-wider text-zinc-700"
                    >
                        From
                    </label>

                    <input
                        id="date-from"
                        type="datetime-local"
                        className="
                            h-9 w-full
                            rounded-lg
                            border border-zinc-900
                            bg-black
                            px-2
                            text-[10px]
                            text-zinc-500
                            outline-none
                            focus:border-zinc-700
                        "
                    />
                </div>

                <div>
                    <label
                        htmlFor="date-to"
                        className="mb-1.5 block text-[9px] uppercase tracking-wider text-zinc-700"
                    >
                        To
                    </label>

                    <input
                        id="date-to"
                        type="datetime-local"
                        className="
                            h-9 w-full
                            rounded-lg
                            border border-zinc-900
                            bg-black
                            px-2
                            text-[10px]
                            text-zinc-500
                            outline-none
                            focus:border-zinc-700
                        "
                    />
                </div>
            </div>

            <button
                type="button"
                onClick={onApply}
                className="
                    mt-3 h-9 w-full
                    rounded-lg
                    bg-zinc-100
                    text-xs
                    font-medium
                    text-black
                    transition-colors
                    hover:bg-white
                "
            >
                Apply range
            </button>
        </div>
    );
}