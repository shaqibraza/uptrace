import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  createProject as createProjectApi,
  getProjects as getProjectsApi,
  getProject as getProjectApi,
  updateProject as updateProjectApi,
  deleteProject as deleteProjectApi,
  type Project,
  type CreateProjectPayload,
  type UpdateProjectPayload,
} from "../lib/api/project.api";

type ProjectState = {
  projects: Project[];
  selectedProject: Project | null;
  hasHydrated: boolean;

  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  error: string | null;

  fetchProjects: (organizationId: string) => Promise<boolean>;

  createProject: (
    organizationId: string,
    payload: CreateProjectPayload,
  ) => Promise<Project | null>;

  getProject: (projectId: string) => Promise<Project | null>;

  updateProject: (
    projectId: string,
    payload: UpdateProjectPayload,
  ) => Promise<Project | null>;

  deleteProject: (projectId: string) => Promise<boolean>;

  selectProject: (project: Project | null) => void;

  setHasHydrated: (hasHydrated: boolean) => void;

  clearProjects: () => void;

  clearError: () => void;
};

export const useProjectStore = create<ProjectState>()(
  persist(
    (set, get) => ({
      projects: [],
      selectedProject: null,
      hasHydrated: false,

      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,

      error: null,

      // Fetch all projects belonging to an organization.
      fetchProjects: async (organizationId) => {
        if (!organizationId) {
          set({
            projects: [],
            selectedProject: null,
            error: null,
          });

          return false;
        }

        set({
          isLoading: true,
          error: null,
        });

        try {
          const response = await getProjectsApi(organizationId);

          const projects = response.data.projects;

          const currentSelected = get().selectedProject;

          // Preserve the currently selected project if it still belongs to the fetched list.
          const selectedProject =
            currentSelected &&
            projects.some((project) => project.id === currentSelected.id)
              ? (projects.find(
                  (project) => project.id === currentSelected.id,
                ) ?? null)
              : (projects[0] ?? null);

          set({
            projects,
            selectedProject,
            isLoading: false,
            error: null,
          });

          return true;
        } catch (error) {
          const message = getApiErrorMessage(error);

          set({
            isLoading: false,
            error: message,
          });

          return false;
        }
      },

      // Create a new project inside an organization.
      createProject: async (organizationId, payload) => {
        set({
          isCreating: true,
          error: null,
        });

        try {
          const response = await createProjectApi(organizationId, payload);

          const project = response.data.project;

          set((state) => ({
            projects: [...state.projects, project],
            selectedProject: project,
            isCreating: false,
            error: null,
          }));

          return project;
        } catch (error) {
          const message = getApiErrorMessage(error);

          set({
            isCreating: false,
            error: message,
          });

          return null;
        }
      },

      // Get a single project by ID.
      getProject: async (projectId) => {
        set({
          error: null,
        });

        try {
          const response = await getProjectApi(projectId);

          const project = response.data.project;

          set((state) => ({
            projects: state.projects.some((item) => item.id === project.id)
              ? state.projects.map((item) =>
                  item.id === project.id ? project : item,
                )
              : [...state.projects, project],

            selectedProject:
              state.selectedProject?.id === project.id
                ? project
                : state.selectedProject,

            error: null,
          }));

          return project;
        } catch (error) {
          const message = getApiErrorMessage(error);

          set({
            error: message,
          });

          return null;
        }
      },

      // Update an existing project.
      updateProject: async (projectId, payload) => {
        set({
          isUpdating: true,
          error: null,
        });

        try {
          const response = await updateProjectApi(projectId, payload);

          const updatedProject = response.data.project;

          set((state) => ({
            projects: state.projects.map((project) =>
              project.id === projectId ? updatedProject : project,
            ),

            selectedProject:
              state.selectedProject?.id === projectId
                ? updatedProject
                : state.selectedProject,

            isUpdating: false,
            error: null,
          }));

          return updatedProject;
        } catch (error) {
          const message = getApiErrorMessage(error);

          set({
            isUpdating: false,
            error: message,
          });

          return null;
        }
      },

      // Delete a project. Backend returns 204 No Content.
      deleteProject: async (projectId) => {
        set({
          isDeleting: true,
          error: null,
        });

        try {
          await deleteProjectApi(projectId);

          set((state) => {
            const remainingProjects = state.projects.filter(
              (project) => project.id !== projectId,
            );

            const wasSelected = state.selectedProject?.id === projectId;

            return {
              projects: remainingProjects,

              // If the deleted project was selected, automatically select the first remaining project.
              selectedProject: wasSelected
                ? (remainingProjects[0] ?? null)
                : state.selectedProject,

              isDeleting: false,
              error: null,
            };
          });

          return true;
        } catch (error) {
          const message = getApiErrorMessage(error);

          set({
            isDeleting: false,
            error: message,
          });

          return false;
        }
      },

      // Select a project manually.
      selectProject: (project) => {
        set({
          selectedProject: project,
        });
      },

      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },

      // Clear all projects. Useful when switching organizations.
      clearProjects: () => {
        set({
          projects: [],
          selectedProject: null,
          error: null,
        });
      },

      // Clear store error.
      clearError: () => {
        set({
          error: null,
        });
      },
    }),
    {
      name: "uptrace-project-store",
      partialize: (state) => ({
        projects: state.projects,
        selectedProject: state.selectedProject,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

function getApiErrorMessage(error: unknown): string {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (
      error as {
        response?: {
          data?: {
            error?: {
              message?: string;
            };
          };
        };
      }
    ).response;

    const message = response?.data?.error?.message;

    if (typeof message === "string") {
      return message;
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}
