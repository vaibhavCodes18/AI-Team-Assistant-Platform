import api from "./axios";

export const getWorkspaceProjects = async(workspaceId) => {
    const response = await api.get(`/v1/projects/workspaces/${workspaceId}`);
    return response.data;
}

export const createProject = async(projectData) => {
    const response = await api.post(`/v1/projects`, projectData);
    return response.data;
}

export const updateProject = async (projectId, updatedData) => {
    const response = await api.put(`/v1/projects/${projectId}`, updatedData);
    return response.data;
}
export const deleteProject = async (projectId) => {
    const response = await api.delete(`/v1/projects/${projectId}`);
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

export const removeProjectMember = async (projectId, userId) => {
    const response = await api.delete(`/v1/projects/${projectId}/member/${userId}`);
    return response.data;
};

export const updateProjectMemberRole = async (projectId, userId, roleData) => {
    const response = await api.patch(`/v1/projects/${projectId}/member/${userId}/role`, roleData);
    return response.data;
};