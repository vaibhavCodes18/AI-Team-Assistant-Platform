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

export const updateWorkspace = async (workspaceId, workspaceData) => {
    
    const response = await api.put(`/v1/workspaces/${workspaceId}`, workspaceData);
    return response.data;
}

export const deleteWorkspace = async (workspaceId) => {
    
    const response = await api.delete(`/v1/workspaces/${workspaceId}`);
    return response.data;
}

export const getAllWorkspaceMembers = async(workspaceId) => {
    const response = await api.get(`/v1/workspaces/${workspaceId}/members`);
    return response.data;
}

export const inviteMember = async (workspaceId, memberData) => {
    const response = await api.post(`/v1/workspaces/${workspaceId}/members`, memberData);
    return response.data;
}

export const removeWorkspaceMember = async (workspaceId, userId) => {
    const response = await api.delete(`/v1/workspaces/${workspaceId}/members/${userId}`);
    return response.data;
};

export const updateWorkspaceMemberRole = async (workspaceId, userId, roleData) => {
    const response = await api.patch(`/v1/workspaces/${workspaceId}/members/${userId}/role`, roleData);
    return response.data;
};


