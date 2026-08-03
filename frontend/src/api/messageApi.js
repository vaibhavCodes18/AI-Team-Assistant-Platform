import api from "./axios";

export const getProjectMessages = async (projectId, pageNumber = 0, size = 10) => {
    const response = await api.get(`/v1/chat/project/${projectId}?page=${pageNumber}&size=${size}`);
    return response.data;
};

export const getTicketMessages = async (ticketId, pageNumber = 0, size = 10) => {
    const response = await api.get(`/v1/chat/ticket/${ticketId}?page=${pageNumber}&size=${size}`);
    return response.data;
};