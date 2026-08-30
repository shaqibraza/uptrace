import { api } from "./axios";

export type OrganizationRole =
    | "OWNER"
    | "ADMIN"
    | "MEMBER";

export type Organization = {
    id: string;
    name: string;
    slug: string;
    role: OrganizationRole;
    createdAt: string;
    updatedAt: string;
};

export type CreateOrganizationPayload = {
    name: string;
};

export type CreateOrganizationResponse = {
    success: true;
    data: {
        organization: Organization;
    };
};

export type ListOrganizationsResponse = {
    success: true;
    data: {
        organizations: Organization[];
    };
};

export type GetOrganizationResponse = {
    success: true;
    data: {
        organization: Organization;
    };
};

export type UpdateOrganizationPayload = {
    name?: string;
};

export type UpdateOrganizationResponse = {
    success: true;
    data: {
        organization: Organization;
    };
};

export type DeleteOrganizationResponse = {
    success: true;
    data: {
        message: string;
    };
};

// Create a new organization.
export async function createOrganization(
    payload: CreateOrganizationPayload,
): Promise<CreateOrganizationResponse> {
    const response =
        await api.post<CreateOrganizationResponse>(
            "/organizations",
            payload,
        );

    return response.data;
}

// Get all organizations available to the currently authenticated user.
export async function getOrganizations(): Promise<ListOrganizationsResponse> {
    const response =
        await api.get<ListOrganizationsResponse>(
            "/organizations",
        );

    return response.data;
};

// Get a single organization by ID.
export async function getOrganization(
    organizationId: string,
): Promise<GetOrganizationResponse> {
    const response =
        await api.get<GetOrganizationResponse>(
            `/organizations/${organizationId}`,
        );

    return response.data;
};

// Update an organization.
export async function updateOrganization(
    organizationId: string,
    payload: UpdateOrganizationPayload,
): Promise<UpdateOrganizationResponse> {
    const response =
        await api.patch<UpdateOrganizationResponse>(
            `/organizations/${organizationId}`,
            payload,
        );

    return response.data;
};

// Delete an organization.
export async function deleteOrganization(
    organizationId: string,
): Promise<DeleteOrganizationResponse> {
    const response =
        await api.delete<DeleteOrganizationResponse>(
            `/organizations/${organizationId}`,
        );

    return response.data;
};