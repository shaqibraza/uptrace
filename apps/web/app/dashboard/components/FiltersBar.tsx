"use client";

import { useState } from "react";
import {
    Check,
    ChevronDown,
    Filter,
    RotateCcw,
    Search,
    X,
} from "lucide-react";

export type FilterValue = {
    service?: string;
    environment?: string;
    status?: string;
    method?: string;
};

type FiltersBarProps = {
    value?: FilterValue;
    onChange?: (filters: FilterValue) => void;
    showMethod?: boolean;
    showStatus?: boolean;
    showEnvironment?: boolean;
    showService?: boolean;
};

const services = [
    "All services",
    "api-service",
    "web-service",
    "auth-service",
    "worker",
];

const environments = [
    "All environments",
    "production",
    "staging",
    "development",
];

const statuses = [
    "All statuses",
    "OK",
    "Error",
    "Warning",
];

const methods = [
    "All methods",
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
];

export function FiltersBar({
    value = {},
    onChange,
    showMethod = true,
    showStatus = true,
    showEnvironment = true,
    showService = true,
}: FiltersBarProps) {
    const [search, setSearch] = useState("");
    const [openFilter, setOpenFilter] = useState<string | null>(
        null,
    );

    const updateFilter = (
        key: keyof FilterValue,
        nextValue: string,
    ) => {
        const nextFilters = {
            ...value,
            [key]: nextValue,
        };

        onChange?.(nextFilters);
        setOpenFilter(null);
    };

    const clearFilters = () => {
        setSearch("");

        onChange?.({});
    };

    const activeFilterCount = Object.values(value).filter(
        (item) =>
            item &&
            !item.startsWith("All "),
    ).length;

    return (
        <div className="rounded-xl border border-zinc-900 bg-zinc-950">
            <div className="flex flex-col gap-2 p-2 sm:flex-row sm:items-center">

                {/* Search */}
                <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-zinc-900 bg-black px-3">
                    <Search className="h-3.5 w-3.5 shrink-0 text-zinc-700" />

                    <input
                        type="text"
                        value={search}
                        onChange={(event) =>
                            setSearch(event.target.value)
                        }
                        placeholder="Search traces, logs, services..."
                        className="
                            h-9 min-w-0 flex-1
                            bg-transparent
                            text-xs text-zinc-400
                            outline-none
                            placeholder:text-zinc-800
                        "
                    />

                    {search && (
                        <button
                            type="button"
                            onClick={() => setSearch("")}
                            className="text-zinc-700 hover:text-zinc-400"
                            aria-label="Clear search"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    )}
                </div>

                {/* Filter icon */}
                <div className="hidden h-6 w-px bg-zinc-900 sm:block" />

                <div className="flex flex-wrap gap-2">

                    {/* Service */}
                    {showService && (
                        <FilterDropdown
                            label="Service"
                            value={
                                value.service ??
                                "All services"
                            }
                            options={services}
                            open={
                                openFilter ===
                                "service"
                            }
                            onOpen={() =>
                                setOpenFilter(
                                    openFilter ===
                                        "service"
                                        ? null
                                        : "service",
                                )
                            }
                            onSelect={(item) =>
                                updateFilter(
                                    "service",
                                    item,
                                )
                            }
                        />
                    )}

                    {/* Environment */}
                    {showEnvironment && (
                        <FilterDropdown
                            label="Environment"
                            value={
                                value.environment ??
                                "All environments"
                            }
                            options={environments}
                            open={
                                openFilter ===
                                "environment"
                            }
                            onOpen={() =>
                                setOpenFilter(
                                    openFilter ===
                                        "environment"
                                        ? null
                                        : "environment",
                                )
                            }
                            onSelect={(item) =>
                                updateFilter(
                                    "environment",
                                    item,
                                )
                            }
                        />
                    )}

                    {/* Status */}
                    {showStatus && (
                        <FilterDropdown
                            label="Status"
                            value={
                                value.status ??
                                "All statuses"
                            }
                            options={statuses}
                            open={
                                openFilter ===
                                "status"
                            }
                            onOpen={() =>
                                setOpenFilter(
                                    openFilter ===
                                        "status"
                                        ? null
                                        : "status",
                                )
                            }
                            onSelect={(item) =>
                                updateFilter(
                                    "status",
                                    item,
                                )
                            }
                        />
                    )}

                    {/* Method */}
                    {showMethod && (
                        <FilterDropdown
                            label="Method"
                            value={
                                value.method ??
                                "All methods"
                            }
                            options={methods}
                            open={
                                openFilter ===
                                "method"
                            }
                            onOpen={() =>
                                setOpenFilter(
                                    openFilter ===
                                        "method"
                                        ? null
                                        : "method",
                                )
                            }
                            onSelect={(item) =>
                                updateFilter(
                                    "method",
                                    item,
                                )
                            }
                        />
                    )}
                </div>

                {/* Reset */}
                {(activeFilterCount > 0 || search) && (
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="
                            flex h-9
                            items-center
                            justify-center
                            gap-1.5
                            rounded-lg
                            px-2.5
                            text-[10px]
                            text-zinc-700
                            transition-colors
                            hover:bg-zinc-900
                            hover:text-zinc-400
                        "
                    >
                        <RotateCcw className="h-3 w-3" />
                        <span className="hidden sm:inline">
                            Reset
                        </span>
                    </button>
                )}
            </div>

            {/* Active filters */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2 border-t border-zinc-900 px-3 py-2">
                    <Filter className="h-3 w-3 text-zinc-800" />

                    {Object.entries(value).map(
                        ([key, filterValue]) => {
                            if (
                                !filterValue ||
                                filterValue.startsWith(
                                    "All ",
                                )
                            ) {
                                return null;
                            }

                            return (
                                <button
                                    key={key}
                                    type="button"
                                    onClick={() =>
                                        updateFilter(
                                            key as keyof FilterValue,
                                            "",
                                        )
                                    }
                                    className="
                                        flex items-center
                                        gap-1.5
                                        rounded-md
                                        border border-zinc-900
                                        bg-black
                                        px-2
                                        py-1
                                        text-[9px]
                                        text-zinc-500
                                        hover:text-zinc-300
                                    "
                                >
                                    {filterValue}

                                    <X className="h-2.5 w-2.5 text-zinc-700" />
                                </button>
                            );
                        },
                    )}
                </div>
            )}
        </div>
    );
}

