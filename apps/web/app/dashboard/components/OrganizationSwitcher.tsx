"use client";

import { useEffect, useState } from "react";
import {
    Check,
    ChevronDown,
    Pencil,
    Trash2,
    Plus,
    X,
} from "lucide-react";

import { useOrganizationStore } from "../../../stores/organization.store";
import { useToast } from "../../providers/ToastProvider";

export function OrganizationSwitcher() {
    const [open, setOpen] = useState(false);
    const [createOpen, setCreateOpen] = useState(false);

    const [editOpen, setEditOpen] = useState(false);
    const [editOrganizationId, setEditOrganizationId] =
        useState<string | null>(null);
    const [editOrganizationName, setEditOrganizationName] =
        useState("");

    const [deleteOpen, setDeleteOpen] = useState(false);
    const [deleteOrganizationId, setDeleteOrganizationId] =
        useState<string | null>(null);
    const [deleteOrganizationName, setDeleteOrganizationName] =
        useState("");

    const [organizationName, setOrganizationName] =
        useState("");

    const organizations = useOrganizationStore(
        (state) => state.organizations,
    );

    const selectedOrganization =
        useOrganizationStore(
            (state) => state.selectedOrganization,
        );

    const isLoading = useOrganizationStore(
        (state) => state.isLoading,
    );

    const isCreating = useOrganizationStore(
        (state) => state.isCreating,
    );

    const isUpdating = useOrganizationStore(
        (state) => state.isUpdating,
    );

    const isDeleting = useOrganizationStore(
        (state) => state.isDeleting,
    );

    const fetchOrganizations =
        useOrganizationStore(
            (state) => state.fetchOrganizations,
        );

    const createOrganization =
        useOrganizationStore(
            (state) => state.createOrganization,
        );

    const updateOrganization =
        useOrganizationStore(
            (state) => state.updateOrganization,
        );

    const deleteOrganization =
        useOrganizationStore(
            (state) => state.deleteOrganization,
        );

    const selectOrganization =
        useOrganizationStore(
            (state) => state.selectOrganization,
        );

    const { success, error: showError } =
        useToast();

    useEffect(() => {
        void fetchOrganizations();
    }, [fetchOrganizations]);

    const getInitials = (name: string) => {
        return (
            name
                .trim()
                .split(/\s+/)
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "O"
        );
    };

    const handleSelect = (
        organization: (typeof organizations)[number],
    ) => {
        selectOrganization(organization);
        setOpen(false);
    };

    const handleCreateClick = () => {
        setOpen(false);
        setOrganizationName("");
        setCreateOpen(true);
    };

    const handleCreateOrganization = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const name = organizationName.trim();

        if (!name) {
            showError(
                "Organization name required",
                "Please enter an organization name.",
            );
            return;
        }

        const created =
            await createOrganization({ name });

        if (!created) {
            showError(
                "Unable to create organization",
                "Please check the details and try again.",
            );
            return;
        }

        setCreateOpen(false);
        setOrganizationName("");

        success(
            "Organization created",
            `${name} is now selected.`,
        );
    };

    const handleEditClick = (
        organization: (typeof organizations)[number],
    ) => {
        setEditOrganizationId(organization.id);
        setEditOrganizationName(organization.name);
        setEditOpen(true);
        setOpen(false);
    };

    const handleUpdateOrganization = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        if (!editOrganizationId) {
            return;
        }

        const name = editOrganizationName.trim();

        if (!name) {
            showError(
                "Organization name required",
                "Please enter an organization name.",
            );
            return;
        }

        const updated =
            await updateOrganization(
                editOrganizationId,
                { name },
            );

        if (!updated) {
            showError(
                "Unable to update organization",
                "Please check the details and try again.",
            );
            return;
        }

        setEditOpen(false);
        setEditOrganizationId(null);
        setEditOrganizationName("");

        success(
            "Organization updated",
            `Organization renamed to ${name}.`,
        );
    };

    const handleDeleteClick = (
        organization: (typeof organizations)[number],
    ) => {
        setDeleteOrganizationId(organization.id);
        setDeleteOrganizationName(organization.name);
        setDeleteOpen(true);
        setOpen(false);
    };

    const handleDeleteOrganization = async () => {
        if (!deleteOrganizationId) {
            return;
        }

        const deleted =
            await deleteOrganization(
                deleteOrganizationId,
            );

        if (!deleted) {
            showError(
                "Unable to delete organization",
                "Please try again.",
            );
            return;
        }

        setDeleteOpen(false);
        setDeleteOrganizationId(null);
        setDeleteOrganizationName("");

        success(
            "Organization deleted",
            "The organization has been removed.",
        );
    };

    const initials = selectedOrganization
        ? getInitials(selectedOrganization.name)
        : "O";

    return (
        <>
            {/* Organization Switcher */}
            <div className="relative flex items-center gap-3">
                <div className="relative">
                    <button
                        type="button"
                        onClick={() =>
                            setOpen((current) => !current)
                        }
                        aria-label="Select organization"
                        aria-expanded={open}
                        disabled={isLoading}
                        className="
                            flex items-center gap-2
                            rounded-lg
                            border border-zinc-900
                            bg-zinc-950
                            px-3 py-2
                            transition-colors
                            hover:border-zinc-800
                            disabled:cursor-not-allowed
                            disabled:opacity-60
                        "
                    >
                        <span
                            className="
                                flex h-5 w-5 shrink-0
                                items-center justify-center
                                rounded
                                bg-zinc-800
                                text-[9px]
                                font-semibold
                                text-zinc-400
                            "
                        >
                            {initials}
                        </span>

                        <span
                            className="
                                max-w-[140px]
                                truncate
                                text-xs
                                font-medium
                                text-zinc-400
                            "
                        >
                            {isLoading
                                ? "Loading..."
                                : selectedOrganization?.name ??
                                "Select organization"}
                        </span>

                        <ChevronDown
                            className={`
                                h-3 w-3
                                text-zinc-700
                                transition-transform
                                ${
                                    open
                                        ? "rotate-180"
                                        : ""
                                }
                            `}
                        />
                    </button>

                    {open && (
                        <div
                            className="
                                absolute
                                left-0
                                top-11
                                z-50
                                w-80
                                overflow-visible
                                rounded-xl
                                border
                                border-zinc-800
                                bg-zinc-950
                                shadow-2xl
                                shadow-black/50
                            "
                        >
                            {/* Header */}
                            <div
                                className="
                                    border-b
                                    border-zinc-900
                                    px-3 py-3
                                "
                            >
                                <p
                                    className="
                                        text-[10px]
                                        font-medium
                                        uppercase
                                        tracking-wider
                                        text-zinc-600
                                    "
                                >
                                    Organizations
                                </p>
                            </div>

                            {/* Organizations */}
                            <div className="max-h-80 overflow-y-auto p-2">
                                {organizations.length > 0 ? (
                                    organizations.map(
                                        (organization) => {
                                            const isSelected =
                                                selectedOrganization?.id ===
                                                organization.id;

                                            return (
                                                <div
                                                    key={
                                                        organization.id
                                                    }
                                                    className="
                                                        group
                                                        flex w-full
                                                        items-center
                                                        gap-2
                                                        rounded-lg
                                                        transition-colors
                                                        hover:bg-zinc-900
                                                    "
                                                >
                                                    {/* Select */}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            handleSelect(
                                                                organization,
                                                            )
                                                        }
                                                        className="
                                                            flex
                                                            min-w-0
                                                            flex-1
                                                            items-center
                                                            gap-3
                                                            px-2.5
                                                            py-2.5
                                                            text-left
                                                        "
                                                    >
                                                        <span
                                                            className="
                                                                flex
                                                                h-7 w-7
                                                                shrink-0
                                                                items-center
                                                                justify-center
                                                                rounded-md
                                                                bg-zinc-800
                                                                text-[9px]
                                                                font-semibold
                                                                text-zinc-400
                                                            "
                                                        >
                                                            {getInitials(
                                                                organization.name,
                                                            )}
                                                        </span>

                                                        <span className="min-w-0 flex-1">
                                                            <span
                                                                className="
                                                                    block
                                                                    truncate
                                                                    text-xs
                                                                    font-medium
                                                                    text-zinc-300
                                                                "
                                                            >
                                                                {
                                                                    organization.name
                                                                }
                                                            </span>

                                                            <span
                                                                className="
                                                                    mt-0.5
                                                                    block
                                                                    truncate
                                                                    text-[9px]
                                                                    text-zinc-700
                                                                "
                                                            >
                                                                {
                                                                    organization.slug
                                                                }
                                                            </span>
                                                        </span>

                                                        {isSelected && (
                                                            <Check
                                                                className="
                                                                    h-3.5 w-3.5
                                                                    shrink-0
                                                                    text-zinc-400
                                                                "
                                                            />
                                                        )}
                                                    </button>

                                                    {/* Actions */}
                                                    <div
                                                        className="
                                                            flex
                                                            shrink-0
                                                            items-center
                                                            gap-0.5
                                                            pr-1
                                                        "
                                                    >
                                                        {/* Edit */}
                                                        <button
                                                            type="button"
                                                            onClick={(
                                                                event,
                                                            ) => {
                                                                event.stopPropagation();
                                                                handleEditClick(
                                                                    organization,
                                                                );
                                                            }}
                                                            aria-label={`Edit ${organization.name}`}
                                                            className="
                                                                flex
                                                                h-7 w-7
                                                                items-center
                                                                justify-center
                                                                rounded-md
                                                                text-zinc-700
                                                                opacity-0
                                                                transition-all
                                                                hover:bg-zinc-800
                                                                hover:text-zinc-300
                                                                group-hover:opacity-100
                                                                focus:opacity-100
                                                            "
                                                        >
                                                            <Pencil className="h-3.5 w-3.5" />
                                                        </button>

                                                        {/* Delete */}
                                                        <button
                                                            type="button"
                                                            onClick={(
                                                                event,
                                                            ) => {
                                                                event.stopPropagation();
                                                                handleDeleteClick(
                                                                    organization,
                                                                );
                                                            }}
                                                            aria-label={`Delete ${organization.name}`}
                                                            className="
                                                                flex
                                                                h-7 w-7
                                                                items-center
                                                                justify-center
                                                                rounded-md
                                                                text-zinc-700
                                                                opacity-0
                                                                transition-all
                                                                hover:bg-red-500/10
                                                                hover:text-red-400
                                                                group-hover:opacity-100
                                                                focus:opacity-100
                                                            "
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        },
                                    )
                                ) : (
                                    <div className="px-3 py-6 text-center">
                                        <p className="text-xs text-zinc-500">
                                            No organizations yet
                                        </p>

                                        <p className="mt-1 text-[9px] leading-4 text-zinc-700">
                                            Create an organization
                                            to get started.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Create */}
                            <div
                                className="
                                    border-t
                                    border-zinc-900
                                    p-2
                                "
                            >
                                <button
                                    type="button"
                                    onClick={
                                        handleCreateClick
                                    }
                                    className="
                                        flex w-full
                                        items-center gap-2
                                        rounded-lg
                                        px-2.5 py-2.5
                                        text-left
                                        text-xs
                                        text-zinc-500
                                        transition-colors
                                        hover:bg-zinc-900
                                        hover:text-zinc-300
                                    "
                                >
                                    <Plus className="h-3.5 w-3.5" />
                                    Create organization
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Organization Modal */}
            {createOpen && (
                <div
                    className="
                        fixed inset-0
                        z-[100]
                        flex items-center justify-center
                        bg-black/70
                        px-4 pt-36
                        backdrop-blur-sm
                    "
                >
                    <div
                        className="
                            w-full max-w-md
                            rounded-2xl
                            border border-zinc-800
                            bg-zinc-950
                            shadow-2xl
                            shadow-black/60
                        "
                    >
                        <div
                            className="
                                flex items-start
                                justify-between
                                border-b border-zinc-900
                                px-6 py-5
                            "
                        >
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-100">
                                    Create organization
                                </h2>

                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    Create an organization to
                                    manage your projects.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setCreateOpen(false)
                                }
                                disabled={isCreating}
                                aria-label="Close"
                                className="
                                    flex h-7 w-7
                                    items-center justify-center
                                    rounded-lg
                                    text-zinc-600
                                    transition-colors
                                    hover:bg-zinc-900
                                    hover:text-zinc-300
                                "
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handleCreateOrganization
                            }
                        >
                            <div className="px-6 py-6">
                                <label
                                    htmlFor="organization-name"
                                    className="
                                        block
                                        text-xs
                                        font-medium
                                        text-zinc-400
                                    "
                                >
                                    Organization name
                                </label>

                                <input
                                    id="organization-name"
                                    type="text"
                                    value={
                                        organizationName
                                    }
                                    onChange={(event) =>
                                        setOrganizationName(
                                            event.target.value,
                                        )
                                    }
                                    placeholder="e.g. Acme Inc."
                                    autoFocus
                                    disabled={isCreating}
                                    maxLength={100}
                                    className="
                                        mt-2
                                        h-11 w-full
                                        rounded-xl
                                        border border-zinc-800
                                        bg-black
                                        px-3.5
                                        text-sm
                                        text-zinc-100
                                        outline-none
                                        placeholder:text-zinc-700
                                        transition-colors
                                        focus:border-zinc-600
                                        focus:ring-1
                                        focus:ring-zinc-700
                                    "
                                />
                            </div>

                            <div
                                className="
                                    flex items-center
                                    justify-end gap-2
                                    border-t border-zinc-900
                                    px-6 py-4
                                "
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setCreateOpen(false)
                                    }
                                    disabled={isCreating}
                                    className="
                                        rounded-lg
                                        px-4 py-2
                                        text-xs font-medium
                                        text-zinc-500
                                        transition-colors
                                        hover:bg-zinc-900
                                        hover:text-zinc-300
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        isCreating ||
                                        !organizationName.trim()
                                    }
                                    className="
                                        flex min-w-[80px]
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-lg
                                        bg-zinc-100
                                        px-4 py-2
                                        text-xs font-medium
                                        text-zinc-950
                                        transition-colors
                                        hover:bg-white
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    {isCreating ? (
                                        <>
                                            <span
                                                className="
                                                    h-3.5 w-3.5
                                                    animate-spin
                                                    rounded-full
                                                    border-2
                                                    border-zinc-400
                                                    border-t-zinc-950
                                                "
                                            />
                                            Creating...
                                        </>
                                    ) : (
                                        "Create"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Organization Modal */}
            {editOpen && (
                <div
                    className="
                        fixed inset-0
                        z-[100]
                        flex items-center justify-center
                        bg-black/70
                        px-4 pt-36
                        backdrop-blur-sm
                    "
                >
                    <div
                        className="
                            w-full max-w-md
                            rounded-2xl
                            border border-zinc-800
                            bg-zinc-950
                            shadow-2xl
                            shadow-black/60
                        "
                    >
                        <div
                            className="
                                flex items-start
                                justify-between
                                border-b border-zinc-900
                                px-6 py-5
                            "
                        >
                            <div>
                                <h2 className="text-sm font-semibold text-zinc-100">
                                    Edit organization
                                </h2>

                                <p className="mt-1 text-xs leading-5 text-zinc-600">
                                    Update your organization
                                    name.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setEditOpen(false)
                                }
                                disabled={isUpdating}
                                aria-label="Close"
                                className="
                                    flex h-7 w-7
                                    items-center justify-center
                                    rounded-lg
                                    text-zinc-600
                                    transition-colors
                                    hover:bg-zinc-900
                                    hover:text-zinc-300
                                "
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        <form
                            onSubmit={
                                handleUpdateOrganization
                            }
                        >
                            <div className="px-6 py-6">
                                <label
                                    htmlFor="edit-organization-name"
                                    className="
                                        block
                                        text-xs
                                        font-medium
                                        text-zinc-400
                                    "
                                >
                                    Organization name
                                </label>

                                <input
                                    id="edit-organization-name"
                                    type="text"
                                    value={
                                        editOrganizationName
                                    }
                                    onChange={(event) =>
                                        setEditOrganizationName(
                                            event.target.value,
                                        )
                                    }
                                    autoFocus
                                    disabled={isUpdating}
                                    maxLength={100}
                                    className="
                                        mt-2
                                        h-11 w-full
                                        rounded-xl
                                        border border-zinc-800
                                        bg-black
                                        px-3.5
                                        text-sm
                                        text-zinc-100
                                        outline-none
                                        transition-colors
                                        focus:border-zinc-600
                                        focus:ring-1
                                        focus:ring-zinc-700
                                    "
                                />
                            </div>

                            <div
                                className="
                                    flex items-center
                                    justify-end gap-2
                                    border-t border-zinc-900
                                    px-6 py-4
                                "
                            >
                                <button
                                    type="button"
                                    onClick={() =>
                                        setEditOpen(false)
                                    }
                                    disabled={isUpdating}
                                    className="
                                        rounded-lg
                                        px-4 py-2
                                        text-xs font-medium
                                        text-zinc-500
                                        transition-colors
                                        hover:bg-zinc-900
                                        hover:text-zinc-300
                                    "
                                >
                                    Cancel
                                </button>

                                <button
                                    type="submit"
                                    disabled={
                                        isUpdating ||
                                        !editOrganizationName.trim()
                                    }
                                    className="
                                        flex min-w-[100px]
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-lg
                                        bg-zinc-100
                                        px-4 py-2
                                        text-xs font-medium
                                        text-zinc-950
                                        transition-colors
                                        hover:bg-white
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    {isUpdating ? (
                                        <>
                                            <span
                                                className="
                                                    h-3.5 w-3.5
                                                    animate-spin
                                                    rounded-full
                                                    border-2
                                                    border-zinc-400
                                                    border-t-zinc-950
                                                "
                                            />
                                            Saving...
                                        </>
                                    ) : (
                                        "Save changes"
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {deleteOpen && (
                <div
                    className="
                        fixed inset-0
                        z-[100]
                        flex items-center justify-center
                        bg-black/70
                        px-4 pt-36
                        backdrop-blur-sm
                    "
                >
                    <div
                        className="
                            w-full max-w-md
                            rounded-2xl
                            border border-zinc-800
                            bg-zinc-950
                            shadow-2xl
                            shadow-black/60
                        "
                    >
                        <div className="px-6 py-6">
                            <div
                                className="
                                    flex h-9 w-9
                                    items-center justify-center
                                    rounded-lg
                                    bg-red-500/10
                                "
                            >
                                <Trash2 className="h-4 w-4 text-red-400" />
                            </div>

                            <h2 className="mt-4 text-sm font-semibold text-zinc-100">
                                Delete organization?
                            </h2>

                            <p className="mt-2 text-xs leading-5 text-zinc-500">
                                Are you sure you want to delete{" "}
                                <span className="font-medium text-zinc-300">
                                    "{deleteOrganizationName}"
                                </span>
                                ? This action cannot be undone.
                            </p>
                        </div>

                        <div
                            className="
                                flex items-center
                                justify-end gap-2
                                border-t border-zinc-900
                                px-6 py-4
                            "
                        >
                            <button
                                type="button"
                                onClick={() =>
                                    setDeleteOpen(false)
                                }
                                disabled={isDeleting}
                                className="
                                    rounded-lg
                                    px-4 py-2
                                    text-xs font-medium
                                    text-zinc-500
                                    transition-colors
                                    hover:bg-zinc-900
                                    hover:text-zinc-300
                                "
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                onClick={
                                    handleDeleteOrganization
                                }
                                disabled={isDeleting}
                                className="
                                    flex min-w-[80px]
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    bg-red-500/10
                                    px-4 py-2
                                    text-xs font-medium
                                    text-red-400
                                    transition-colors
                                    hover:bg-red-500/20
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                {isDeleting ? (
                                    <>
                                        <span
                                            className="
                                                h-3.5 w-3.5
                                                animate-spin
                                                rounded-full
                                                border-2
                                                border-red-400/40
                                                border-t-red-400
                                            "
                                        />
                                        Deleting...
                                    </>
                                ) : (
                                    "Delete"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}