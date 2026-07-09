import api from "./axios";

export const getAllWorkspaces = async () => {
    const response = await api.get("/v1/workspaces");
    console.log("Workspaces:", response.data);
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

export const updateWorkspace = async (workspaceId, workspaceData) => {
    console.log(workspaceData);
    
    const response = await api.put(`/v1/workspaces/${workspaceId}`, workspaceData);
    return response.data;
}

export const deleteWorkspace = async (workspaceId) => {
    console.log(workspaceId);
    
    const response = await api.delete(`/v1/workspaces/${workspaceId}`);
    return response.data;
}

export const inviteMember = async (workspaceId, memberData) => {
    const response = await api.post(`/v1/workspaces/${workspaceId}/members`, memberData);
    return response.data;
}