"use client";

import {
    Check,
    ChevronDown,
    Pencil,
    Plus,
    Trash2,
    X,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useOrganizationStore } from "../../../stores/organization.store";
import { useProjectStore } from "../../../stores/project.store";
import { useToast } from "../../providers/ToastProvider";

type ModalMode = "create" | "edit" | "delete" | null;

export function ProjectSwitcher() {
    const [open, setOpen] = useState(false);

    const [modalMode, setModalMode] =
        useState<ModalMode>(null);

    const [projectName, setProjectName] =
        useState("");

    const [projectDescription, setProjectDescription] =
        useState("");

    const [projectToDelete, setProjectToDelete] =
        useState<string | null>(null);

    /*
     * Organization
     */
    const selectedOrganization =
        useOrganizationStore(
            (state) => state.selectedOrganization,
        );

    /*
     * Projects
     */
    const projects = useProjectStore(
        (state) => state.projects,
    );

    const selectedProject =
        useProjectStore(
            (state) => state.selectedProject,
        );

    const isLoading = useProjectStore(
        (state) => state.isLoading,
    );

    const isCreating = useProjectStore(
        (state) => state.isCreating,
    );

    const isUpdating = useProjectStore(
        (state) => state.isUpdating,
    );

    const isDeleting = useProjectStore(
        (state) => state.isDeleting,
    );

    const createProject =
        useProjectStore(
            (state) => state.createProject,
        );

    const updateProject =
        useProjectStore(
            (state) => state.updateProject,
        );

    const deleteProject =
        useProjectStore(
            (state) => state.deleteProject,
        );

    const selectProject =
        useProjectStore(
            (state) => state.selectProject,
        );

    const {
        success,
        error: showError,
    } = useToast();

    /*
     * Close dropdown when
     * organization changes.
     */
    useEffect(() => {
        setOpen(false);
    }, [selectedOrganization?.id]);

    const getInitials = (name: string) => {
        return (
            name
                .trim()
                .split(/\s+/)
                .map((part) => part[0])
                .join("")
                .slice(0, 2)
                .toUpperCase() || "P"
        );
    };

    /*
     * Select project.
     */
    const handleSelect = (
        project: (typeof projects)[number],
    ) => {
        selectProject(project);
        setOpen(false);
    };

    /*
     * Open create modal.
     */
    const handleCreateClick = () => {
        if (!selectedOrganization?.id) {
            showError(
                "Organization required",
                "Please select an organization first.",
            );
            return;
        }

        setOpen(false);

        setProjectName("");
        setProjectDescription("");

        setModalMode("create");
    };

    /*
     * Open edit modal.
     */
    const handleEditClick = (
        event: React.MouseEvent,
        project: (typeof projects)[number],
    ) => {
        event.stopPropagation();

        setOpen(false);

        setProjectName(project.name);
        setProjectDescription(
            project.description ?? "",
        );

        setModalMode("edit");
    };

    /*
     * Open delete confirmation.
     */
    const handleDeleteClick = (
        event: React.MouseEvent,
        projectId: string,
    ) => {
        event.stopPropagation();

        setOpen(false);

        setProjectToDelete(projectId);
        setModalMode("delete");
    };

    /*
     * Close modal.
     */
    const handleCloseModal = () => {
        if (
            isCreating ||
            isUpdating ||
            isDeleting
        ) {
            return;
        }

        setModalMode(null);
        setProjectName("");
        setProjectDescription("");
        setProjectToDelete(null);
    };

    /*
     * Create or update project.
     */
    const handleSubmit = async (
        event: React.FormEvent<HTMLFormElement>,
    ) => {
        event.preventDefault();

        const name = projectName.trim();
        const description =
            projectDescription.trim();

        if (!name) {
            showError(
                "Project name required",
                "Please enter a project name.",
            );
            return;
        }

        /*
         * CREATE
         */
        if (modalMode === "create") {
            if (!selectedOrganization?.id) {
                showError(
                    "Organization required",
                    "Please select an organization first.",
                );
                return;
            }

            const project =
                await createProject(
                    selectedOrganization.id,
                    {
                        name,
                        ...(description
                            ? { description }
                            : {}),
                    },
                );

            if (!project) {
                showError(
                    "Unable to create project",
                    "Please check the details and try again.",
                );
                return;
            }

            setModalMode(null);
            setProjectName("");
            setProjectDescription("");

            success(
                "Project created",
                `${project.name} is now selected.`,
            );

            return;
        }

        /*
         * UPDATE
         */
        if (modalMode === "edit") {
            if (!selectedProject?.id) {
                showError(
                    "Project not found",
                    "Please select a project and try again.",
                );
                return;
            }

            const project =
                await updateProject(
                    selectedProject.id,
                    {
                        name,
                        description,
                    },
                );

            if (!project) {
                showError(
                    "Unable to update project",
                    "Please check the details and try again.",
                );
                return;
            }

            setModalMode(null);
            setProjectName("");
            setProjectDescription("");

            success(
                "Project updated",
                `${project.name} has been updated successfully.`,
            );
        }
    };

    /*
     * Delete project.
     */
    const handleConfirmDelete =
        async () => {
            if (!projectToDelete) {
                return;
            }

            const project =
                projects.find(
                    (item) =>
                        item.id ===
                        projectToDelete,
                );

            const projectName =
                project?.name ?? "Project";

            const deleted =
                await deleteProject(
                    projectToDelete,
                );

            if (!deleted) {
                showError(
                    "Unable to delete project",
                    "Please try again.",
                );
                return;
            }

            setModalMode(null);
            setProjectToDelete(null);

            success(
                "Project deleted",
                `${projectName} has been deleted.`,
            );
        };

    const hasOrganization =
        Boolean(selectedOrganization?.id);

    const buttonLabel = !hasOrganization
        ? "Select organization"
        : isLoading
          ? "Loading..."
          : selectedProject?.name ??
            "Select project";

    const projectInitials =
        selectedProject
            ? getInitials(
                  selectedProject.name,
              )
            : "P";

    const editingProject =
        modalMode === "edit"
            ? selectedProject
            : null;

    const deletingProject =
        modalMode === "delete"
            ? projects.find(
                  (project) =>
                      project.id ===
                      projectToDelete,
              )
            : null;

    return (
        <>
            {/* Project Switcher */}
            <div className="relative">
                <button
                    type="button"
                    onClick={() =>
                        setOpen(
                            (current) =>
                                !current,
                        )
                    }
                    aria-label="Select project"
                    aria-expanded={open}
                    disabled={
                        !hasOrganization ||
                        isLoading
                    }
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
                        {projectInitials}
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
                        {buttonLabel}
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
                            overflow-hidden
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
                                Projects
                            </p>

                            {selectedOrganization && (
                                <p
                                    className="
                                        mt-1
                                        truncate
                                        text-[9px]
                                        text-zinc-700
                                    "
                                >
                                    {
                                        selectedOrganization.name
                                    }
                                </p>
                            )}
                        </div>

                        {/* Project List */}
                        {isLoading ? (
                            <div
                                className="
                                    flex
                                    items-center
                                    justify-center
                                    gap-2
                                    px-3 py-8
                                "
                            >
                                <span
                                    className="
                                        h-3.5 w-3.5
                                        animate-spin
                                        rounded-full
                                        border-2
                                        border-zinc-700
                                        border-t-zinc-300
                                    "
                                />

                                <span
                                    className="
                                        text-xs
                                        text-zinc-600
                                    "
                                >
                                    Loading projects...
                                </span>
                            </div>
                        ) : projects.length > 0 ? (
                            <div
                                className="
                                    max-h-80
                                    overflow-y-auto
                                    p-2
                                "
                            >
                                {projects.map(
                                    (project) => {
                                        const isSelected =
                                            selectedProject?.id ===
                                            project.id;

                                        return (
                                            <div
                                                key={
                                                    project.id
                                                }
                                                className={`
                                                    group
                                                    flex w-full
                                                    items-center
                                                    gap-3
                                                    rounded-lg
                                                    px-2.5 py-2.5
                                                    transition-colors
                                                    ${
                                                        isSelected
                                                            ? "bg-zinc-900"
                                                            : "hover:bg-zinc-900"
                                                    }
                                                `}
                                            >
                                                {/* Select Project */}
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        handleSelect(
                                                            project,
                                                        )
                                                    }
                                                    className="
                                                        flex
                                                        min-w-0
                                                        flex-1
                                                        items-center
                                                        gap-3
                                                        text-left
                                                    "
                                                >
                                                    {/* Project Icon */}
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
                                                            project.name,
                                                        )}
                                                    </span>

                                                    {/* Project Info */}
                                                    <span
                                                        className="
                                                            min-w-0
                                                            flex-1
                                                        "
                                                    >
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
                                                                project.name
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
                                                                project.slug
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

                                                {/* Edit */}
                                                <button
                                                    type="button"
                                                    onClick={(
                                                        event,
                                                    ) =>
                                                        handleEditClick(
                                                            event,
                                                            project,
                                                        )
                                                    }
                                                    aria-label={`Edit ${project.name}`}
                                                    className="
                                                        flex
                                                        h-7 w-7
                                                        shrink-0
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
                                                    ) =>
                                                        handleDeleteClick(
                                                            event,
                                                            project.id,
                                                        )
                                                    }
                                                    aria-label={`Delete ${project.name}`}
                                                    className="
                                                        flex
                                                        h-7 w-7
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-md
                                                        text-zinc-700
                                                        opacity-0
                                                        transition-all
                                                        hover:bg-zinc-800
                                                        hover:text-red-400
                                                        group-hover:opacity-100
                                                        focus:opacity-100
                                                    "
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        );
                                    },
                                )}
                            </div>
                        ) : (
                            /* Empty State */
                            <div
                                className="
                                    px-3 py-6
                                    text-center
                                "
                            >
                                <p
                                    className="
                                        text-xs
                                        text-zinc-500
                                    "
                                >
                                    No projects yet
                                </p>

                                <p
                                    className="
                                        mt-1
                                        text-[9px]
                                        leading-4
                                        text-zinc-700
                                    "
                                >
                                    Create a project
                                    to get started.
                                </p>
                            </div>
                        )}

                        {/* Create Project */}
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
                                disabled={
                                    !selectedOrganization?.id
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
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                "
                            >
                                <Plus className="h-3.5 w-3.5" />

                                Create project
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Create / Edit Modal */}
            {(modalMode === "create" ||
                modalMode === "edit") && (
                <div
                    className="
                        fixed inset-0
                        z-[100]
                        flex items-start
                        justify-center
                        bg-black/70
                        px-4 pt-10
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
                        {/* Header */}
                        <div
                            className="
                                flex items-start
                                justify-between
                                border-b
                                border-zinc-900
                                px-6 py-5
                            "
                        >
                            <div>
                                <h2
                                    className="
                                        text-sm
                                        font-semibold
                                        text-zinc-100
                                    "
                                >
                                    {modalMode ===
                                    "create"
                                        ? "Create project"
                                        : "Edit project"}
                                </h2>

                                <p
                                    className="
                                        mt-1
                                        text-xs
                                        leading-5
                                        text-zinc-600
                                    "
                                >
                                    {modalMode ===
                                    "create"
                                        ? "Create a new project inside "
                                        : "Update project details for "}
                                    <span className="text-zinc-400">
                                        {selectedOrganization?.name}
                                    </span>
                                    .
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={
                                    handleCloseModal
                                }
                                disabled={
                                    isCreating ||
                                    isUpdating
                                }
                                aria-label="Close"
                                className="
                                    flex h-7 w-7
                                    items-center
                                    justify-center
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

                        {/* Form */}
                        <form
                            onSubmit={
                                handleSubmit
                            }
                        >
                            <div className="space-y-5 px-6 py-6">
                                {/* Name */}
                                <div>
                                    <label
                                        htmlFor="project-name"
                                        className="
                                            block
                                            text-xs
                                            font-medium
                                            text-zinc-400
                                        "
                                    >
                                        Project name
                                    </label>

                                    <input
                                        id="project-name"
                                        type="text"
                                        value={
                                            projectName
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setProjectName(
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="e.g. Production API"
                                        autoFocus
                                        disabled={
                                            isCreating ||
                                            isUpdating
                                        }
                                        maxLength={100}
                                        className="
                                            mt-2
                                            h-11 w-full
                                            rounded-xl
                                            border
                                            border-zinc-800
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

                                {/* Description */}
                                <div>
                                    <label
                                        htmlFor="project-description"
                                        className="
                                            block
                                            text-xs
                                            font-medium
                                            text-zinc-400
                                        "
                                    >
                                        Description{" "}
                                        <span className="text-zinc-700">
                                            (optional)
                                        </span>
                                    </label>

                                    <textarea
                                        id="project-description"
                                        value={
                                            projectDescription
                                        }
                                        onChange={(
                                            event,
                                        ) =>
                                            setProjectDescription(
                                                event.target
                                                    .value,
                                            )
                                        }
                                        placeholder="What is this project for?"
                                        disabled={
                                            isCreating ||
                                            isUpdating
                                        }
                                        maxLength={500}
                                        rows={3}
                                        className="
                                            mt-2
                                            w-full
                                            resize-none
                                            rounded-xl
                                            border
                                            border-zinc-800
                                            bg-black
                                            px-3.5 py-3
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
                            </div>

                            {/* Footer */}
                            <div
                                className="
                                    flex items-center
                                    justify-end gap-2
                                    border-t
                                    border-zinc-900
                                    px-6 py-4
                                "
                            >
                                <button
                                    type="button"
                                    onClick={
                                        handleCloseModal
                                    }
                                    disabled={
                                        isCreating ||
                                        isUpdating
                                    }
                                    className="
                                        rounded-lg
                                        px-4 py-2
                                        text-xs
                                        font-medium
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
                                        isUpdating ||
                                        !projectName.trim()
                                    }
                                    className="
                                        flex min-w-[90px]
                                        items-center
                                        justify-center
                                        gap-2
                                        rounded-lg
                                        bg-zinc-100
                                        px-4 py-2
                                        text-xs
                                        font-medium
                                        text-zinc-950
                                        transition-colors
                                        hover:bg-white
                                        disabled:cursor-not-allowed
                                        disabled:opacity-50
                                    "
                                >
                                    {isCreating ||
                                    isUpdating ? (
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

                                            {isCreating
                                                ? "Creating..."
                                                : "Updating..."}
                                        </>
                                    ) : modalMode ===
                                    "create" ? (
                                        "Create"
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
            {modalMode === "delete" && (
                <div
                    className="
                        fixed inset-0
                        z-[100]
                        flex items-start
                        justify-center
                        bg-black/70
                        px-4 pt-20
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
                                    flex h-10 w-10
                                    items-center justify-center
                                    rounded-xl
                                    bg-red-500/10
                                    text-red-400
                                "
                            >
                                <Trash2 className="h-4 w-4" />
                            </div>

                            <h2
                                className="
                                    mt-4
                                    text-sm
                                    font-semibold
                                    text-zinc-100
                                "
                            >
                                Delete project?
                            </h2>

                            <p
                                className="
                                    mt-2
                                    text-xs
                                    leading-5
                                    text-zinc-600
                                "
                            >
                                Are you sure you want
                                to delete{" "}
                                <span className="font-medium text-zinc-300">
                                    {
                                        deletingProject?.name
                                    }
                                </span>
                                ? This action cannot
                                be undone.
                            </p>
                        </div>

                        <div
                            className="
                                flex items-center
                                justify-end gap-2
                                border-t
                                border-zinc-900
                                px-6 py-4
                            "
                        >
                            <button
                                type="button"
                                onClick={
                                    handleCloseModal
                                }
                                disabled={isDeleting}
                                className="
                                    rounded-lg
                                    px-4 py-2
                                    text-xs
                                    font-medium
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
                                    handleConfirmDelete
                                }
                                disabled={
                                    isDeleting
                                }
                                className="
                                    flex min-w-[90px]
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-lg
                                    bg-red-500/10
                                    px-4 py-2
                                    text-xs
                                    font-medium
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
