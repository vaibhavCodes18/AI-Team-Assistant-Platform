import api from "./axios";

export const getAllWorkspaces = async () => {
    const response = await api.get("/v1/workspaces");
    return response.data;
}

export const createWorkspace = async (workspaceData) => {
    const response = await api.post("/v1/workspaces", workspaceData);
    return response.data;
}

export const getWorkspaceById = async (workspaceId) => {
    const response = await api.get(`/v1/workspaces/${workspaceId}`);
    return response.data;
}