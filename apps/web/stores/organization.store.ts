import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  createOrganization as createOrganizationApi,
  getOrganizations as getOrganizationsApi,
  updateOrganization as updateOrganizationApi,
  deleteOrganization as deleteOrganizationApi,
  type CreateOrganizationPayload,
  type Organization,
  type UpdateOrganizationPayload,
} from "../lib/api/organization.api";

type OrganizationState = {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  hasHydrated: boolean;

  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  error: string | null;

  fetchOrganizations: () => Promise<boolean>;

  createOrganization: (payload: CreateOrganizationPayload) => Promise<boolean>;

  updateOrganization: (
    organizationId: string,
    payload: UpdateOrganizationPayload,
  ) => Promise<boolean>;

  deleteOrganization: (organizationId: string) => Promise<boolean>;

  selectOrganization: (organization: Organization | null) => void;

  setHasHydrated: (hasHydrated: boolean) => void;

  clearError: () => void;

  reset: () => void;
};

export const useOrganizationStore = create<OrganizationState>()(
  persist(
    (set, get) => ({
      organizations: [],
      selectedOrganization: null,
      hasHydrated: false,

      isLoading: false,
      isCreating: false,
      isUpdating: false,
      isDeleting: false,

      error: null,

      fetchOrganizations: async () => {
        set({
          isLoading: true,
          error: null,
        });

        try {
          const response = await getOrganizationsApi();

          const organizations = response.data.organizations;

          const currentSelected = get().selectedOrganization;
          const selectedOrganization =
            currentSelected &&
            organizations.some(
              (organization) => organization.id === currentSelected.id,
            )
              ? (organizations.find(
                  (organization) => organization.id === currentSelected.id,
                ) ?? null)
              : (organizations[0] ?? null);

          set({
            organizations,
            selectedOrganization,
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

      createOrganization: async (payload) => {
        set({
          isCreating: true,
          error: null,
        });

        try {
          const response = await createOrganizationApi(payload);

          const organization = response.data.organization;

          set((state) => ({
            organizations: [...state.organizations, organization],
            selectedOrganization: organization,
            isCreating: false,
            error: null,
          }));

          return true;
        } catch (error) {
          const message = getApiErrorMessage(error);

          set({
            isCreating: false,
            error: message,
          });

          return false;
        }
      },

      updateOrganization: async (organizationId, payload) => {
        set({
          isUpdating: true,
          error: null,
        });

        try {
          const response = await updateOrganizationApi(organizationId, payload);

          const updatedOrganization = response.data.organization;

          set((state) => ({
            organizations: state.organizations.map((organization) =>
              organization.id === organizationId
                ? updatedOrganization
                : organization,
            ),

            selectedOrganization:
              state.selectedOrganization?.id === organizationId
                ? updatedOrganization
                : state.selectedOrganization,

            isUpdating: false,
            error: null,
          }));

          return true;
        } catch (error) {
          const message = getApiErrorMessage(error);

          set({
            isUpdating: false,
            error: message,
          });

          return false;
        }
      },

      deleteOrganization: async (organizationId) => {
        set({
          isDeleting: true,
          error: null,
        });

        try {
          await deleteOrganizationApi(organizationId);

          set((state) => {
            const organizations = state.organizations.filter(
              (organization) => organization.id !== organizationId,
            );

            const wasSelected =
              state.selectedOrganization?.id === organizationId;

            return {
              organizations,

              selectedOrganization: wasSelected
                ? (organizations[0] ?? null)
                : state.selectedOrganization,

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

      selectOrganization: (organization) => {
        set({
          selectedOrganization: organization,
          error: null,
        });
      },

      setHasHydrated: (hasHydrated) => {
        set({ hasHydrated });
      },

      clearError: () => {
        set({
          error: null,
        });
      },

      reset: () => {
        set({
          organizations: [],
          selectedOrganization: null,

          isLoading: false,
          isCreating: false,
          isUpdating: false,
          isDeleting: false,

          error: null,
        });
      },
    }),
    {
      name: "uptrace-organization-store",
      partialize: (state) => ({
        organizations: state.organizations,
        selectedOrganization: state.selectedOrganization,
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
