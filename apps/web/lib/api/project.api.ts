import { api } from "./axios";

export type Project = {
    id: string;
    organizationId: string;
    name: string;
    slug: string;
    description?: string | null;
    createdAt: string;
    updatedAt: string;
};

export type CreateProjectPayload = {
    name: string;
    description?: string;
};

export type CreateProjectResponse = {
    success: true;
    data: {
        project: Project;
    };
};

export type ListProjectsResponse = {
    success: true;
    data: {
        projects: Project[];
    };
};

export type GetProjectResponse = {
    success: true;
    data: {
        project: Project;
    };
};

export type UpdateProjectPayload = {
    name?: string;
    description?: string
}

export type UpdateProjectResponse = {
    success: true;
    data: {
        project: Project;
    };
};


// Create a new project inside an organization.
export async function createProject(
    organizationId: string,
    payload: CreateProjectPayload,
): Promise<CreateProjectResponse> {
    const response = await api
        .post<CreateProjectResponse>(
            `/organizations/${organizationId}/projects`,
            payload
        );

    return response.data;
};

// Get all projects belonging to an organization.
export async function getProjects(
    organizationId: string
): Promise<ListProjectsResponse> {
    const response = await api
        .get<ListProjectsResponse>(
            `/organizations/${organizationId}/projects`
        );

    return response.data;
};

// Get a single project by ID.
export async function getProject(
    projectId: string
): Promise<GetProjectResponse> {
    const response = await api.get<GetProjectResponse>(`/projects/${projectId}`);
    return response.data;
};

// Update a project.
export async function updateProject(
    projectId: string,
    payload: UpdateProjectPayload
): Promise<UpdateProjectResponse>{
    const response = await api.patch<UpdateProjectResponse>(`/projects/${projectId}`, payload);

    return response.data;
};

// Delete a project.
export async function deleteProject(
    projectId: string
): Promise<void>{
    await api.delete(`/projects/${projectId}`);
};