/* ========================================================================== */
/* Filter Dropdown                                                            */
/* ========================================================================== */

function FilterDropdown({
    label,
    value,
    options,
    open,
    onOpen,
    onSelect,
}: {
    label: string;
    value: string;
    options: string[];
    open: boolean;
    onOpen: () => void;
    onSelect: (value: string) => void;
}) {
    return (
        <div className="relative">
            <button
                type="button"
                onClick={onOpen}
                aria-expanded={open}
                className={`
                    flex h-9
                    items-center
                    gap-2
                    rounded-lg
                    border
                    px-3
                    text-[10px]
                    transition-colors
                    ${
                        value.startsWith("All ")
                            ? "border-zinc-900 bg-black text-zinc-600"
                            : "border-zinc-800 bg-zinc-900 text-zinc-300"
                    }
                    hover:border-zinc-800
                `}
            >
                <span className="hidden text-zinc-800 sm:inline">
                    {label}:
                </span>

                <span>{value}</span>

                <ChevronDown
                    className={`
                        h-3 w-3 text-zinc-700
                        transition-transform
                        ${open ? "rotate-180" : ""}
                    `}
                />
            </button>

            {open && (
                <div
                    className="
                        absolute right-0 top-11 z-[100]
                        w-48
                        overflow-hidden
                        rounded-xl
                        border border-zinc-800
                        bg-zinc-950
                        p-1
                        shadow-2xl
                    "
                >
                    <div className="px-2.5 py-2">
                        <p className="text-[9px] uppercase tracking-wider text-zinc-800">
                            {label}
                        </p>
                    </div>

                    {options.map((option) => {
                        const selected =
                            option === value;

                        return (
                            <button
                                key={option}
                                type="button"
                                onClick={() =>
                                    onSelect(option)
                                }
                                className={`
                                    flex w-full
                                    items-center
                                    justify-between
                                    rounded-lg
                                    px-2.5 py-2
                                    text-left
                                    text-[10px]
                                    transition-colors
                                    ${
                                        selected
                                            ? "bg-zinc-900 text-zinc-300"
                                            : "text-zinc-600 hover:bg-zinc-900/60 hover:text-zinc-300"
                                    }
                                `}
                            >
                                {option}

                                {selected && (
                                    <Check className="h-3 w-3 text-zinc-500" />
                                )}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}