import api from "./axios";

export const getWorkspaceProjects = async(workspaceId) => {
    const response = await api.get(`/v1/projects/workspaces/${workspaceId}`);
    return response.data;
}

export const createProject = async(projectData) => {
    const response = await api.post(`/v1/projects`, projectData);
    return response.data;
}