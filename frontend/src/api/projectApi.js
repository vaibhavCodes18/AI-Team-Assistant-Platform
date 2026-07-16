import api from "./axios";

export const getWorkspaceProjects = async(workspaceId) => {
    const response = await api.get(`/v1/projects/workspaces/${workspaceId}`);
    return response.data;
}

export const createProject = async(projectData) => {
    const response = await api.post(`/v1/projects`, projectData);
    return response.data;
}

export const getProjectMembers = async (projectId) => {
    const response = await api.get(`/v1/projects/${projectId}/members`);
    return response.data;
}

export const getProjectById = async (projectId) => {
    const response = await api.get(`/v1/projects/${projectId}`);
    return response.data;
};

export const inviteUserToProject = async (projectId, inviteData) => {
    const response = await api.post(`/v1/projects/${projectId}/invite`, inviteData);
    return response.data;
};

export const getProjectTasks = async (projectId, params) => {
    const response = await api.get(`/v1/projects/${projectId}/tasks`, { params });
    return response.data;
};